---
name: build-pipeline
description: "Scaffold one stage of a multi-step pipeline: a per-stage subagent (with a SubagentStop gate), a manual launcher skill, and a dynamic-workflow script that orchestrates the stages deterministically. Run once per step you want to add."
argument-hint: "<pipeline> <order> <step>: role / models / tools / check"
model: haiku
effort: low
allowed-tools: Task
---

Scaffold one pipeline stage by orchestrating two subagents with the Task tool, in order:

1. **New pipeline only.** If this is the first stage of a new pipeline, first spawn the `claude-code-guide` subagent to confirm the current Claude Code docs the scaffolding depends on: subagent `Stop`/`SubagentStop` gates, whether `agentType` fires those gates inside a workflow, and the dynamic-workflow script API. Skip this on later stages of the same pipeline.
2. **Scaffold.** Spawn the `build-pipeline` generator agent (subagent type `build-pipeline:build-pipeline`) and give it the stage spec below plus any doc corrections from step 1. Return its result.

Stage spec:

$ARGUMENTS
