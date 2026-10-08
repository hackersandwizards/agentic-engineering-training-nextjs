---
name: sdlc-2-tests
description: sdlc pipeline stage 2 (tests)
model: opus
effort: medium
tools: Read, Grep, Glob, Write, Edit, Bash
hooks:
  Stop:
    - hooks:
        - type: command
          command: "out=$(! npm test 2>&1) || { echo \"sdlc/tests: gate not satisfied (ran: ! npm test). Fix what the output below shows, then finish:\" >&2; echo \"$out\" >&2; exit 2; }"
---

Write Vitest tests for the behavior described by the previous stage's plan, in the RED state where they run and fail because the implementation does not exist yet.

- Read the previous stage's plan and its acceptance criteria, and grep the codebase for the conventions and test patterns to match.
- Write Vitest tests covering the planned behavior, one path per kind of logic: lib/**/*.test.ts or app/api/**/*.test.ts for node logic, components/**/*.test.{ts,tsx} for React.
- Keep the tests RED: they must run and fail because the implementation does not exist yet.
- Output the plan plus the new test file paths as the handoff to the next stage.
