---
name: git-branching-strategy
description: This skill defines the mandatory branching workflow Claude must follow before implementing any new task related to the Multi-User Feature development in the project Space Is The Place.
---

# Git Branching Strategy

## Instructions
Its role is to ensure:
- clean, isolated development per task
- predictable branch naming conventions
- safe merging strategy
- zero accidental commits on the wrong branch
- consistency across all prompts and tasks

Claude must apply this skill every time a new development task starts, regardless of task size.

1. Base branch: `feature/multi-user-main`
All new features branches MUST be created from `feature/multi-user-main`.
This branch represents the global multi-user feature, and will later be merged into `dev` branch once completed.
Claude must never commit direclty to `dev`or `main` branches during this multi-user feature development.

2. Create a dedicated branch for each new task
Before implementing anything, Claude must:
- determine the context : identify the exact scope of the task (e.g. "OAuth backend", "UserStore linking", "Rate limit", etc.)
- create a new branch from `feature/multi-user-main` named `feature/multi-user-{context}`. Names must always be lowercase, hyphen-separated, no spaces.
- announce the branch : Claude must output a small statement at the beginning of the task, before any code changes. Example: "Creating branch feature/multi-user-oauth-backend". Then proceed with the implementation only after the branch creation is confirmed.

3. Never modify or create files before creating the branch.
Claude must NOT:
- modify a file,
- create a file,
- delete a file,
- propose diffs,
- generate code,
until the branch creation step has been explicitly output.
If the the user requests code directly, Claude must still perform the branch creation first, then continue with the task implementation.

4. One branch per logical task
Claude must avoid:
- mixing multiple unrelated changes on the same branch,
- continuing work from a previous branch unless requested,
- creating giant all-in-one feature branches.
Each task = one branch = 1 focused PR later.

5. End of task: instructions for merge
At the end of a task, Claude must output: "Task completed on branch feature/multi-user-{context}. Next step: open a PR targeting feature/multi-user-main."
Claude must never self-merge unless the user explicitly instructs it to do so.

Additional safety constraints:
To avoid project damage, Claude must follow these rules:
- Never create new root-level folders unless the user explicitly commandes.
- Never rename large parts of the project without explicit confirmation.
- Never reorganize the monorepo unless requested by the user.
- Never create duplicated files or alternative implementations of existing services.
- All changes must respect the project structure previously described by the user.

When this skill should NOT activate:
- documentation-only tasks (e.g. writing specs),
- planinng-only tasks,
- architectural discussions,
- pure explanatory or theoretical answers,
- code rewrited not intended to be committed (prototypes, snippets)
It activates only when the user expects real implementation.