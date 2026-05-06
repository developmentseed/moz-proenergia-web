# Language & Translation Guide

The app supports **Portuguese** (default) and **English**. Users switch via the PT/EN toggle in the header; the preference is saved in `localStorage`.

There are three translation mechanisms depending on the type of content:

| Content type | Mechanism | Where translations live |
|---|---|---|
| UI strings (buttons, labels, messages) | i18next locale JSON files | `src/i18n/locales/{en,pt}.json` |
| Backend data (model/scenario/layer names) | `_pt` fields read directly via `useLocalize` | `src/utils/i18n.ts` |
| Long-form page content | Locale-specific MDX files | `src/app/<page>/<slug>.pt.mdx` |

---

## UI Strings

### Adding a string

1. Add the key to **both** `src/i18n/locales/en.json` and `src/i18n/locales/pt.json`:

   ```jsonc
   // en.json
   { "explorer": { "newButton": "Click me" } }

   // pt.json
   { "explorer": { "newButton": "Clique aqui" } }
   ```

2. Use the key in your component (must be a `"use client"` component):

   ```tsx
   import { useTranslation } from "react-i18next";

   function MyComponent() {
     const { t } = useTranslation();
     return <button>{t("explorer.newButton")}</button>;
   }
   ```

3. For dynamic values, use `{{variable}}` placeholders — never concatenate:

   ```jsonc
   // en.json
   { "filters": { "selected": "{{count}} selected" } }
   ```
   ```tsx
   t("filters.selected", { count: 5 })
   ```

### Key naming convention

Keys follow `{namespace}.{context}.{element}`:

- `auth.login.submit` → "Sign In" / "Entrar"
- `explorer.areaSelection` → "Area Selection" / "Seleção de Área"

### Existing namespaces

| Namespace | Covers |
|-----------|--------|
| `nav` | Header navigation links, login/logout, SDI Portal |
| `home` | Landing page heading, description, CTA buttons |
| `auth.login` | Login form fields, validation, success/error |
| `auth.logout` | Logout button and confirmation |
| `explorer` | Model panel, scenario selector, Controls/Layers tabs, filter actions, error states |
| `downloads` | Search placeholder, card metadata, download button |
| `filters` | Combobox placeholder, selected count, empty state |
| `map` | Legend title, additional layers |
| `models` | Model page strings |
| `breadcrumbs` | Page-level breadcrumb labels |

If your feature doesn't fit an existing namespace, add a new top-level key to both JSON files and add a row to this table.

---

## Backend Data

Model names, scenario names, layer names, and field labels come from the API with `_pt` companion fields (e.g. `name` + `name_pt`). Components pick the right value using the `useLocalize` hook, falling back to English when the `_pt` field is absent or null.

### How it works

`src/utils/i18n.ts` exports a single hook:

```ts
import { useLocalize } from "@/utils/i18n";

function MyComponent({ layer }: { layer: Layer }) {
  const localize = useLocalize();
  return <Text>{localize(layer.label, layer.label_pt)}</Text>;
}
```

`localize(en, pt)` returns `pt` when the active language is Portuguese and `pt` is non-empty, otherwise returns `en`.

Reactivity is automatic: `useLocalize` calls `useTranslation()` internally, so the component re-renders whenever the user switches language.

### API fields by entity

| Entity | EN field | PT field |
|--------|----------|----------|
| Model (group list) | `name`, `description` | `name_pt`, `description_pt` |
| Model (detail) | `name`, `description` | `name_pt`, `description_pt` |
| Scenario | `name` / `label`, `description` | `name_pt`, `description_pt` |
| Vector / raster layer | `label`, `description` | `label_pt`, `description_pt` |
| Filter / popup / summary field | `label`, `description` | `label_pt`, `description_pt` |

### Adding a new entity type

If the API adds `_pt` fields to a new entity:

1. Add `label_pt?: string` and `description_pt?: string` (or `name_pt`) to the TypeScript type.

2. Pass them through in `src/utils/data-transformation.ts` (or `cog.ts` for rasters) — no registration needed, just include them on the object.

3. In the component, call `useLocalize`:

   ```tsx
   const localize = useLocalize();
   return <Text>{localize(widget.name, widget.name_pt)}</Text>;
   ```

### Missing translations

If a `_pt` field is `null` or absent in the API response, `localize()` automatically falls back to the English value. No special handling is needed in components. To fix a missing translation, populate the `_pt` field in the backend admin.

---

## MDX Content Pages

Long-form content pages (like `/about`) use locale-specific MDX files instead of translation keys.

### File naming convention

```
src/app/<page>/<slug>.mdx        ← English (default)
src/app/<page>/<slug>.pt.mdx     ← Portuguese
```

### Page component pattern

Import both files and switch based on the active language:

```tsx
"use client";

import { useTranslation } from "react-i18next";
import ContentEn from "./about.mdx";
import ContentPt from "./about.pt.mdx";

export default function Page() {
  const { i18n } = useTranslation();
  const Content = i18n.language?.startsWith("pt") ? ContentPt : ContentEn;

  return <Content />;
}
```

### Current MDX pages

| Page | English | Portuguese |
|------|---------|------------|
| `/about` | `src/app/about/about.mdx` | `src/app/about/about.pt.mdx` |

---

## Checklist

For any i18n change, verify:

- [ ] Both `en.json` and `pt.json` have the same keys (missing keys fall back to English silently).
- [ ] No user-facing string is hardcoded in JSX — use `t()` for UI strings, `useLocalize` for data fields.
- [ ] Components using `t()`, `useTranslation`, or `useLocalize` are marked `"use client"`.
- [ ] Strings use `{{variable}}` interpolation, not concatenation.
- [ ] New API entity types have `_pt` fields on their TypeScript type and are passed through data-transformation.
