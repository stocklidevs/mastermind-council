# Feature Specification: Public Repo Hardening

## User Story

As the project owner, I want the repository metadata and examples to be ready for a public GitHub repository, so visitors do not see stale versions, license placeholders, or personal credential reference names.

## Requirements

- **FR-001**: The repository MUST include an explicit open-source license.
- **FR-002**: Package metadata MUST match the project version.
- **FR-003**: README badges and license section MUST reflect the chosen license and current version.
- **FR-004**: Current-tree 1Password examples MUST use generic vault/item names rather than personal or workspace-specific names.
- **FR-005**: Public-hardening changes MUST preserve existing secret-redaction tests and smoke-test behavior.

## Success Criteria

- `rg` finds no current-tree references to the old personal smoke-test item names.
- `npm.cmd ci --ignore-scripts` and `node --test` pass.
- Git history contains a commit for the public-hardening slice.

## Out of Scope

- Rewriting historical commits.
- Publishing to GitHub.
- Configuring CI.
