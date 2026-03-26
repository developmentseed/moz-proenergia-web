# Language & Translation Guide

The app supports **Portuguese** (default) and **English**. Users switch via the PT/EN toggle in the header; the preference is saved in `localStorage`.

There are three translation mechanisms depending on the type of content:

| Content type | Mechanism | Where translations live |
|---|---|---|
| UI strings (buttons, labels, messages) | i18next locale JSON files | `src/i18n/locales/{en,pt}.json` |
| Backend data (model/scenario/layer names) | `_pt` API fields registered at runtime | `src/utils/data-transformation.ts` |
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
- `labels.ElecStart.label` → "Electrification Status" / "Status de Eletrificação"

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
| `labels` | Data field labels keyed by column name (e.g. `labels.Admin_1.label`) |

If your feature doesn't fit an existing namespace, add a new top-level key to both JSON files and add a row to this table.

---

## Backend Data

Model names, scenario names, and layer names come from the API with `_pt` companion fields (e.g. `name` + `name_pt`). These are registered into the i18next store at data-load time so components can read them with `t()`.

### How it works

In `src/utils/data-transformation.ts`, the helper `registerI18nResource()` from `src/utils/i18n.ts` writes both values into the i18next runtime store:

```ts
registerI18nResource(`model.${m.id}`, {
  name: { en: m.name, pt: m.name_pt },
  description: { en: m.description, pt: m.description_pt },
});
```

Components then read with a fallback:

```tsx
t(`model.${model.id}.name`, { defaultValue: model.name })
```

### Currently registered entities

| Entity | Key pattern | API fields |
|--------|-------------|------------|
| Model | `model.{id}.name`, `model.{id}.description` | `name_pt`, `description_pt` |
| Scenario | `scenario.{id}.name`, `scenario.{id}.description` | `name_pt`, `description_pt` |
| Vector layer | `layer.{sourceId}.label`, `layer.{sourceId}.description` | `name_pt`, `description_pt` |

### Adding a new entity type (How to register language source from backend response)

If the API adds `_pt` fields to a new entity:

1. In `src/utils/data-transformation.ts`, call `registerI18nResource()` when processing it:

   ```ts
   registerI18nResource(`widget.${w.id}`, {
     name: { en: w.name, pt: w.name_pt },
   });
   ```

2. In the component, read with `t()`:

   ```tsx
   t(`widget.${widget.id}.name`, { defaultValue: widget.name })
   ```

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
- [ ] No user-facing string is hardcoded in JSX — use `t()`.
- [ ] Components using `t()` or `useTranslation` are marked `"use client"`.
- [ ] Strings use `{{variable}}` interpolation, not concatenation.
