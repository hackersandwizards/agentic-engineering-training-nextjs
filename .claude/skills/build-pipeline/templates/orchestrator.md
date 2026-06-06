---
name: {{PIPELINE}}
description: Run the {{PIPELINE}} pipeline end to end
disable-model-invocation: true
argument-hint: "<initial input>"
---
Run the {{PIPELINE}} pipeline. Starting input: $ARGUMENTS

Stages, in order:
{{ORDER}}. {{ORDER}}-{{STEP}}  ->  /{{PIPELINE}}-{{ORDER}}-{{STEP}}

Invoke each stage skill in order, passing the previous stage's returned output as its
argument (stage 1 gets the starting input). Each stage's SubagentStop gate must pass
before it returns. After each stage a PostToolUse hook reminds you which stage skill is
next — follow it. Report after the final stage.
