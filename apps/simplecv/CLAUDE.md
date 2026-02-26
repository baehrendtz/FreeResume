# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build (static export)
npm run lint         # ESLint
npx tsc --noEmit     # Type-check without emitting
```

No test framework is configured. The PDF worker must exist in `public/` — it's copied via postinstall (`cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/`).

## Architecture

SimplCV is a **Next.js App Router** application that converts LinkedIn PDF exports into professional, single-page CVs. It builds as a **static export** (`output: "export"` in next.config.ts) with no server runtime.

### Data flow

```
LinkedIn PDF → pdfjs-dist → parseLinkedInPdf() → CvModel
                                                      ↓
CvModel + DisplaySettings + TemplateMeta → buildRenderModel() → RenderModel → Template component → CvPreview
                                                                                                       ↓
                                                                                    MeasureView → LayoutMetrics → fitToTemplate() (iterative)
```

### Key concepts

- **CvModel** (`src/lib/model/CvModel.ts`): Zod-validated source data, stored in React state and sessionStorage.
- **DisplaySettings** (`src/lib/model/DisplaySettings.ts`): User-controlled content limits (maxExperience, maxBulletsPerJob, summaryMaxChars, etc.).
- **RenderModel** (`src/lib/fitting/types.ts`): Read-only, trimmed data passed to template components. Built by `buildRenderModel()` — a pure function that applies template capabilities → section visibility → display limits → policy limits → text truncation.
- **TemplateMeta** (`src/templates/templateRegistry.ts`): Each template declares capabilities (supportsPhoto, supportsSidebar) and a content policy (maxSummaryChars, maxBulletChars, priorities). Templates are lazy-loaded via `React.lazy()`.
- **fitToTemplate** (`src/lib/fitting/fitToTemplate.ts`): Iterative algorithm that reduces content (bullets → summary → skills → education → experience → hide sections) until the CV fits one page. Called in a loop driven by `MeasureView` metrics.

### CV preview rendering

The preview is always rendered at A4 dimensions (794×1123px at 96 DPI) with a CSS scale transform. The `cv-preview-light` class ensures light theme regardless of app dark mode. PDF export uses `html2canvas-pro` at 3x scale → `jsPDF`.

### i18n

Uses `next-intl` with URL-based locale routing (`/[locale]/...`). Messages in `src/i18n/messages/{en,sv}.json`. All user-facing strings go through `useTranslations()`. Labels are passed as props from `page.tsx` down to editor components.

### LinkedIn PDF parsing

`src/lib/parser/linkedinParser.ts` detects two-column layout (sidebar vs main), builds lines from positioned text items, then parses sections using `sectionDetector.ts` which maps headers to section types in both English and Swedish.

### Editor

Form state is managed via `react-hook-form` with `zodResolver(cvModelSchema)`. The editor uses a wizard sidebar (`WizardSidebar`) with step-based navigation. Each section (Experience, Education, Skills, etc.) has its own form component. Changes propagate to the parent via `watch()` subscription with 150ms debounce.

### Session persistence

CV data, templateId, and displaySettings are saved to sessionStorage on every change and restored on mount.

## Conventions

- All components that use hooks or browser APIs are marked `"use client"`.
- Path alias: `@/*` maps to `src/*`.
- UI components are from shadcn/ui (`src/components/ui/`) with `new-york` style.
- Icons: lucide-react exclusively.
- Validation: Zod v4 (`zod/v4` import path).
- Templates declare their own capabilities and policies — the render pipeline adapts automatically.
- `hidden` field on experience/education entries: optional boolean that hides the entry from the rendered CV without deleting it. Filtered in `buildRenderModel()` before slicing.

## Code Quality Standards

- **DRY**: Extract reusable components when the same pattern appears 2+ times. Shared UI: `NumericStepper`, `ColorPickerField`, `SettingsSection`.
- **YAGNI**: Do not write code for hypothetical future needs. Only add what is currently required.
- **Constants**: All magic numbers must be defined in `src/lib/constants.ts` — never inline numeric literals for dimensions, limits, or ranges.
- **Error handling**: Always log unexpected errors. Only silence expected errors (QuotaExceeded for sessionStorage, GA blockers).
- **Naming**: Use `parse*()` for all parsing functions consistently. Use `resolve*()` for lookup/resolution functions.
- **Shared logic**: Company grouping logic lives in `src/lib/model/groupExperience.ts` — use `assignCompanyGroupIds()` everywhere.
