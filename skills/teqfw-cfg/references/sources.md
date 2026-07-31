# Sources

## Source Protocol

A Source is an object with this structural contract:

```ts
type Source = Readonly<{
  id: string;
  load: () => Promise<ReadonlyArray<Readonly<{
    key: string;
    value: RawValue;
  }>>>;
}>;
```

`id` must be unique within one `Loader.load()` call and match `[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}`. `load` must be a function. Loader captures both values before source execution, so later mutations of descriptors or their containing array do not affect the operation.

Each resolved entry must own exactly enumerable `key` and `value` data properties. See [Values](values.md) for their grammar and value contract.

## Object Source

`TeqFw_Cfg_Source_Object$` creates a Source from a plain object:

```js
const source = object.create(
  { TEQFW_WEB__PORT: 3000 },
  "defaults",
);
```

The optional id defaults to `object`. It accepts a non-array record and preserves its own enumerable entries as raw values.

## Process Environment Source

`TeqFw_Cfg_Source_ProcessEnv$` creates a Source from an explicit environment record:

```js
const source = processEnv.create(process.env, "process-env");
```

The optional id defaults to `process-env`. Only complete cfg keys are emitted; unrelated environment names and `undefined` values are ignored. Emitted values must be strings, as supplied by Node.js process environments.

## Dotenv File Source

`TeqFw_Cfg_Source_DotenvFile$` creates a UTF-8 dotenv Source:

```js
const source = dotenv.create({
  path: ".env",
  id: "project-dotenv",
});
```

`path` is required and non-empty; `id` defaults to `dotenv-file`. The file is read only when the Source is loaded. Invalid encoding, I/O failure, and parser failure are converted at the Loader boundary to `CFG_SOURCE_FAILED` without disclosing the path or underlying error detail.

The parser supports blank lines, comments, optional `export`, unquoted values, single and double quoted values, and the double-quote escapes `\\`, `\"`, `\n`, `\r`, and `\t`. It does not perform variable expansion, command substitution, or type conversion. Only complete cfg keys are emitted.
