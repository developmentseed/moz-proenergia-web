export const WEBSITE_TITLE = "Plataforma Integrada de Electrificação de Moçambique - PIE";
export const WEBSITE_DESC = "Uma plataforma web para planejamento e análise integrada de energia em Moçambique. O Proenergia+ IEP visa aumentar o acesso à energia e serviços de banda larga nas áreas do projeto e fortalecer o desempenho operacional da concessionária elétrica.";
export const SDI_PORTAL_BASE_URL = process.env.NEXT_PUBLIC_BASE_PATH ? "/" : "https://proenergia-staging.ds.io/";
export const USER_GUIDE_URL = "https://developmentseed.org/moz-proenergia-docs/";

// BASE_PATH is set via the `NEXT_PUBLIC_BASE_PATH` env var at build time.
// The `build-prod` npm script (used by Netlify) sets it to `/app`.
// `pnpm dev` and `pnpm build` leave it unset, so the app runs at the root.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';
