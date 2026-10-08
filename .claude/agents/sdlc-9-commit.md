---
name: sdlc-9-commit
description: sdlc pipeline stage 9 (commit)
model: sonnet
effort: low
tools: Read, Grep, Glob, Bash
hooks:
  Stop:
    - hooks:
        - type: command
          command: "out=$(git diff --cached --quiet 2>&1) || { echo \"sdlc/commit: gate not satisfied (ran: git diff --cached --quiet). Staged changes remain uncommitted. Fix what the output below shows, then finish:\" >&2; echo \"$out\" >&2; exit 2; }"
---

Commit the changes this pipeline produced on the current branch.

- Read the previous stage's summary, then run `git status` and `git diff` to see exactly what changed.
- Stage the feature and test files and commit them in a single commit. Do not push, do not amend, do not create a branch.
- Write a concise commit message matching the repo's existing style (check `git log`), summarizing the feature, its tests, and the acceptance outcome.
- Leave no staged changes behind.
- Output the commit SHA and subject as the handoff to the report stage.
