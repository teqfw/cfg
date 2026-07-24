# Usage

Version: 20260724

## Purpose

This document shows canonical usage patterns for `@teqfw/cfg`. The package is a TeqFW DI plugin: configure its namespace root in the application composition root and resolve its components through `@teqfw/di`.

## Canonical Container Setup

```js
import { fileURLToPath } from "node:url";
import Container from "@teqfw/di";

const cfgRoot = fileURLToPath(
  new URL("./node_modules/@teqfw/cfg/src", import.meta.url),
);

const container = new Container();
container.addNamespaceRoot("TeqFw_Cfg_", cfgRoot, ".mjs");
```

In an application that uses `NamespaceRegistry`, declare `@teqfw/cfg` as a package dependency and let the registry discover its `package.json#teqfw.namespaces` metadata instead of registering this root manually.

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

The example gives `process.env` higher precedence than `.env`. Call `load()` exactly once during bootstrap and wait for it before consuming configuration.

## Read A Namespace

```js
const reader = await container.get("TeqFw_Cfg_Reader$");
const web = reader.get("TEQFW_WEB");

const port = Number(web.PORT ?? "3000");
const host = String(web.HOST ?? "127.0.0.1");
```

`Reader.get()` returns a new detached object each time. It does not coerce raw values and returns `{}` for a valid namespace with no entries.

## Programmatic Source

Use the Object source for explicit bootstrap defaults, generated values, and tests.

```js
const object = await container.get("TeqFw_Cfg_Source_Object$");

await loader.load([
  object.create({
    TEQFW_WEB__HOST: "127.0.0.1",
    TEQFW_WEB__PORT: 3000,
  }, "defaults"),
]);
```

## Custom Source

A custom Source is a descriptor with a unique identifier and an asynchronous `load()` method.

```js
const remoteSource = Object.freeze({
  id: "deployment-settings",
  async load() {
    return Object.freeze([
      Object.freeze({ key: "TEQFW_WEB__PORT", value: 8080 }),
    ]);
  },
});

await loader.load([remoteSource]);
```

Read `sources.md` and `values.md` for the complete validation contract. Do not load secrets through a Source that exposes them in logs or error messages.

## Lifecycle Constraints

- `Loader.load()` shares the same Promise with concurrent callers while loading.
- A ready Store rejects later load attempts with `CFG_LOAD_ALREADY_READY`.
- A failed load is terminal; subsequent reads and loads expose the original failure.
- `Reader.get()` before or during loading throws a stable cfg error.
