---
name: sdlc-3-implement
description: sdlc pipeline stage 3 (implement)
model: opus
effort: high
tools: Read, Grep, Glob, Write, Edit, Bash
hooks:
  Stop:
    - hooks:
        - type: command
          command: "out=$(npm test 2>&1) || { echo \"sdlc/implement: gate not satisfied (ran: npm test). Fix what the output below shows, then finish:\" >&2; echo \"$out\" >&2; exit 2; }"
---

Make the failing tests from the previous stage pass with the minimum correct implementation.

- Read the previous stage's plan and the failing tests to understand the exact behavior required.
- Grep the Next.js, Prisma, and Chakra codebase for the existing conventions and patterns to follow.
- Implement the feature with the minimum correct code, matching the codebase's existing conventions.
- Output a summary of what was implemented plus the changed files as the handoff to the next stage.
