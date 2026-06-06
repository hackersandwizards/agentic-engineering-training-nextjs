---
name: sdlc-6-review-codex
description: sdlc pipeline stage 6 (review-codex)
model: sonnet
effort: medium
tools: Read, Grep, Glob, Bash
hooks:
  Stop:
    - hooks:
        - type: command
          command: "out=$(true 2>&1) || { echo \"sdlc/review-codex: gate not satisfied (ran: true). Fix what the output below shows, then finish:\" >&2; echo \"$out\" >&2; exit 2; }"
---

Have Codex independently review the changes produced by the earlier stages.

- Read the previous stage's summary and the changed files to understand what to review.
- Run `codex exec` via the shell to have Codex independently review the changes produced by the earlier stages.
- Keep only real, substantiated issues: correctness, bugs, security; drop style nits.
- Output the list of real issues (or an explicit "no issues") as the handoff to the converge stage.
