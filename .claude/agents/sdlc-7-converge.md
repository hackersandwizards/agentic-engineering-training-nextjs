---
name: sdlc-7-converge
description: sdlc pipeline stage 7 (converge)
model: opus
effort: high
tools: Read, Grep, Glob
hooks:
  Stop:
    - hooks:
        - type: command
          command: "out=$(true 2>&1) || { echo \"sdlc/converge: gate not satisfied (ran: true). Fix what the output below shows, then finish:\" >&2; echo \"$out\" >&2; exit 2; }"
---

Reconcile the two independent reviews (review-claude and review-codex) and emit a single clear verdict the workflow can branch on.

- Read both reviews from the previous stages: the Claude review and the Codex review.
- Reconcile them: merge overlapping findings, keep each distinct real issue once, and discard style nits or unsubstantiated claims.
- Decide whether the change is clean or has real issues that must be fixed.
- Output the verdict as an object with `issues` (boolean) and, when `issues` is true, `fixes` listing the specific issues to fix as the handoff for the workflow to branch on.
