import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // CV photos are base64 data URLs rendered in static-export templates;
    // next/image can't optimize them, so <img> is the correct element here.
    files: ["src/templates/**", "src/components/editor/BasicsForm.tsx", "src/components/AppHeader.tsx"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored / copied third-party bundles
    "public/pdf.worker.min.mjs",
  ]),
]);

export default eslintConfig;
