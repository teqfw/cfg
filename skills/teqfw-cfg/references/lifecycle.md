# Lifecycle

## Role

`Loader` performs one sequential load operation into its associated `Store`. `Store` owns the resulting snapshot and enforces its lifecycle.

## State Model

The Store has four states:

- `empty` — no load has started; reads use the immutable empty snapshot.
- `loading` — one Loader operation is in progress; partial data is never visible.
- `ready` — a complete, deeply frozen snapshot is available.
- `failed` — the load operation failed; the original cfg error is retained.

Transitions are one-way:

```txt
empty -> loading -> ready
                 -> failed
```

`ready` and `failed` are terminal states.

## Loading Semantics

On the first `load(sources)` call, Loader validates and captures the complete source descriptor list before executing any Source. It then invokes `load()` on each captured Source in declared order, waiting for each result before starting the next.

While this operation is pending, later `load()` calls return the same Promise and do not inspect their arguments. After success, another call rejects with `CFG_LOAD_ALREADY_READY`; after failure, another call rejects with the original failure.

## Merge Semantics

The Loader merges complete keys only. For a duplicate key, the later entry replaces the prior value as a whole; it does not deep-merge objects or arrays. Repeated declarations in one Source follow the same last-entry-wins rule.

An entry absent from later Sources remains in the snapshot. `undefined` is not an absence marker and is an invalid RawValue.

## Publication And Failure

Before loading starts, the Store exposes one immutable empty snapshot. Once loading begins, no partial snapshot is visible. On success, the Loader replaces it with one copied, deeply frozen snapshot. On any error, it fails the Store and exposes a stable cfg error rather than a partially merged state.

Source exceptions, file-reading failures, and dotenv syntax failures become `CFG_SOURCE_FAILED` with the Source identifier as safe context. Details from the underlying exception are not propagated.
