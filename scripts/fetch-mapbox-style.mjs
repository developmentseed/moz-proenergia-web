#!/usr/bin/env node

/**
 * Fetches a Mapbox style and strips MapLibre-incompatible properties/expressions.
 * mapbox:// URLs are left as-is (handled at runtime by maplibregl-mapbox-request-transformer).
 *
 * This script was used to generate maplibregl compatible styles
 *
 * Usage:
 *   node scripts/fetch-mapbox-style.mjs <mapbox-style-url> <access-token> [output-file]
 *
 * Example:
 *   node scripts/fetch-mapbox-style.mjs mapbox://styles/mapbox/dark-v11 pk.xxmapboxapitokenxx public/basemap-style.json
 */

const [, , styleUrl, accessToken, outputPath] = process.argv;

if (!styleUrl || !accessToken) {
  console.error(
    "Usage: node scripts/fetch-mapbox-style.mjs <mapbox-style-url> <access-token> [output-file]"
  );
  process.exit(1);
}

// ── Fetch the style ─────────────────────────────────────────────────

function mapboxStyleToHttp(url, token) {
  const m = url.match(/^mapbox:\/\/styles\/(.+)$/);
  if (!m) {
    console.error("Expected a mapbox://styles/... URL");
    process.exit(1);
  }
  return `https://api.mapbox.com/styles/v1/${m[1]}?access_token=${token}`;
}

// ── Remove Mapbox-specific expressions ──────────────────────────────

const MAPBOX_ONLY_EXPRESSIONS = new Set([
  "pitch",
  "distance-from-center",
  "measure-light",
]);

function cleanExpression(expr) {
  if (!Array.isArray(expr)) return expr;

  // ["step", ["pitch"], defaultVal, ...] → defaultVal
  if (
    expr[0] === "step" &&
    Array.isArray(expr[1]) &&
    MAPBOX_ONLY_EXPRESSIONS.has(expr[1][0])
  ) {
    return cleanExpression(expr[2]);
  }

  // ["interpolate", [...], ["pitch"], ...] → first output value
  if (
    (expr[0] === "interpolate" || expr[0] === "interpolate-hcl") &&
    Array.isArray(expr[2]) &&
    MAPBOX_ONLY_EXPRESSIONS.has(expr[2][0])
  ) {
    return cleanExpression(expr[4]);
  }

  // Bare ["pitch"] or ["distance-from-center"] → 0
  if (expr.length === 1 && MAPBOX_ONLY_EXPRESSIONS.has(expr[0])) {
    return 0;
  }

  return expr.map((item) => cleanExpression(item));
}

// ── Unsupported layout/paint properties ─────────────────────────────

const UNSUPPORTED_LAYOUT = new Set([
  "text-pitch-alignment",
  "icon-pitch-alignment",
  "symbol-z-elevate",
  "slot",
  "icon-image-cross-fade",
]);

const UNSUPPORTED_PAINT = new Set([
  "icon-color-saturation",
  "icon-color-brightness-min",
  "icon-color-brightness-max",
  "line-occlusion-opacity",
  "fill-extrusion-rounded-roof",
]);

const LAYOUT_RENAMES = {
  "icon-overlap": "icon-allow-overlap",
  "text-overlap": "text-allow-overlap",
};

function cleanProperties(obj, unsupported, renames = {}) {
  if (!obj) return obj;
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (unsupported.has(key)) continue;
    const newKey = renames[key] || key;
    result[newKey] = cleanExpression(value);
  }
  return result;
}

// ── Clean layers ────────────────────────────────────────────────────

function cleanLayer(layer) {
  const cleaned = { ...layer };
  delete cleaned.slot;

  if (cleaned.layout) {
    cleaned.layout = cleanProperties(
      cleaned.layout,
      UNSUPPORTED_LAYOUT,
      LAYOUT_RENAMES
    );
  }
  if (cleaned.paint) {
    cleaned.paint = cleanProperties(cleaned.paint, UNSUPPORTED_PAINT);
  }
  if (cleaned.filter) {
    cleaned.filter = cleanExpression(cleaned.filter);
  }

  return cleaned;
}

// ── Top-level properties to remove ──────────────────────────────────

const UNSUPPORTED_TOP_LEVEL = new Set([
  "fog",
  "projection",
  "created",
  "modified",
  "id",
  "owner",
  "visibility",
  "protected",
  "draft",
  "imports",
  "schema",
  "fragments",
]);

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  const httpUrl = mapboxStyleToHttp(styleUrl, accessToken);
  console.error(
    `Fetching style from ${httpUrl.replace(accessToken, "pk.***")}...`
  );

  const res = await fetch(httpUrl);
  if (!res.ok) {
    console.error(`Failed to fetch style: ${res.status} ${res.statusText}`);
    process.exit(1);
  }

  const style = await res.json();

  // Remove unsupported top-level properties
  for (const prop of UNSUPPORTED_TOP_LEVEL) {
    if (prop in style) {
      console.error(`  Removed top-level "${prop}"`);
      delete style[prop];
    }
  }

  // Clean layers
  if (style.layers) {
    style.layers = style.layers.map(cleanLayer);
  }

  // Verify nothing slipped through
  const output = JSON.stringify(style, null, 2);
  const pitchCheck = output.match(/"pitch"/g);
  const projCheck = output.match(/"projection"/g);
  if (pitchCheck) {
    console.error(
      `  Warning: ${pitchCheck.length} remaining "pitch" references (may be harmless, e.g. landuse class or top-level pitch value)`
    );
  }
  if (projCheck) {
    console.error(`  Warning: "projection" still present`);
  }

  if (outputPath) {
    const { writeFileSync } = await import("fs");
    writeFileSync(outputPath, output);
    console.error(`Written to ${outputPath}`);
  } else {
    process.stdout.write(output);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
