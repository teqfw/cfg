# Root Level

## Purpose

Root-level working rules for the `@teqfw/cfg` package repository.

The repository contains the npm package implementation and its distributable documentation. A separate cognitive context will later be mounted at `ctx/`.

## Repository Layout

- `src/` — implementation modules.
- `test/` — unit, integration, and publish tests.
- `ai/` — agent-facing documentation distributed with the package.
- `ctx/` — reserved, ignored mount point for the future cognitive-context repository.

## Context Boundary

Do not create, remove, replace, or relocate `ctx/` unless explicitly instructed. Once mounted, consult its local instructions and documentation before making package decisions.

## Root File Protection

Do not modify this file, `.gitignore`, or `README.md` unless explicitly instructed by the human.
