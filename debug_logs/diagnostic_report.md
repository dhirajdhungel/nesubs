# Diagnostic report — workspace problems

Date: 2026-04-23

Summary
-------
- Reported problems: 105 (as reported by the workspace error collector).
- Goal: determine the causes, apply low-risk fixes, and produce an actionable plan to resolve the rest so the project can be run locally (frontend + Deno backend).

What I changed so far (quick wins applied)
-----------------------------------------
- Added `tsconfig.json` to the repository root to provide a consistent TypeScript config for the mixed frontend/backend code.
- Added `src/env.d.ts` (references `vite/client`) so `import.meta.env` is recognized in the frontend.
- Added `types/deno-npm.d.ts` to supply ambient declarations for:
  - `Deno` global (declared as `any`),
  - `npm:*` module specifiers,
  - `jsr:*` module specifiers,
  - Absolute-style `/utils/*` imports used in some files.

Why these changes
------------------
- The project mixes a Vite/React frontend (Node/npm toolchain) and a Deno-based server under `supabase/functions/server`. TypeScript in an editor or CI often runs under a Node toolchain and will surface many type/resolve errors for the Deno files and non-standard import specifiers (like `npm:hono` and remote `https://deno.land/...`). The ambient declarations and tsconfig relaxations reduce false-positive errors so we can triage the real issues.

Top problem categories (root causes)
-----------------------------------
1) Missing Vite types for import.meta.env
   - Example errors: "Property 'env' does not exist on type 'ImportMeta'"
   - Cause: TypeScript not seeing Vite's `ImportMetaEnv` typings.
   - Fix applied: `src/env.d.ts` (/// <reference types="vite/client" />).

2) Cross-runtime imports and specifiers (Deno "npm:" / "jsr:" / remote URLs / node:)
   - Example errors: "Cannot find module 'npm:hono'", "Cannot find module 'jsr:@supabase/supabase-js@2'", "Cannot find module 'https://deno.land/x/postgres@v0.17.0/mod.ts'"
   - Cause: TypeScript (Node-based) attempted to resolve Deno/npm remote specifiers and cannot find their types. The project uses Deno-style imports which Node tsc does not natively resolve.
   - Partial mitigation: `types/deno-npm.d.ts` added to declare `npm:*` and `jsr:*` modules (and declare `Deno: any`). This reduces some type noise but does not substitute for running under Deno.

3) Missing Deno globals / types
   - Example errors: "Cannot find name 'Deno'"
   - Cause: Type checking running in a Node/TS environment that does not include the Deno runtime types.
   - Mitigation: `declare const Deno: any;` in `types/deno-npm.d.ts` to silence the type errors. For a stronger solution, install or include Deno's type declarations when running the Deno code under Deno.

4) Import paths ending with .tsx
   - Example errors: "An import path can only end with a '.tsx' extension when 'allowImportingTsExtensions' is enabled."
   - Cause: The server code imports local TSX files with explicit extensions. The project needed the TS config option `allowImportingTsExtensions` and we set `noEmit` so that option is accepted.

5) Implicit any / unknown in catch variables
   - Example errors: "Parameter 'c' implicitly has an 'any' type." and "'error' is of type 'unknown'"
   - Cause: Strict TS options (noImplicitAny and useUnknownInCatchVariables). For triage I relaxed `noImplicitAny` and set `useUnknownInCatchVariables` false in `tsconfig.json` to reduce the blow-up of trivial type annotations in many files. The permanent solution is to add explicit types (recommended) where appropriate.

6) Absolute root imports (leading slash)
   - Example errors: "Cannot find module '/utils/supabase/info'"
   - Cause: Some code uses an absolute-style import path (leading slash). TypeScript doesn't resolve that by default.
   - Mitigation: We added a `declare module '/utils/*'` in `types/deno-npm.d.ts` to avoid errors; consider converting to relative imports or configure `paths`/`baseUrl` in `tsconfig` for a robust fix.

7) Node builtin and node: imports used in Deno files
   - Example errors: "Cannot find module 'node:crypto'"
   - Cause: Deno supports many Node builtins (or has shims), but TypeScript running under Node may require @types/node or alternative declarations; or the file is intended to run under Deno where node: imports are supported via compatibility.

