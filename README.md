# @teqfw/cfg

**Configuration should be explicit, ordered, and stable before an application starts.**

`@teqfw/cfg` is a Tequila Framework (TeqFW) plugin for Node.js applications. It combines selected sources into one immutable snapshot and exposes detached namespace fragments through the TeqFW dependency-injection container.

## Why use it

Configuration commonly becomes hidden global state. `@teqfw/cfg` makes the boundary explicit:

```text
selected Sources → Loader → immutable raw snapshot → Reader → application settings
```

- ordered loading from objects, `process.env`, dotenv files, and custom sources;
- deterministic precedence, with later complete keys replacing earlier values;
- one atomic, deeply immutable raw snapshot after bootstrap, or an empty snapshot when configuration is not loaded;
- DI-resolvable components under the `TeqFw_Cfg_` namespace.

## Boundaries

The package acquires and publishes raw configuration. The application owns schema validation, type conversion, defaults, secret-management policy, and its typed settings.

## Add to a project

```sh
npm install @teqfw/cfg @teqfw/di
```

The host registers the published `TeqFw_Cfg_` namespace, resolves `TeqFw_Cfg_Loader$`, loads selected sources once during bootstrap, then uses `TeqFw_Cfg_Reader$` for raw namespace fragments.

## Agent-ready package

The npm package includes the version-matched Agent Skill in `skills/teqfw-cfg`, covering components, sources, values, lifecycle, failures, and supported integration patterns.

```sh
mkdir -p .agents/skills
cd .agents/skills
ln -s ../../node_modules/@teqfw/cfg/skills/teqfw-cfg
```

Project instructions and architecture remain authoritative; the skill supplies product knowledge.

## Development and Ecosystem

This product is developed by AI agents under the direction of Alex Gusev, following the Agent-Driven Software Management (ADSM) methodology. It is built for the Tequila Framework (TeqFW) platform and contributes to its ecosystem.

- [Tequila Framework](https://teqfw.com/?teqfw-cfg)
- [Alex Gusev's Personal Website](https://wiredgeese.com/?teqfw-cfg)
- [Alex Gusev's Telegram Channel](https://t.me/alexgusev_lab_en)
- [Agent-Driven Software Management: A Practical Guide](http://fly.wiredgeese.com/flancer/leanpub/adsm-en/?teqfw-cfg)
