---
name: build-pipeline
description: Scaffold one stage of a deterministic multi-step pipeline — a per-stage skill + subagent (with a SubagentStop gate), wired into an orchestrator skill and a PostToolUse advancement hook. Run once per step you want to add.
disable-model-invocation: true
argument-hint: "<pipeline> <order> <step> — role / models / tools / check"
allowed-tools: Read Write Edit Glob Bash(chmod *)
---

# build-pipeline

Add one stage to a pipeline (run once per step). From the request, extract:

- `pipeline`, `order` (1, 2, 3…), `step` — names, kebab-case
- `role` — what the agent does; **condense to ≤5 bullets**
- agent `model`/`effort`/`tools` — defaults `sonnet`/`medium`/a sensible read+write set
- launcher `skill-model`/`skill-effort`/`skill-tools` — defaults `haiku`/`low`/empty; may differ from the agent's
- `check` — shell predicate, **exit 0 when the stage is satisfied** (e.g. `npx vitest run`); default `true`

Request: $ARGUMENTS

Ask only if `pipeline`, `order`, `step`, or `check` is missing and can't be inferred.

## Procedure

On the **first (bootstrap) call** for a pipeline, before writing: delegate to the `claude-code-guide` subagent to confirm current docs for the behaviors this depends on — frontmatter `Stop`→`SubagentStop`, `PostToolUse:Skill` routing + which `tool_input` field names the skill, `context: fork` model resolution — and apply any corrections to the templates first. Proceed as-is if it's unavailable.

Fill `{{PLACEHOLDERS}}` in the templates at `${CLAUDE_SKILL_DIR}/templates/`, then:

1. Write `.claude/agents/<pipeline>-<order>-<step>.md` from `stage-agent.md` (`{{ROLE}}` ≤5 bullets; `{{MODEL}}`/`{{EFFORT}}`/`{{TOOLS}}`; `{{CHECK}}`).
2. Write `.claude/skills/<pipeline>-<order>-<step>/SKILL.md` from `stage-skill.md` (`{{SKILL_MODEL}}`/`{{SKILL_EFFORT}}`/`{{SKILL_TOOLS}}`).
3. Orchestrator `.claude/skills/<pipeline>/SKILL.md`: absent → create from `orchestrator.md` (this step first); present → append `<order>. <order>-<step>  ->  /<pipeline>-<order>-<step>` to its ordered list.
4. **First call only** (files absent): copy `pipeline-next.sh` to `.claude/hooks/`, `chmod +x` it, and merge into `.claude/settings.json` without clobbering existing hooks:
   ```json
   { "hooks": { "PostToolUse": [ { "matcher": "Skill",
     "hooks": [ { "type": "command", "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/pipeline-next.sh" } ] } ] } }
   ```

Idempotent: re-running a step overwrites its skill+agent; the hook and settings are written once.

The templates encode the architecture (fresh-context fork, the gate, the advancement hook). For the rationale, the invariants to preserve when editing templates, rejected approaches, gotchas, and loops, read `DESIGN.md`.
