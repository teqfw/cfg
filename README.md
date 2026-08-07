# @teqfw/cfg

![npms.io](https://img.shields.io/npm/dm/@teqfw/cfg)
![jsdelivr](https://img.shields.io/jsdelivr/npm/hm/@teqfw/cfg)

> **Human-governed. Agent-built. Agent-ready.**

`@teqfw/cfg` loads selected configuration sources into one immutable raw snapshot and exposes detached namespace fragments through the TeqFW dependency-injection container, so application packages own their typed settings. It is part of the Tequila Framework ([TeqFW](https://teqfw.com/)): created and evolved by coding agents under the architectural direction and final responsibility of [Alex Gusev](https://github.com/flancer64), and shipped with a version-matched Agent Skill so other agents can understand, integrate, and use it correctly.

## Why use it

> **Configuration should be explicit, ordered, and stable before an application starts.**

Configuration commonly becomes hidden global state. `@teqfw/cfg` makes the boundary explicit:

```text
selected Sources → Loader → immutable raw snapshot → Reader → application settings
```

That enables:

- ordered loading from objects, `process.env`, dotenv files, and custom sources;
- deterministic precedence, with later complete keys replacing earlier values;
- one atomic, deeply immutable raw snapshot after bootstrap, or an empty snapshot when configuration is not loaded;
- DI-resolvable components under the `TeqFw_Cfg_` namespace.

## Quick start

Register the `TeqFw_Cfg_` namespace and load the selected Sources once during bootstrap:

```js
import Container from '@teqfw/di';

const container = new Container();
container.addNamespaceRoot('TeqFw_Cfg_', './node_modules/@teqfw/cfg/src', '.mjs');

const loader = await container.get('TeqFw_Cfg_Loader$');
const dotenv = await container.get('TeqFw_Cfg_Source_DotenvFile$');

await loader.load([
  dotenv.create({ path: '.env', id: 'project-dotenv' }),
]);
```

Package runtime configurations resolve `TeqFw_Cfg_Reader$` and read detached raw namespace fragments:

```js
const reader = await container.get('TeqFw_Cfg_Reader$');
const web = reader.get('TEQFW_WEB');
const port = Number(web.PORT ?? '3000');
```

## Public API

cfg is DI-only and has no root runtime import. The public surface is the `TeqFw_Cfg_` namespace:

- `TeqFw_Cfg_Loader$` — load selected Sources once during bootstrap;
- `TeqFw_Cfg_Reader$` — read detached raw namespace fragments;
- `TeqFw_Cfg_Source_Object$`, `TeqFw_Cfg_Source_ProcessEnv$`, `TeqFw_Cfg_Source_DotenvFile$` — built-in Source factories.

Do not import `@teqfw/cfg/src/**`.

## Agent-ready package

The package ships with three aligned interfaces:

- runtime code in `src`;
- type information through JSDoc and `types.d.ts`;
- a version-matched Agent Skill in `skills/teqfw-cfg`.

The skill explains components, Sources, values, lifecycle, failures, and supported integration patterns. An agent does not need to reconstruct the package architecture from source code alone.

Project instructions and application architecture remain authoritative. The package skill supplies product knowledge; the host supplies intent and policy.

## Best fit

Use `@teqfw/cfg` for modular TeqFW applications that need an explicit, ordered, immutable configuration boundary and package-scoped raw fragments.

Use direct configuration loading when an application has a single trivial config or does not use a DI container.

## Add to a project

```sh
npm install @teqfw/cfg @teqfw/di
```

The host registers the published `TeqFw_Cfg_` namespace, resolves `TeqFw_Cfg_Loader$`, loads selected Sources once during bootstrap, then uses `TeqFw_Cfg_Reader$` for raw namespace fragments.

## Boundaries

The package acquires and publishes raw configuration. The application owns schema validation, type conversion, defaults, secret-management policy, and its typed settings. cfg does not discover packages, register schemas, initialize package configuration, or create a typed tree.

## Agent-Driven Development

TeqFW is built through the same development model that it is designed to enable: one human defines the intent, architecture, constraints, and acceptance criteria; coding agents implement and maintain the products; other agents use those products in different combinations to create applications.

`@teqfw/cfg` is part of the Tequila Framework (TeqFW). The package includes a version-matched Agent Skill in `skills/teqfw-cfg`. The README provides a human-facing product overview; the skill provides agents with the package concepts, contracts, integration rules, examples, and boundaries.

Mount the skill into a host project:

```sh
mkdir -p .agents/skills
ln -s ../../node_modules/@teqfw/cfg/skills/teqfw-cfg \
  .agents/skills/teqfw-cfg
```

Each TeqFW package is both a practical software component and a working demonstration of human-governed, agent-driven development. This work follows the Agent-Driven Software Management (ADSM) approach: human intent, architectural authority, acceptance, and responsibility remain authoritative; agents act as implementation and reasoning partners.

- [Tequila Framework](https://teqfw.com/?from=github-teqfw-cfg)
- [Agent-Driven Software Management: A Practical Guide](http://fly.wiredgeese.com/flancer/leanpub/adsm-en/?from=github-teqfw-cfg)
- [Alex Gusev](https://github.com/flancer64)
