---
name: improve-pipeline
description: Run a dynamic workflow on a real input, observe it without flooding context, verify its assumptions (gates fire, structured returns thread and branch, parallel stages overlap), then turn what you learn into edits to the workflow, its agents and skills, and the build-pipeline generator that produced it. Use after generating or changing a pipeline, or to dogfood and harden any Claude Code dynamic workflow.
argument-hint: "<workflow-name> <concrete input to run it on>"
model: opus
effort: high
allowed-tools: Workflow, Monitor, Task, TaskStop, Bash, Read, Edit, Write, Grep, Glob
---

Work in the main context; do not fork. This loop drives the Workflow tool, a Monitor, and task notifications, which only the main loop can orchestrate (a subagent cannot spawn subagents).

Input: `$ARGUMENTS` is the workflow name followed by a concrete input to run it on.

## 1. Run

- Start any precondition the workflow assumes (for example `npm run dev` for a stage that drives the browser) and confirm it is up before launching.
- Launch the workflow with the Workflow tool, passing the concrete input as `args`. Keep the transcript dir and runId from the result.
- If the workflow launches freshly generated agents by `agentType`, reload first. A mid-session agent file does not register: `agent({agentType})` resolves against the registry frozen at session start.

## 2. Observe without flooding context

- Arm a tree-change Monitor for a stage-by-stage play-by-play: poll `git status --short` and emit when the changed-file set changes.
- Read `<transcript-dir>/journal.jsonl`. It maps each agentId to its started and result records and holds each stage's return value, so it is the spine of the run.
- For stage detail, grep the per-stage `agent-*.jsonl`. Never read one whole: a subagent transcript is the full conversation and overflows context.

## 3. Verify the assumptions

- Gates fire: grep transcripts for `gate not satisfied`. A passing gate is silent, so absence proves nothing. To prove a gate fires, catch a stage that stops while its gate is unsatisfied, or run a throwaway probe agent whose gate appends to a log file (always exit 0 so it cannot loop), and reload so its `agentType` resolves.
- Structured returns thread and branch: read the verdict objects in the journal and confirm the workflow looped or broke on them as intended.
- Parallel stages overlap: in the journal, two stages show `started` before either shows `result`.
- The end state is real: run the check the workflow claims to enforce against the working tree.

## 4. Diagnose

For anything that did not progress as intended, trace it to the exact stage, agent, or workflow line, reading that one transcript with targeted greps.

## 5. Improve and propagate

- Fix the workflow, its agents, and its skills.
- Lift every general lesson into the build-pipeline generator templates, so the next pipeline it scaffolds embodies the fix instead of repeating the mistake.
- Re-run to confirm, then discard drill artifacts unless a commit stage recorded them on purpose.
