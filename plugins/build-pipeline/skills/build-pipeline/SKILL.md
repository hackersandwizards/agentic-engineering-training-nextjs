---
name: build-pipeline
description: Scaffold one stage of a multi-step pipeline: a per-stage subagent (with a SubagentStop gate), a manual launcher skill, and a dynamic-workflow script that orchestrates the stages deterministically. Run once per step you want to add.
argument-hint: "<pipeline> <order> <step>: role / models / tools / check"
context: fork
agent: build-pipeline
model: haiku
effort: low
allowed-tools: Task
---

On the first call for a pipeline, spawn the `claude-code-guide` subagent (via Task) to confirm the current docs this scaffolding depends on. Then scaffold the stage from this request:

$ARGUMENTS
