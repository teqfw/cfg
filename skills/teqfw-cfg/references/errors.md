# Errors

## Error Contract

Package failures are frozen `Error` objects with:

```ts
type CfgError = Readonly<Error & {
  code: ErrorCode;
  context: Readonly<Record<string, string>>;
}>;
```

They have `name === "CfgError"`. Handle the stable `code` and, when useful, its safe context. Do not branch on error messages.

## Error Codes

| Code | Meaning |
| --- | --- |
| `CFG_INVALID_SOURCE` | Source descriptor or source factory input is invalid. |
| `CFG_INVALID_ENTRY` | A Source result or its entry shape is invalid. |
| `CFG_INVALID_SOURCE_ID` | A Source id is malformed or duplicated. |
| `CFG_INVALID_KEY` | A complete configuration key is invalid. |
| `CFG_INVALID_RAW_VALUE` | A raw value is outside the supported value contract. |
| `CFG_SOURCE_FAILED` | A Source threw, rejected, or could not be read or parsed. |
| `CFG_STORE_EMPTY` | Legacy code retained for compatibility; Store reads no longer emit it. |
| `CFG_STORE_LOADING` | A read was attempted while loading is in progress. |
| `CFG_INVALID_NAMESPACE` | Reader received an invalid namespace. |
| `CFG_LOAD_ALREADY_READY` | Loading was attempted after a successful load. |
| `CFG_ILLEGAL_STATE` | An internal Store lifecycle transition was invalid. |

## Context And Secret Safety

Context may contain safe identifiers such as `sourceId`, `key`, `namespace`, `field`, or `state`. Source failures include `sourceId`, but not an underlying exception message, dotenv path, file content, or raw configuration value. Preserve that boundary when wrapping or logging cfg errors.
