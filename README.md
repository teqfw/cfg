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

## Development and Ecosystem

This product is developed by AI agents under the direction of Alex Gusev, following the Agent-Driven Software Management (ADSM) methodology. It is built for the Tequila Framework (TeqFW) platform and contributes to its ecosystem.

- [Tequila Framework](https://teqfw.com/)
- [Alex Gusev's Personal Website](https://wiredgeese.com/)
- [Alex Gusev's Telegram Channel](https://t.me/alexgusev_lab_en)
- [Agent-Driven Software Management: A Practical Guide](http://fly.wiredgeese.com/flancer/leanpub/adsm-en/)
