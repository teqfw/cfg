# Usage

## Canonical Container Setup

```js
import { fileURLToPath } from "node:url";
import Container from "@teqfw/di";

const cfgRoot = fileURLToPath(new URL("./node_modules/@teqfw/cfg/src", import.meta.url));
const container = new Container();
container.addNamespaceRoot("TeqFw_Cfg_", cfgRoot, ".mjs");
```

When using `NamespaceRegistry`, declare `@teqfw/cfg` as a package dependency and let it discover `package.json#teqfw.fw.di.namespaces` rather than registering the root manually.

## Load Configuration Once

Configure Sources in precedence order: a later entry with the same complete key replaces the earlier entry as a whole.

```js
const loader = await container.get("TeqFw_Cfg_Loader$");
const processEnv = await container.get("TeqFw_Cfg_Source_ProcessEnv$");
const dotenv = await container.get("TeqFw_Cfg_Source_DotenvFile$");

await loader.load([
  dotenv.create({ path: ".env", id: "project-dotenv" }),
  processEnv.create(process.env),
]);
```

This gives `process.env` higher precedence than `.env`. Call `load()` exactly once during bootstrap and await it before consuming configuration.

## Read A Namespace

```js
const reader = await container.get("TeqFw_Cfg_Reader$");
const web = reader.get("TEQFW_WEB");
const port = Number(web.PORT ?? "3000");
```

`Reader.get()` returns a new detached object each time. It does not coerce raw values and returns `{}` for a valid namespace with no entries, including before configuration loading starts.

## Programmatic And Custom Sources

```js
const object = await container.get("TeqFw_Cfg_Source_Object$");
await loader.load([object.create({ TEQFW_WEB__PORT: 3000 }, "defaults")]);

const remoteSource = Object.freeze({
  id: "deployment-settings",
  async load() { return Object.freeze([Object.freeze({ key: "TEQFW_WEB__PORT", value: 8080 })]); },
});
```

Use a custom Source only with a unique id and asynchronous `load()`. Read [Sources](sources.md) and [Values](values.md) for the full validation contract; do not expose secrets in logs or errors.

## Lifecycle Constraints

- `Loader.load()` shares one Promise with concurrent callers while loading.
- A ready Store rejects later loads with `CFG_LOAD_ALREADY_READY`.
- A failed load is terminal; subsequent reads and loads expose the original failure.
- `Reader.get()` before loading returns a detached empty fragment; during loading it throws `CFG_STORE_LOADING`.
