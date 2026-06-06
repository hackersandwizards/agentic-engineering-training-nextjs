# SDLC pipeline — build spec

Build a pipeline named `sdlc` with the build-pipeline skill (one stage per call), in order. The pipeline takes a feature request and carries it through each stage to the next.

1. **plan** — opus, high. Turn the feature request into an implementation plan with acceptance criteria. Done when the plan and acceptance criteria exist.
2. **tests** — opus, medium. Write tests for the planned behavior. Done when the new tests run and fail.
3. **implement** — opus, high. Make the tests pass. Done when the tests pass.
4. **simplify** — sonnet, medium. Clean up the implementation. Done when it's tidied and the tests still pass. Use embedded /simplify skill.
5. **review-claude** — opus, high. Review the changes and list any real issues. Done when the review is complete. Use embedded /code-review high skill.
6. **review-codex** — sonnet, medium. Have Codex review the changes via `codex exec` and list any real issues. Done when the review is complete.
7. **converge** — opus, high. Reconcile the two reviews and decide whether the change is clean or has real issues to fix. Done when there is a clear verdict.
8. **acceptance** — sonnet, medium. Exercise the feature in a real browser via the chrome-devtools MCP. Done when it meets the acceptance criteria in-browser.
9. **report** — haiku, low. Summarize what was built, tested, reviewed, and accepted. Done when the result is reported in the chat.

Flow: run the stages in order, but run **review-claude** and **review-codex** in parallel — **converge** waits for both. After **converge**, if it found real issues, go back to **implement** and repeat implement → simplify → (review-claude ∥ review-codex) → converge with those issues. When **converge** is clean, continue to **acceptance**. If converge still finds issues after 3 rounds, stop and ask the human for help instead of looping again. The run is complete only when the tests are green and acceptance has passed.
