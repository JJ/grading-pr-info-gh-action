const core = require('@actions/core')
const github = require('@actions/github')
import {get_diff, get_pull_branch, set_vars, all_good, sorry} from "./grading.js"

try {
    const context = github.context
    const token = process.env.GITHUB_TOKEN
    const octokit = new github.getOctokit(token)
    const diff = await get_diff( context, octokit )
    if ( diff.length != 1 ) {
        core.setFailed( sorry("Debes cambiar exactamente 1 fichero, hay ❌" + diff.length + "❌ en el pull request" ))
    }
    const file = diff[0]
    core.info( all_good("Hay solo un fichero 📁" + file.from + "📁 en el pull request"))
    set_vars(core,'file', file.from)
    if ( file.additions != 1 ) {
	core.setFailed( sorry("Debes cambiar exactamente 1 línea en el fichero, hay ❌" + file.additions + "❌ cambiadas en el pull request" ))
    }
    core.info( all_good("Hay solo una línea cambiada en el pull request"))

    let changes_index = 0
    while ( file.chunks[0].changes[changes_index].type != 'add' ) {
	changes_index++
    }
    const line = file.chunks[0].changes[changes_index].content
    const ghRepoMatch = /github.com\/(\S+)\/(.+?)\/pull\/(\d+)(?=\s+|\))/.exec(line)

    if (  ghRepoMatch == null ) {
	core.setFailed( sorry("El cambio debe incluir el URL del pull request " ))
    }
    const pull_URL =  ghRepoMatch[0]
    core.info( all_good("Encontrado URL de un pull request " + pull_URL ))
    set_vars(core, 'URL', pull_URL)
    const user =  ghRepoMatch[1]
    const repo =  ghRepoMatch[2]
    set_vars(core, 'user', user)
    set_vars(core, 'repo', repo)

    const pull_branch = await get_pull_branch( octokit, user, repo, ghRepoMatch[3] )
    if ( pull_branch == 'main' ) {
	core.setFailed( sorry("El PR debe ser desde una rama" ))
    }
    core.info( all_good("Encontrado pull request desde la rama" + pull_branch ))
    set_vars( core, 'rama', pull_branch )
} catch (error) {
    core.setFailed("❌ Algo indeterminado ha fallado ❌. Mira el mensaje: " + error.message);
}
