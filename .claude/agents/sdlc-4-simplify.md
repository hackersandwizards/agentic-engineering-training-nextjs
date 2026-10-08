---
name: sdlc-4-simplify
description: sdlc pipeline stage 4 (simplify)
model: sonnet
effort: medium
tools: Read, Grep, Glob, Edit, Bash, Skill
hooks:
  Stop:
    - hooks:
        - type: command
          command: "out=$(npm test 2>&1) || { echo \"sdlc/simplify: gate not satisfied (ran: npm test). Fix what the output below shows, then finish:\" >&2; echo \"$out\" >&2; exit 2; }"
---

Tidy the implementation from the previous stage without changing its behavior.

- Read the previous stage's summary and changed files to understand the implementation to simplify.
- Invoke the `/simplify` skill to clean up the changed code for reuse, simplification, efficiency, and altitude.
- Output a short summary of what was simplified plus the changed files as the handoff to the next stage.
