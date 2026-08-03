# Values

## Key Grammar

A complete configuration key is:

```txt
NAMESPACE__PARAMETER
```

Both parts use uppercase segments separated internally by single underscores:

```txt
[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*
```

Examples:

```txt
TEQFW_WEB__PORT
TEQFW_WEB__PUBLIC_URL
APP_FEATURE_FLAGS__ENABLE_CACHE
```

`Reader.get(namespace)` accepts one namespace segment only, such as `TEQFW_WEB`. It strips exactly that prefix and the `__` separator from matching keys.

## RawValue Contract

Raw values may be:

- strings, finite numbers, booleans, or `null`;
- dense arrays of RawValues;
- plain objects, including null-prototype objects, whose own properties are enumerable RawValues.

Raw values must not be `undefined`, bigint, symbols, functions, non-finite numbers, cyclic values, class instances, dates, maps, sets, sparse arrays, accessors, or objects with symbol or non-enumerable properties.

## Snapshot Semantics

Before publication, each accepted value is copied. The Store deeply freezes the copied snapshot, including nested arrays and objects. A caller cannot mutate it through a Source value retained elsewhere.

## Reader Semantics

`TeqFw_Cfg_Reader$` reads one valid namespace from the Store. Before loading starts, it reads the immutable empty snapshot:

```js
const fragment = reader.get("TEQFW_WEB");
```

It returns a fresh, mutable, detached object with detached nested values. A valid but absent namespace, including before configuration loading starts, yields a fresh empty object. The Reader does not parse strings, apply defaults, validate required entries, or cache projections; those are application responsibilities.