What remains (and why some errors still appear)
-----------------------------------------------
- Many server-side problems persist because:
  - The server code is written for Deno (uses `Deno.env`, remote imports and `npm:` specifiers) and can't be fully type-checked by Node's TypeScript environment.
  - The workspace where I ran error collection here doesn't have the Deno runtime installed or its types available to the checker.
- Examples of remaining errors you will still see until runtime/types are present:
  - "Cannot find module 'npm:hono'" — these will disappear when the project is type-checked under Deno (or when Deno provides npm interop types) or you add proper ambient module declarations for each module.
  - "Cannot find name 'Deno'" — disappears when Deno types are available (or if the server files are compiled under Deno).

Edits already made in repo (files added)
----------------------------------------
- `tsconfig.json` — workspace TypeScript settings (relaxed checks to triage cross-runtime code).
- `src/env.d.ts` — Vite import.meta.env types.
- `types/deno-npm.d.ts` — ambient declarations for Deno/npm/jsr/absolute imports.

Recommended next steps to reach zero errors
------------------------------------------
1) Install Deno locally and run the Deno-based typecheck and dev server for server code
   - Install Deno: https://deno.land/manual/getting_started/installation
   - When Deno is available, run `deno check` or `deno run --no-check` as appropriate from `supabase/functions/server` to validate Deno imports.

2) (Optional but cleaner) Add more specific ambient module declarations for the npm packages used server-side
   - e.g. `declare module 'npm:hono' { export const Hono: any; }` — this helps TypeScript in editors that do not run Deno.

3) Migrate absolute imports to relative imports or configure `paths` in `tsconfig.json`.

4) Replace remaining in-memory session/OTP stores with Postgres-backed implementations (we already added an initial migration for kv_store). This reduces runtime surprises and removes remaining Supabase coupling.

5) Export app properly from `supabase/functions/server/index.tsx` (dev_server imports a default export) or change `dev_server.ts` to import the named export.

6) Add symbolic TypeScript declarations for remote modules if you want editors/CI to be happy even when Deno isn't present. Example: `types/npm-hono.d.ts` with `declare module 'npm:hono' { export const Hono: any; export type Context = any; }`.

How to reproduce and fully validate locally
-----------------------------------------
1) Ensure Node deps are installed (frontend):
   - `npm install` (or `pnpm install` if you prefer pnpm)

2) Ensure Deno is installed (server):
   - Install Deno (see official docs). Then run:
     - `deno check --unstable --import-map=supabase/functions/server/import_map.json supabase/functions/server` (if you use an import_map)
     - or run the provided dev runner:
       `deno run -A --watch=static,imports supabase/functions/server/dev_server.ts`

3) Set required environment variables (see `.env.example`), create the Postgres DB, and run `db/migrations/001_init.sql` against your DB.

Remaining follow-ups / next work I can do for you
-------------------------------------------------
- Convert server imports to not rely on `.tsx` extension, or keep the `allowImportingTsExtensions` option and ensure Deno runs the code directly.
- Add narrow ambient declarations for frequently used remote modules (e.g. `hono`, `qrcode`, `resend`, `@aws-sdk/client-s3`) so editors do not complain.
- Export the Hono `app` as a default in `index.tsx` (or change dev_server import) so `dev_server.ts` can import it without type errors.
- After Deno is installed: run `deno lint` and `deno test` (if applicable) for the server code and fix any runtime type errors.

Appendix — example of a few representative errors observed
---------------------------------------------------------
- "Property 'env' does not exist on type 'ImportMeta'" — fixed by `src/env.d.ts`.
- "Cannot find module 'npm:hono'" — root cause: Deno/npm interop; can be solved by Deno runtime/types or more specific ambient module declarations.
- "Cannot find name 'Deno'" — root cause: Type checking running in non-Deno environment; mitigated by `declare const Deno: any;` but prefer Deno types.

If you want, next I can:
- A) Install Deno in this environment (if permitted) and run the backend dev server, then fix any runtime errors.
- B) Create per-module ambient declarations for the most-used server-side npm packages to remove the remaining editor errors.
- C) Start migrating server code to be more friendly to Node-based typecheckers (or add a separate tsconfig that excludes server files from Node-based checks and lets Deno handle them).

— End of report
