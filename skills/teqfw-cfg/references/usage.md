# Usage

## Host Composition Boundary

Declare `@teqfw/cfg` as a package dependency. The host composition root registers its `package.json#teqfw.fw.di.namespaces` metadata before resolving its own bootstrap entry point; use the `@teqfw/di` or `@teqfw/cli` documentation for that host-specific setup. When a manually configured host uses `TeqFw_Cfg_Log_Policy$`, it also registers `TeqFw_Log_` before its first resolution.

## Load Configuration Once

Configure Sources in precedence order: a later entry with the same complete key replaces the earlier entry as a whole.

```js
export default class Configuration {
  constructor({loader, processEnv, dotenv}) {
    return {
      load() {
        return loader.load([
          dotenv.create({path: ".env", id: "project-dotenv"}),
          processEnv.create(process.env),
        ]);
      },
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    loader: "TeqFw_Cfg_Loader$",
    processEnv: "TeqFw_Cfg_Source_ProcessEnv$",
    dotenv: "TeqFw_Cfg_Source_DotenvFile$",
  }),
});
```

This gives `process.env` higher precedence than `.env`. The composition root resolves the host Configuration component as its bootstrap root, calls `load()` exactly once, and awaits it before consuming configuration. In an `@teqfw/cli` host, CLI itself owns this load and the host configurator returns only additional Source descriptors.

## Read A Namespace

```js
export default class WebConfig {
  constructor({reader}) {
    const web = reader.get("TEQFW_WEB");
    return Object.freeze({port: Number(web.PORT ?? "3000")});
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({reader: "TeqFw_Cfg_Reader$"}),
});
```

`Reader.get()` returns a new detached object each time. It does not coerce raw values and returns `{}` for a valid namespace with no entries, including before configuration loading starts. `Container.get()` is only for resolving the host bootstrap root; all components receive Reader and other services through declared dependencies.

## Programmatic And Custom Sources

```js
export default class Configuration {
  constructor({loader, object}) {
    const remoteSource = Object.freeze({
      id: "deployment-settings",
      async load() { return Object.freeze([Object.freeze({key: "TEQFW_WEB__PORT", value: 8080})]); },
    });
    return {
      load() {
        return loader.load([
          object.create({TEQFW_WEB__PORT: 3000}, "defaults"),
          remoteSource,
        ]);
      },
    };
  }
}

export const __deps__ = Object.freeze({
  default: Object.freeze({
    loader: "TeqFw_Cfg_Loader$",
    object: "TeqFw_Cfg_Source_Object$",
  }),
});
```

Use a custom Source only with a unique id and asynchronous `load()`. Read [Sources](sources.md) and [Values](values.md) for the full validation contract; do not expose secrets in logs or errors.

## Lifecycle Constraints

- `Loader.load()` shares one Promise with concurrent callers while loading.
- A ready Store rejects later loads with `CFG_LOAD_ALREADY_READY`.
- A failed load is terminal; subsequent reads and loads expose the original failure.
- `Reader.get()` before loading returns a detached empty fragment; during loading it throws `CFG_STORE_LOADING`.

## Apply Host Logging Policy

cfg does not apply a policy automatically. Inject `TeqFw_Cfg_Log_Policy$` into a host-owned component that runs after cfg loading and call `apply({appRoot})` there. In a CLI host, inject `TeqFw_Cli_Config$` too and pass `config.applicationRoot`; CLI supplies this fact but does not invoke the bridge itself. The bridge first uses `TEQFW_LOG__POLICY_FILE` when configured; otherwise it tries the optional `<appRoot>/etc/log.policy`. A missing conventional file leaves `@teqfw/log` at its built-in `*=info` threshold, enabling `info` and more severe records but not `debug` or `trace`. An invalid bridge input rejects with `CFG_INVALID_LOG_POLICY`; an explicitly configured missing, unreadable, or malformed file rejects with `CFG_LOG_POLICY_FAILED` and must be handled as a bootstrap failure.
