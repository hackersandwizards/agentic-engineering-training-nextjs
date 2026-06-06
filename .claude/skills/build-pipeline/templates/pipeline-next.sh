#!/bin/bash
# PostToolUse:Skill advancement backstop for build-pipeline pipelines.
# Reads the just-invoked skill name, derives the next stage from <pipeline>-<order>-<step>
# naming, and nudges the parent to invoke it. Silent for non-pipeline skills and after the
# final stage. NOTE: the Skill tool's input field name is undocumented; the jq below tries
# the likely keys — confirm/fix during the pipeline test plan.
INPUT=$(cat)
NAME=$(echo "$INPUT" | jq -r '.tool_input.name // .tool_input.skill // .tool_input.command // empty' | sed 's#^/##')
[[ "$NAME" =~ ^(.+)-([0-9]+)-(.+)$ ]] || exit 0            # not a pipeline stage
PIPE="${BASH_REMATCH[1]}"; NEXT=$(( ${BASH_REMATCH[2]} + 1 ))
D=$(ls -d "$CLAUDE_PROJECT_DIR/.claude/skills/${PIPE}-${NEXT}-"*/ 2>/dev/null | head -1)
[ -z "$D" ] && exit 0                                       # last stage; pipeline done
S=$(basename "$D")
jq -nc --arg s "$S" '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:("Pipeline: previous stage complete. Next, invoke /"+$s+", passing the previous stage output as its argument.")}}'
