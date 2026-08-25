---
name: project-conventions
description: Project-specific conventions. Use for every task in this repository.
---

# Project Conventions

`AGENTS.md` overrides this file.

## Repositories

- The package root and mounted `ctx/` are separate repositories; do not mix their status, commits, or pushes.
- `ctx/` is the authoritative cognitive context for `@teqfw/cfg`.

## Workflow

- Work in each repository's `main` branch. This project rule overrides any GitHub-skill instruction to use a separate branch.
- At the start of work, check upstream in the root and mounted `ctx/` when applicable; safely fast-forward each local `main` when needed.
- Before changes, inspect every affected working tree.
- Do not commit or push unless the user requests it.

## Project-local skills

- Before reading a project-local skill, inspect its directory entry with `ls -la` and resolve symlinks with `readlink -f`. Project skills may be symlinks into `node_modules`.

## Communication

- User: Russian unless requested otherwise; code, comments, docs, commits, identifiers: English.
- Report changes, verification, and remaining risks.

## Project boundaries

- The root repository is the publishable `@teqfw/cfg` package: keep its public API, source, tests, and distributable documentation consistent.
- The mounted `ctx/` repository contains the package's authoritative cognitive context; follow its local routing instructions before changing its documents.

## Validation

- For package code changes, run the relevant test suites and `npm run typecheck`; run `npm run lint:md` for distributable Markdown changes.
- For ESM module changes, use `teqfw-esm-validator` in addition to project tests.
- Use `teqfw-platform` for all TeqFW plugin tasks, including `@teqfw/cfg`.
- For `ctx/` changes, run `npx --no-install adsm-ctx validate`.

## GitHub

- In all multiline text sent to GitHub, including issues and comments, use actual line breaks; never send literal `\n`, which GitHub displays as text.

## Shared memory

- `flancer32/ai-memo` is the shared cross-project issue tracker and memory.
- May create issues: source `teqfw/cfg`; name the project or projects expected to resolve them.
- When referring to a commit in another repository, use its full GitHub URL: `https://github.com/vendor/name/commit/<sha>`.
- Notes: `project/teqfw/cfg/`.

## Optional editing fallback

- Use `apply_patch`; on `bwrap` or network-namespace failure, use scoped `git apply`, then run `git diff --check` in each affected repository.
