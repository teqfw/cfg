---
name: teqfw-cfg
description: >
  Use this skill when integrating, using, testing, reviewing, or modifying Node.js
  TeqFW applications that use @teqfw/cfg Sources, Loader, Store, Reader, raw
  configuration values, dotenv files, namespaces, or configuration lifecycle handling.
license: Apache-2.0
metadata:
  package: "@teqfw/cfg"
---

# @teqfw/cfg

Use this skill for consumer code that composes or depends on the installed `@teqfw/cfg` package. Treat the host project's instructions, architecture, and test conventions as authoritative.

## Apply

1. Register the package through its `package.json#teqfw.fw.di.namespaces` metadata, or add the `TeqFw_Cfg_` namespace root in the Node.js composition root.
2. Resolve cfg only through TeqFW DI CDC identifiers; the package has no root runtime import, export map, or supported `src/**` deep import.
3. Select Sources explicitly, call `Loader.load()` once during bootstrap, and await it before resolving configuration-consuming runtime.
4. Treat the Store snapshot as infrastructure-owned and immutable; use Reader only for fresh detached raw namespace fragments, then let each consumer parse, validate, and freeze its typed settings.
5. Read the references selected below before editing, then validate with the host project tests.
6. In JSDoc and TypeScript declarations, component instance types use their base namespace name; `__Class` denotes a component constructor. A trailing `$` is reserved for runtime CDC identifiers.

## Select References

| Consumer task | Read |
| --- | --- |
| Understand package boundary, ownership, namespaces, or composition | [Concepts](references/concepts.md), [Usage](references/usage.md) |
| Configure loading, precedence, lifecycle, or startup ordering | [Lifecycle](references/lifecycle.md), [Usage](references/usage.md), [Package API](references/package-api.ts) |
| Use or implement Object, process-environment, dotenv, or custom Sources | [Sources](references/sources.md), [Values](references/values.md) |
| Read raw values or build typed package settings | [Values](references/values.md), [Concepts](references/concepts.md) |
| Handle or test cfg failures | [Errors](references/errors.md), [Lifecycle](references/lifecycle.md), [Package API](references/package-api.ts) |
| Discover the installed skill | [Distribution](references/distribution.md) |

cfg creates one immutable raw application snapshot from ordered Sources. It does not create typed application configuration, schemas, package discovery, configuration registration, or secret-management policy.
