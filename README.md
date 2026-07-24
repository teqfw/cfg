# @teqfw/cfg

`@teqfw/cfg` is a configuration plugin for [Tequila Framework (TeqFW)](https://teqfw.com/). It loads explicitly selected configuration sources into a stable runtime snapshot and makes namespace-based configuration available through the TeqFW dependency-injection container.

The package is designed for native ECMAScript modules, Node.js, and composition by AI agents as well as developers: configuration acquisition, precedence, lifecycle, and error boundaries are explicit rather than hidden behind global initialization.

## What It Provides

- ordered loading from programmatic objects, `process.env`, dotenv files, or custom sources;
- atomic publication of a deeply immutable raw snapshot;
- detached namespace projections for application components;
- deterministic precedence: later complete keys replace earlier values;
- a TeqFW DI contract under the `TeqFw_Cfg_` namespace.

Application-specific schema validation, type conversion, defaults, and secret-management policy remain with the consuming application.

## TeqFW Platform

This package is a plugin of the Tequila Framework (TeqFW) platform. It declares its namespace in `package.json`, allowing a TeqFW composition root to discover and link its modules through `@teqfw/di`.

The agent-facing contract shipped in [`ai/`](./ai/) documents supported components, source and value rules, lifecycle semantics, errors, and canonical integration patterns. Start with [`ai/usage.md`](./ai/usage.md) or the machine-readable [`ai/package-api.ts`](./ai/package-api.ts).

## Development Approach

The code and accompanying agent documentation are developed by agents using ADSM — Agent Driven Software Management. This package, the TeqFW platform, and the ADSM methodology are the work of Alex Gusev. The approach treats agents as first-class participants in a disciplined engineering process: contracts are explicit, contexts are maintained close to the code, and runtime behavior is verified rather than assumed.

It is a practical direction for teams building durable software with modern AI-assisted development methods, while preserving the engineering standards expected of production systems.

## Author And Ecosystem

Alex Gusev develops TeqFW and related software-engineering practices.

- [Tequila Framework](https://teqfw.com/)
- [Wired Geese](https://wiredgeese.com/)
- [Alex Gusev Lab on Telegram](https://t.me/alexgusev_lab_en)

## Repository Layout

- `src/` — package implementation modules.
- `test/` — unit, integration, acceptance, and publish checks.
- `ai/` — distributable agent-facing package documentation.
- `ctx/` — reserved mount point for the separate project cognitive-context repository.

## Development

The package targets Node.js 20 or newer and uses ECMAScript modules. Run the complete verification suite with:

```sh
npm test
```
