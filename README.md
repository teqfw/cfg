# @teqfw/cfg

`@teqfw/cfg` is the configuration package for Tequila Framework (TeqFW) applications.

It will load configuration from `.env` files and expose it to application components through the TeqFW dependency-injection container. The package is intended to provide a small, stable configuration contract while leaving application-specific schemas and policies to consuming applications.

## Project Status

The repository currently contains the package bootstrap and documentation layout. Configuration loading and DI integration will be implemented in subsequent changes.

## Repository Layout

- `src/` — package implementation.
- `test/unit/` — isolated unit tests.
- `test/integration/` — dependency-injection and runtime integration tests.
- `test/publish/` — npm package smoke tests.
- `ai/` — agent-facing package API and usage documentation shipped with the package.
- `ctx/` — reserved mount point for the separate project cognitive-context repository; it is not part of this repository yet.

## Development

The package targets Node.js 20 or newer and uses ECMAScript modules.
