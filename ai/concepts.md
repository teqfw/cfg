# Concepts

Version: 20260724

## Role

`@teqfw/cfg` is a TeqFW platform plugin that converts ordered configuration Sources into a stable, in-memory configuration snapshot. It deliberately separates acquisition of raw values from application-specific schema validation and typed configuration construction.

## Configuration Model

A Source produces an ordered sequence of `{key, value}` entries. `Loader` consumes Sources sequentially and builds one immutable snapshot. `Reader` projects a namespace from that snapshot into a detached, mutable object for an application component.

The package owns:

- Source normalization and safe loading;
- key grammar and raw-value validation;
- precedence, lifecycle, and failure behavior;
- immutable internal snapshot storage;
- namespace projection.

The consuming application owns:

- which Sources it uses and their ordering;
- namespace naming;
- conversion of raw strings into ports, URLs, flags, or domain values;
- required-key checks and application policy.

## Explicit Configuration

Process environment and dotenv files are never read implicitly. The composition root creates the desired Source and passes it to `Loader.load()`. This makes precedence, file access, and the moment configuration becomes available explicit.

## Namespace Keys

Each loadable key has exactly two uppercase segments:

```txt
NAMESPACE__PARAMETER
```

For example, `TEQFW_WEB__PORT` belongs to namespace `TEQFW_WEB` and is returned by `reader.get("TEQFW_WEB")` as `PORT`.

## Snapshot And Projection

`Store` owns a deeply frozen snapshot after a successful load. `Reader` never returns that snapshot or a reference into it. Each `get()` creates a new, detached projection, so callers may adapt its result without changing stored configuration or another caller's result.

## TeqFW Composition

The package exposes DI modules under the `TeqFw_Cfg_` namespace. A TeqFW container resolves the Loader, Reader, Store, and source factories as singleton services; a source factory creates independent Source descriptors for individual load operations.
