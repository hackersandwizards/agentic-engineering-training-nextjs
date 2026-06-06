---
name: {{PIPELINE}}-{{ORDER}}-{{STEP}}
description: {{PIPELINE}} pipeline stage {{ORDER}} ({{STEP}})
model: {{MODEL}}
effort: {{EFFORT}}
tools: {{TOOLS}}
hooks:
  Stop:
    - hooks:
        - type: command
          command: "{{CHECK}} || { echo '{{PIPELINE}}/{{STEP}}: check failed, keep working' >&2; exit 2; }"
---
{{ROLE}}
