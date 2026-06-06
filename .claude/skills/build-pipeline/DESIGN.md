# build-pipeline — design notes & gotchas

Why the pipeline is shaped this way, and the dead ends already ruled out. Read before changing the templates or the advancement hook.

## The one rule
Hooks can **verify, gate, detect, and nudge** deterministically. **No hook can launch a skill or tool.** So the next stage is always launched by the *model* acting on a nudge — reliable, never guaranteed. True end-to-end determinism would require the Agent SDK (deliberately out of scope; we stay in Claude Code).

## Features the pipeline uses
- **`context: fork` + `agent:`** — fresh context per stage; the main conversation is never inherited.
- **`SubagentStop` gate** (agent frontmatter `Stop`, auto-converted) — runs `check`; `exit 2` keeps the stage working until it passes. This is both the verifier and the loop primitive.
- **Orchestrator skill** — the driver; invokes stage skills in order. The model drives; hooks don't.
- **`PostToolUse:Skill`** (`pipeline-next.sh`) — best-effort advancement nudge; next stage derived from `<pipeline>-<order>-<step>` names.
- **Handoff** — code via the shared working tree, summaries via the next skill's `$ARGUMENTS`. No scratch files.
- **Dynamic injection (`` !`cmd` ``)** — available, unused: stages gather context with their own tools. Add e.g. `` !`git diff` `` to a stage skill to pre-load working-tree state into that stage's prompt.

## Rejected — do not re-try these
- **`SubagentStop` driving the next stage.** Its `additionalContext`/`block` route to the *subagent*, not the parent (docs: "to inject context into the parent session after a subagent returns, use a PostToolUse hook on the Agent tool"). It cannot advance the pipeline.
- **Editing `last_assistant_message` from a hook.** Input-only; no output field rewrites it.
- **A marker round-trip** (a stage stamps its name into its own result for a later hook to read). Adds model-dependent hops; the hook already knows the stage from `agent_type` / the naming.
- **Pure hook-driven advancement** (no orchestrator). Impossible — hooks can't launch skills.
- **A state pointer file or git for "which stage."** Avoided by the no-files rule; state = the order in the names + the orchestrator's own context.
- **`isolation: worktree` per stage.** Breaks the shared working tree — later stages wouldn't see earlier edits. All stages share one checkout.

## Gotchas
- **Restart after the first build.** A newly created top-level `.claude/skills/` is only watched after a Claude Code restart, so `/build-pipeline` (and generated skills) appear only after restarting.
- **8-block cap.** A gate whose `check` never passes is force-stopped after 8 consecutive blocks. Raise it with `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP`.
- **`PostToolUse:Skill` is unverified for forked skills.** If a stage finishes but the next isn't nudged, this is why — the `tool_input` field name / firing is undocumented. The orchestrator + gates still run the pipeline; confirm and fix the hook's jq empirically.
- **`check` polarity.** `check` exits 0 when the stage is *satisfied*; the gate `exit 2`s otherwise. Invert it and you get either no gating or an infinite block.
- **Soft prose gates.** Only runnable checks (tests/lint/typecheck) gate deterministically; "looks good" prose judgments are model-soft. A `type: agent` SubagentStop gate can judge prose with tool access — still model-soft, but more rigorous than a shell check.
- **Unattended runs need autonomy.** A stage that edits/bashes stalls on permission prompts unless its agent pre-allows those tools or sets `permissionMode: acceptEdits`.
- **Invocation flags.** Stage skills must stay model-invocable (so the orchestrator/nudge can call them). The orchestrator is `disable-model-invocation: true` (human-started).
- **Skill-side `model`/`effort`/`tools` are documentary.** The agent governs a forked stage's execution.

## Loops
- **Within a stage** — `check` = success, `tools` that let it fix, role = "fix and repeat." The gate loops it until clean (8-block cap).
- **Across stages** — edit the `/<pipeline>` orchestrator body to describe the loop (e.g. "repeat implement→review until review passes, max N rounds"). Fresh context each round; same soft-termination and soft-guard caveats as the Gotchas. Keep the looping pair last.
- **Hook-routed deterministic back-edge** — not built (needs `on-fail: <order>` routing + an iteration counter, which no-files blocks).
