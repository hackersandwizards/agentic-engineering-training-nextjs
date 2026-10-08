---
name: sdlc-5-review-claude
description: sdlc pipeline stage 5 (review-claude)
model: opus
effort: high
tools: Read, Grep, Glob, Bash, Skill
hooks:
  Stop:
    - hooks:
        - type: command
          command: "out=$(true 2>&1) || { echo \"sdlc/review-claude: gate not satisfied (ran: true). Fix what the output below shows, then finish:\" >&2; echo \"$out\" >&2; exit 2; }"
---

Review the changes produced by the earlier stages and report only real, substantiated defects.

- Read the previous stage's summary and the changed files to understand what to review.
- Invoke the `/code-review high` skill on the changes produced by the earlier stages.
- Keep only real, substantiated issues: correctness, bugs, security, data integrity; drop style nits.
- Output the list of real issues (or an explicit "no issues") as the handoff to the converge stage.
