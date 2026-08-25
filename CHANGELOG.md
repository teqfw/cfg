# Changelog

## [2.1.0] - 2026-08-25

### Added (2.1.0)

- Added optional `TeqFw_Cfg_Log_Policy$` integration that loads the conventional host logging policy file after configuration is ready, including explicit override and stable configuration errors.
- Added the `CfgError` static type contract and the logging-policy error codes to the public type and error surfaces.
- Added focused unit tests mapped one-to-one to package modules and integration coverage for the installed npm `@teqfw/log` plugin.

### Changed (2.1.0)

- Updated `@teqfw/log` to the npm dependency range `>=2.1.0`; `@teqfw/di` is now supplied transitively through it instead of being declared as a development dependency.
- Updated the distributed Agent Skill and README usage guidance to inject cfg components into the host composition root, including optional logging policy behavior.
- Simplified Reader dependencies and Store internals without changing the immutable configuration snapshot contract.

## [2.0.0] - 2026-08-05

### Added

- Added the distributed `skills/teqfw-cfg` Agent Skill with its `SKILL.md` entry point, self-contained `references/`, and client metadata, replacing the obsolete `ai/` documentation.
- Added `typecheck` and `lint:md` npm scripts with the JSDoc annotation and Markdown linting baseline aligned with `@teqfw/di`.
- Added `typescript-language-server` and `markdownlint-cli2` to the development dependencies.
- Added `.markdownlint.json` with the root Markdown linting rules.
- Added `.opencode/opencode.json` enabling LSP for the opencode agent.
- Added the `TeqFw_Cfg_Store_State` type and the `TeqFw_Cfg_NamespaceFragment` alias to `types.d.ts`.

### Changed

- Migrated package metadata from `teqfw.namespaces` to the array-only `teqfw.fw.di.namespaces` schema used by the current TeqFW DI container.
- Switched the `@teqfw/di` development dependency from the GitHub branch alias to the npm registry range `>=2.9.0` and added `@teqfw/log` as `>=2.0.0`.
- Aligned `jsconfig.json` with the `@teqfw/di` baseline: enabled `strict` and pointed the TypeScript server at the installed dependency sources and type files (`node_modules/@teqfw/*/src` + `node_modules/@teqfw/*/types.d.ts`).
- Reworked `README.md` to the TeqFW promotion pattern: npm and jsDelivr usage badges, the "Human-governed. Agent-built. Agent-ready." positioning, and the closing Agent-Driven Development section with the version-matched skill-mount command.
- Reading configuration before loading now returns an immutable empty snapshot, so namespace Readers return detached empty fragments and configuration is optional.
- Prepared the plugin for DI 2.8: namespace mappings declared as an array and dependencies resolved through the current container semantics.
- Aligned `types.d.ts` global type aliases with the JSDoc annotations used by `src/**` and the ESM validator conventions.

## [0.1.0] - 2026-07-24

### Added (0.1.0)

- Added the initial repository and npm package layout for `@teqfw/cfg`.
