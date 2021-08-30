const core = require('@actions/core')
const github = require('@actions/github')
import {get_diff, set_vars} from "./grading.js"

try {
    const context = github.context
    const token = process.env.GITHUB_TOKEN
    const octokit = new github.getOctokit(token)
    const diff = await get_diff( context, octokit )
    console.log( context.payload.pull_request   )
    if ( diff.length != 1 ) {
        core.setFailed( "🍐🔥❌ Debes cambiar exactamente 1 fichero, hay ❌" + diff.length + "❌ en el pull request" )
    }
    const file = diff[0]
    console.log( "✅ Hay solo un fichero 📁" + file.from + "📁 en el pull request")

    if ( file.additions != 1 ) {
	core.setFailed( "🍐🔥❌ Debes cambiar exactamente 1 línea en el fichero, hay ❌" + file.additions + "❌ cambiadas en el pull request" )
    }
    core.info( "✅ Hay solo una línea cambiada en el pull request")

    console.log(  file.chunks[0].changes[0] )
    console.log(  file.chunks[0] )
    let changes_index = 0
    while ( file.chunks[0].changes[changes_index].type != 'add' ) {
	changes_index++
    }
    
    const line = file.chunks[0].changes[changes_index].content
    console.log( line )
    const ghRepoMatch = /github.com\/(\S+)\/(.+?)\/pull\/(\d+)(?=\s+|\))/.exec(line)

    if (  ghRepoMatch == null ) {
	core.setFailed( "🍐🔥❌ El cambio debe incluir el URL del pull request " )
    }
    set_vars(core, 'user', ghRepoMatch[1])
    set_vars(core, 'repo', ghRepoMatch[2])

} catch (error) {
    core.setFailed("❌ Algo indeterminado ha fallado ❌. Mira el mensaje: " + error.message);
}
