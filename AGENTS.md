# AGENTS.md

`@ponchopay/pp-nodejs` is a small ESM library (not an app). Public surface is only what `src/index.ts` re-exports: `createToken`, `createJWT`, `Client`, `Weekday`, `PaymentMethodType`. Do not export `Api`, `PPError`, or utils without an explicit request.

## Commands

- `npm test` — `vitest run` against `src/`, not `dist`. One file: `npx vitest run test/client.spec.ts`. No `vitest.config`; tests do not hit the network (`node-fetch` / `Api` are mocked).
- `npm run lint` — ESLint then Prettier `--check`. `npm run format` fixes both. Prettier: `singleQuote`, `arrowParens: avoid`.
- `npm run build` — `rimraf dist && tsc &&` sed-replace placeholders. `jq` is required. Do not treat `tsc` alone as a release build.
- TypeScript 7 ships no JS API, so `typescript` is an npm alias for `@typescript/typescript6` (used by typescript-eslint, binary `tsc6`) and TS 7 is installed as `@typescript/native` (binary `tsc`, used by the build). Keep both aliases.
- There is no typecheck script. `tsconfig.json` `include` is `src/**/*.ts` only, so tests are not compiled by `tsc`.

## Source vs published package

- `"type": "module"`. Local imports in `src/` must use the `.js` suffix (`./token.js`). Tests import extensionless paths (`../src/client`, `vi.mock('../src/api', …)`). Do not "fix" one style to match the other.
- `rootDir` is `.` and `outDir` is `dist`, so the package entry is `dist/src/index.js` (and `.d.ts`). `files` publishes only `dist/src`. `dist/` is gitignored.
- `telemetry()` in `src/utils.ts` must keep the literal placeholders `##NAME##` and `##VERSION##`. `npm run patch` rewrites them in `dist` from `package.json`. Changing those strings breaks the published telemetry header.
- `example/` is a separate package (`file:../`) that imports the built package. Build before running it.

## Behaviour that tests lock in

- HTTP goes through `node-fetch`, not global `fetch`, with `redirect: 'manual'`. Initiate endpoints expect `302` + `Location`; mutations expect `204`.
- Default API base is `https://pay.ponchopay.com/`. Demo (see `example/index.js`) is `https://demo.ponchopay.com/`.
- Amounts are minor units (pence). `createJWT` expires in `5s`. `createToken` is base64 SHA-256 of `` `${metadata}.${key}` ``.
- `serialise({})` returns `''`, not `{}`. `Date` becomes ISO-8601; `Set` becomes an array. Keep the British spellings `serialise` / `deserialise`.
- Callback signatures are HMAC-SHA256 (base64) of the raw body, header name `signature`.
