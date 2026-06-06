---
name: {{PIPELINE}}-{{ORDER}}-{{STEP}}
description: Run the {{STEP}} stage of the {{PIPELINE}} pipeline
context: fork
agent: {{PIPELINE}}-{{ORDER}}-{{STEP}}
model: {{SKILL_MODEL}}
effort: {{SKILL_EFFORT}}
allowed-tools: {{SKILL_TOOLS}}
---
Input from the previous stage:

$ARGUMENTS

Do this stage's work and return your output for the next stage.
