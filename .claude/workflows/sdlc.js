export const meta = {
  name: "sdlc",
  description: "Run the sdlc pipeline end to end",
};

// Stages run as their named agents: model, effort, tools, and the SubagentStop gate
// all come from each agent's frontmatter.
//
// Flow: plan -> tests -> implement -> simplify, then review-claude || review-codex in
// parallel; converge decides. On issues, loop back through implement -> simplify and
// re-review, up to 3 rounds, then escalate to a human. When clean: acceptance -> commit -> report.

const stage = (name, prev, phase, schema) =>
  agent(
    `Input from the previous stage:\n\n${prev}\n\nDo the ${phase} stage and return your output for the next stage.`,
    schema ? { agentType: name, phase, schema } : { agentType: name, phase },
  );

const VERDICT = {
  type: "object",
  properties: {
    issues: { type: "boolean" },
    fixes: { type: "array", items: { type: "string" } },
  },
  required: ["issues"],
};

let out = args ?? "";
out = await stage("sdlc-1-plan", out, "plan");
out = await stage("sdlc-2-tests", out, "tests");
out = await stage("sdlc-3-implement", out, "implement");
out = await stage("sdlc-4-simplify", out, "simplify");

let round = 0;
let verdict;
while (true) {
  const [reviewClaude, reviewCodex] = await parallel([
    () => stage("sdlc-5-review-claude", out, "review-claude"),
    () => stage("sdlc-6-review-codex", out, "review-codex"),
  ]);
  verdict = await stage(
    "sdlc-7-converge",
    `claude review:\n${reviewClaude}\n\ncodex review:\n${reviewCodex}`,
    "converge",
    VERDICT,
  );
  if (!verdict.issues) break;
  if (++round >= 3) {
    return { status: "needs-human", verdict, rounds: round };
  }
  out = await stage("sdlc-3-implement", JSON.stringify(verdict), "implement");
  out = await stage("sdlc-4-simplify", out, "simplify");
}

out = await stage("sdlc-8-acceptance", out, "acceptance");
out = await stage("sdlc-9-commit", out, "commit");
out = await stage("sdlc-10-report", out, "report");
// build-pipeline: append stage lines above this line
return out;
