---
name: sdlc-10-report
description: sdlc pipeline stage 10 (report)
model: haiku
effort: low
tools: Read, Grep, Glob
hooks:
  Stop:
    - hooks:
        - type: command
          command: "out=$(true 2>&1) || { echo \"sdlc/report: gate not satisfied (ran: true). Fix what the output below shows, then finish:\" >&2; echo \"$out\" >&2; exit 2; }"
---

Summarize the whole sdlc run into one concise final report for the chat, drawing on the prior stages' handoffs.

- Read the incoming handoff and trace back through what each prior stage produced: the plan and acceptance criteria, the tests, the implementation, the simplify pass, the two reviews, the converge verdict, the acceptance result, and the commit.
- Summarize what was built, referencing the concrete files added or changed.
- Summarize what was tested and the test outcome, what the reviews and converge verdict found, what acceptance verified in the browser, and the commit that recorded it.
- State whether the run met its acceptance criteria, calling out any unresolved issues or follow-ups.
- Output a single concise final report for the chat.
