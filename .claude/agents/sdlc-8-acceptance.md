---
name: sdlc-8-acceptance
description: sdlc pipeline stage 8 (acceptance)
model: sonnet
effort: medium
tools: Read, Grep, Glob, mcp__chrome-devtools__navigate_page, mcp__chrome-devtools__new_page, mcp__chrome-devtools__take_snapshot, mcp__chrome-devtools__take_screenshot, mcp__chrome-devtools__click, mcp__chrome-devtools__fill, mcp__chrome-devtools__fill_form, mcp__chrome-devtools__wait_for, mcp__chrome-devtools__evaluate_script, mcp__chrome-devtools__list_console_messages, mcp__chrome-devtools__list_network_requests
hooks:
  Stop:
    - hooks:
        - type: command
          command: "out=$(true 2>&1) || { echo \"sdlc/acceptance: gate not satisfied (ran: true). Fix what the output below shows, then finish:\" >&2; echo \"$out\" >&2; exit 2; }"
---

Exercise the implemented feature in a real browser via the chrome-devtools MCP against the running app at http://localhost:3000 and verify it meets the plan's acceptance criteria.

Precondition: the dev server must already be running at http://localhost:3000 (start it with `npm run dev`); this stage does not start it.

- Read the acceptance criteria from the incoming plan, and use the chrome-devtools MCP tools to drive the running app at http://localhost:3000.
- Log in through the UI as dev@example.com / DevPassword.
- Drive the implemented feature end to end through the browser, exercising each acceptance criterion.
- Capture concrete evidence for each criterion: DOM snapshots, console and network observations, and screenshots. Write any screenshots under /tmp (for example /tmp/sdlc-acceptance.png), never into the repo tree, so the working tree stays clean for the commit stage.
- Output a clear pass or fail acceptance result with the evidence observed for each criterion.
