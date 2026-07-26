import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Dev-only screenshot/audit tooling run via tsx, not part of the app
    // build: needs @ts-nocheck + transitive require()s (playwright-core is
    // not a direct devDependency), both of which the app-wide rules ban.
    "scripts/design-audit/**",
  ]),
]);

export default eslintConfig;
