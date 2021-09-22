const core = require("@actions/core");
const github = require("@actions/github");
import {
  get_diff,
  get_pull_info,
  set_vars,
  all_good,
  sorry,
} from "./grading.js";

const context = github.context;
const token = process.env.GITHUB_TOKEN;
const octokit = new github.getOctokit(token);
const diff = await get_diff(context, octokit);
const file = diff[0];
if (diff.length != 1) {
  core.setFailed(
    sorry(
      "Debes cambiar exactamente 1 fichero, hay ❌" +
        diff.length +
        "❌ en el pull request"
    )
  );
} else {
  core.info(
    all_good("Hay solo un fichero 📁" + file.from + "📁 en el pull request")
  );
}
set_vars(core, "file", file.from);
const fileMatch = /-(\d+)/.exec(file.from);
set_vars(core, "objetivo", fileMatch[1]);
if (file.additions != 1) {
  core.setFailed(
    sorry(
      "Debes cambiar exactamente 1 línea en el fichero, hay ❌" +
        file.additions +
        "❌ cambiadas en el pull request"
    )
  );
}

core.info(all_good("Hay solo una línea cambiada en el pull request"));

let changes_index = 0;
while (file.chunks[0].changes[changes_index].type != "add") {
  changes_index++;
}
const line = file.chunks[0].changes[changes_index].content;
const ghRepoMatch = /github.com\/(\S+)\/(.+?)\/pull\/(\d+)(?=\s+|\))/.exec(
  line
);

if (ghRepoMatch == null) {
  core.setFailed(
    sorry(
      "El cambio debe incluir el URL de un pull request, este incluye " + line
    )
  );
}

const pull_URL = ghRepoMatch[0];
core.info(all_good("Encontrado URL de un pull request 🔗" + pull_URL));
set_vars(core, "URL", pull_URL);
const user = ghRepoMatch[1];
const repo = ghRepoMatch[2];
set_vars(core, "user", user);
set_vars(core, "repo", repo);

if (context.payload.pull_request.user.login != user) {
  core.setFailed(
    sorry("El PR debe ser de tu propio repositorio, no de 🧍" + user)
  );
}

const pull_info = await get_pull_info(octokit, user, repo, ghRepoMatch[3]);
const pull_branch = pull_info[0];
if (pull_branch == "main") {
  core.setFailed(sorry("El PR debe ser desde una rama, no desde main"));
} else {
  core.info(
    all_good("Encontrado pull request desde la rama 🌿 " + pull_branch)
  );
}
set_vars(core, "rama", pull_branch);

if (pull_info[1] != "open") {
  core.setFailed(sorry("El PR de tu repositorio tiene que estar abierto"));
} else {
  core.info(all_good("El PR está todavía abierto 🔓"));
}
