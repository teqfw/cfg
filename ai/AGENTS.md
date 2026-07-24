# AGENTS.md

Version: 20260724

## Purpose

This file defines the `ai/` level for agent-facing package documentation included in the distributable package.

The `ai/` directory provides a compact machine-oriented interface for agents that need to compose and use `@teqfw/cfg` correctly in a Tequila Framework (TeqFW) application.

## Level Boundary

This level defines:

- supported configuration components and their CDC identifiers;
- configuration lifecycle, source, value, and error contracts;
- canonical composition and consumption patterns.

This level does not define:

- application-specific configuration schema or validation;
- repository development workflow and tests;
- undocumented implementation details;
- secret-management policy beyond the source contracts described here.

## Level Map

- `AGENTS.md` — entry point, scope, navigation, and authority.
- `concepts.md` — configuration model and its boundaries.
- `lifecycle.md` — Loader and Store state model, merge, and failure semantics.
- `sources.md` — Source protocol and built-in Object, process-environment, and dotenv-file sources.
- `values.md` — key grammar, RawValue contract, snapshot, and Reader semantics.
- `errors.md` — stable error codes and safe diagnostic context.
- `package-api.ts` — machine-readable contract of the supported DI surface.
- `usage.md` — canonical TeqFW composition and integration recipes.

## Reading Guide

Read documents by task:

- for supported CDC identifiers and methods, start with `package-api.ts`;
- for application composition, read `usage.md`;
- for source selection or custom Sources, read `sources.md`;
- for loading, precedence, and terminal states, read `lifecycle.md`;
- for key names, accepted values, and reading namespaces, read `values.md`;
- for handling failures programmatically, read `errors.md`.

If the task is broad or unclear, read in this order:

1. `AGENTS.md`
2. `package-api.ts`
3. `usage.md`
4. `lifecycle.md`
5. remaining documents as needed

## Authority

The documents in `ai/` define supported agent-facing usage semantics of the package. Agents should rely on these documents and treat behavior not described here as undefined.
