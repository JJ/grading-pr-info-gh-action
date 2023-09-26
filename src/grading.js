const parse = require("parse-diff");

export async function get_diff(context, octokit) {
  const diff_url = context.payload.pull_request.diff_url;
  const result = await octokit.request(diff_url);
  return parse(result.data);
}

export async function get_pull_info(octokit, user, repo, pull_number) {
  const pull_url = `https://api.github.com/repos/${user}/${repo}/pulls/${pull_number}`;
  const result = await octokit.request(pull_url);
  console.log(result.data);
  let milestone_number;
  if (result.data.milestone !== null) {
    milestone_number = result.data.milestone.number;
  }
  return {
    label: result.data.head.label,
    state: result.data.state,
    milestone_number: milestone_number,
    pr_title: result.data.title,
  };
}

export function set_vars(core, var_name, value) {
  core.setOutput(var_name, value);
  core.exportVariable(var_name, value);
}

export function all_good(mensaje) {
  return "✅🍊️‍🔥 " + mensaje;
}

export function sorry(mensaje) {
  return "🍋💥❌ " + mensaje;
}
