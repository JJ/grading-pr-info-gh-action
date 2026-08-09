import * as core from "@actions/core";
import * as github from "@actions/github";
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
const title_prefix = core.getInput("prefijo");
if (diff.length != 1) {
  core.setFailed(
    sorry(
      "Debes cambiar exactamente un fichero, hay ❌" +
        diff.length +
        "❌ en el pull request"
    )
  );
} else {
  core.info(
    all_good("Hay solo un fichero 📁" + file.from + "📁 en el pull request")
  );

  set_vars(core, "file", file.from);
  const fileMatch = /-(\d+)/.exec(file.from);
  set_vars(core, "objetivo", fileMatch[1]);
  if (file.additions != 1) {
    core.setFailed(
      sorry(
        "Debes cambiar exactamente una línea en el fichero, hay ❌" +
          file.additions +
          "❌ cambiadas en el pull request"
      )
    );
  } else {
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
          "El cambio debe incluir el URL de un pull request en una línea de una tabla, este incluye " +
            line
        )
      );
    } else {
      const pull_URL = ghRepoMatch[0];
      core.info(all_good("Encontrado URL de un pull request 🔗" + pull_URL));
      set_vars(core, "URL", pull_URL);
      const user = ghRepoMatch[1];
      const repo = ghRepoMatch[2];
      const pull_number = ghRepoMatch[3];
      let checkout_repo = `${user}/${repo}`;
      set_vars(core, "user", user);
      set_vars(core, "repo", repo);
      set_vars(core, "pull_number", pull_number);

      const pull_info = await get_pull_info(octokit, user, repo, pull_number);
      if (!pull_info.pr_title.startsWith(title_prefix)) {
        core.setFailed(
          sorry(
            `El título del PR en tu repositorio debe empezar con «${title_prefix}», este dice «${pull_info.pr_title}»`
          )
        );
      }
      let pull_branch = pull_info.label;
      if (pull_branch.match(/:/)) {
        const user_branch = pull_branch.split(":");
        checkout_repo = `${user_branch[0]}/${repo}`;
        pull_branch = user_branch[1];
      }
      set_vars(core, "checkout_repo", checkout_repo);
      if (pull_branch == "main") {
        core.setFailed(sorry("El PR debe ser desde una rama, no desde main"));
      } else {
        core.info(
          all_good("Encontrado pull request desde la rama 🌿 " + pull_branch)
        );
      }
      set_vars(core, "rama", pull_branch);

      if (pull_info.state != "open") {
        core.setFailed(
          sorry("El PR de tu repositorio tiene que estar abierto")
        );
      } else {
        core.info(all_good("El PR está todavía abierto 🔓"));
      }

      set_vars(core, "pr_milestone", pull_info.milestone_number);
      if (typeof pull_info.milestone_number === "number") {
        core.info(
          all_good(
            `El PR está asignado al milestone 🚧 ${pull_info.milestone_number}`
          )
        );
      }

      const vMatch = /\bv(\d+\.\d+\.\d+)/.exec(line);
      if (vMatch == null) {
        core.setFailed(
          sorry(
            "El cambio debe incluir la versión del proyecto en una línea de una tabla en el formato «vx.y.z», este incluye " +
              line
          )
        );
      } else {
        core.info(all_good("Encontrada versión del proyecto 📦" + vMatch[0]));
        set_vars(core, "version", vMatch[0]);
      }

    }
  }
}
