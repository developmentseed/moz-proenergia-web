# PRD: Internationalization (i18n) — Portuguese/English Language Support

**Status:** Implemented
**Date:** February 2026
**Branch:** `add/i18n-test`

---

## 1. Problem Statement

The Mozambique Proenergia+ IEP platform serves users in Mozambique, where Portuguese is the official language and the primary working language of the platform's intended audience (government planners, energy analysts, and local operators). All UI text was previously hardcoded in English, creating a language barrier for end users. Additionally, all strings were embedded directly in component code, making future translation work expensive and error-prone.

---

## 2. Goals

- **Default to Portuguese.** Users who have never visited the site see the interface in Portuguese immediately, with no action required.
- **Provide a PT/EN toggle.** Users can switch languages at any time from the application header. The preference is persisted across sessions.
- **Externalize all UI strings.** No hardcoded user-facing text remains in component code. All strings live in structured locale files.
- **Follow i18n best practices.** Support interpolation, correct sentence structure (no string concatenation), and a clear namespace/key convention.
- **Translate filter labels.** The data field labels derived from `global-label.json` (Province, District, Technology, etc.) are translated so the filter panel and summary tables read naturally in both languages.
- **Leave API text untranslated by default**, but establish a clear process for how that text should be handled now and in the future.

---

## 3. Non-Goals

- Translation of MDX static content (e.g., the `/about` page body copy). This is a content translation task, handled separately.
- Backend API localization (deferred; process is documented below).
- Additional languages beyond Portuguese and English.
- Right-to-left (RTL) layout support.

---

## 4. Requirements

### 4.1 Functional

| # | Requirement |
|---|-------------|
| F1 | The app defaults to Portuguese (`pt`) on first load. |
| F2 | A language toggle button displaying the current language abbreviation (`PT` / `EN`) is visible in the application header at all times. |
| F3 | Clicking the toggle switches all UI text instantly, without a page reload. |
| F4 | The selected language is persisted in `localStorage` under the key `'language'` and restored on subsequent visits. |
| F5 | All user-facing strings (navigation, buttons, labels, error messages, placeholders, ARIA labels) are translated in both `en` and `pt`. |
| F6 | Filter field labels and descriptions (sourced from `global-label.json`) are translated via translation file entries keyed by the API column name. |
| F7 | Translation keys use structured, nested naming (`feature.context.element`, e.g., `auth.login.submit`) — never raw sentence strings. |
| F8 | Interpolated strings use ICU-style placeholders (`{{variable}}`) — strings are never constructed by concatenation. |
| F9 | String lookup falls back to English when a Portuguese translation is missing. |

### 4.2 Technical

| # | Requirement |
|---|-------------|
| T1 | Library: `i18next` + `react-i18next` + `i18next-browser-languagedetector`. |
| T2 | Compatible with `output: 'export'` (static site generation). No middleware dependency. |
| T3 | Locale files are located at `src/i18n/locales/{en,pt}.json`. One file per locale, ISO 639-1 naming. |
| T4 | The i18next instance is initialized as a singleton in `src/i18n/config.ts` and provided to the React tree via `src/i18n/provider.tsx`. |
| T5 | The provider is the outermost wrapper in `src/app/layout.tsx` so all components have access to translations. |
| T6 | No translation logic runs in Server Components. Pages requiring translation are client components (`'use client'`). |
| T7 | TypeScript compiles cleanly with no new errors introduced by this change. |

---

## 5. Translation File Structure

Locale files are flat JSON with nested namespaces. All strings for both locales must be kept in sync (same keys).

```
src/i18n/locales/
  en.json
  pt.json
```

### Top-level namespaces

| Namespace | Covers |
|-----------|--------|
| `nav` | Header navigation links, login/logout, SDI Portal |
| `home` | Landing page heading, description, CTA buttons |
| `auth.login` | Login form fields, validation, success/error messages |
| `auth.logout` | Logout button and confirmation message |
| `explorer` | Model panel, scenario selector, Controls/Layers tabs, filter actions, panel toggle ARIA labels, error states |
| `downloads` | Page breadcrumb, search placeholder, card metadata labels, download button |
| `filters` | Combobox placeholder, selected count, empty state |
| `map` | Legend title, additional layers section title |
| `breadcrumbs` | Page-level breadcrumb labels |
| `labels` | Data field translations keyed by `column` value from `global-label.json` (e.g., `labels.Admin_1.label`, `labels.PopStartYear.description`) |

### Key naming convention

```
{namespace}.{context}.{element}
```

Examples:
- `auth.login.submit` → "Sign In" / "Entrar"
- `explorer.areaSelection` → "Area Selection" / "Seleção de Área"
- `labels.ElecStart.label` → "Electrification Status" / "Status de Eletrificação"

---

## 6. API Text Handling

### What is NOT translated

The following text originates from the backend API and is rendered as-is:

- **Model names and descriptions** (e.g., "IEP Study - North")
- **Scenario names and descriptions** (e.g., "Baseline 2030")
- **Vector layer names and descriptions** (displayed on the Downloads page)
- **Settlement feature values** (cluster popup field values)

These strings are returned by the API and mapped into component props. They do not pass through `t()` and are not present in locale files.

### Short-term process (frontend translation files)

For content that is static or infrequently updated:

1. Create `src/i18n/locales/api/pt.json` with manually translated versions of known API strings.
2. Use `t('api.models.<id>.name', { defaultValue: apiResponse.name })` in the component, so the English API value is shown as a fallback when no translation exists.
3. Update `src/i18n/locales/api/pt.json` whenever a new model or scenario is added.

**Use this approach when:** Content is managed by the same team as the frontend, changes rarely (< a few times per year), and the total string count is small (< ~100).

### Long-term process (backend localization)

For content stored in a database or managed by non-developers:

1. Add a `lang` query parameter (or `Accept-Language` header) to API endpoints.
2. The backend returns localized versions of text fields based on the requested locale.
3. On the frontend, add a single Axios request interceptor in `src/utils/api.ts` that attaches `params.lang = i18next.language` to every outgoing request. This requires no changes to individual components.

**Use this approach when:** Content is database-driven, changes frequently, is managed outside the codebase, or the volume of strings makes manual frontend maintenance impractical.

### Decision criteria summary

| Factor | Frontend files | Backend configuration |
|--------|---------------|----------------------|
| Content changes | Rarely (< quarterly) | Frequently |
| Who manages it | Dev team | Content/operations team |
| Volume | Small (< 100 strings) | Large or unbounded |
| API ownership | Third-party / no access | First-party |

---

## 7. Out-of-Scope Items and Future Work

- **`/about` page MDX content:** Requires creating `src/app/about/content.en.mdx` and `src/app/about/content.pt.mdx`. The page component would select the file based on `i18n.language`. Tracked separately.
- **`html[lang]` attribute:** Currently hardcoded to `"pt"` in `src/app/layout.tsx`. With a static export, this cannot be set dynamically at the document level without client-side DOM manipulation after hydration (e.g., updating `document.documentElement.lang` in the I18nProvider). Consider adding this enhancement if accessibility tooling requires it.
- **Backend API localization:** Described above; depends on API team capacity.
- **Additional locales:** The architecture supports adding any new locale by adding `src/i18n/locales/{locale}.json` and registering it in `src/i18n/config.ts`.
