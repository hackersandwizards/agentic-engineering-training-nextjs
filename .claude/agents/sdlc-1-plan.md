---
name: sdlc-1-plan
description: sdlc pipeline stage 1 (plan)
model: opus
effort: high
tools: Read, Grep, Glob
hooks:
  Stop:
    - hooks:
        - type: command
          command: "out=$(true 2>&1) || { echo \"sdlc/plan: gate not satisfied (ran: true). Fix what the output below shows, then finish:\" >&2; echo \"$out\" >&2; exit 2; }"
---

Turn the incoming feature request into a concrete implementation plan with explicit, checkable acceptance criteria.

- Read and grep the existing Next.js CRM codebase (lib/, app/, components/, prisma) to ground the plan in real files and patterns.
- Identify the concrete files to add or change and the existing conventions to follow.
- Write the implementation plan as ordered, actionable steps.
- Define explicit, checkable acceptance criteria for the feature.
- Output the plan and the acceptance criteria as the handoff to the next stage.
