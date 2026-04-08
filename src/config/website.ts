export const WEBSITE_TITLE = "Plataforma Integrada de Electrificação de Moçambique - PIE";
export const WEBSITE_DESC = "Proenergia";
export const SDI_PORTAL_URL = "https://proenergia-staging.ds.io/admin/";

// BASE_PATH is set via the `NEXT_PUBLIC_BASE_PATH` env var at build time.
// The `build-prod` npm script (used by Netlify) sets it to `/app`.
// `pnpm dev` and `pnpm build` leave it unset, so the app runs at the root.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';