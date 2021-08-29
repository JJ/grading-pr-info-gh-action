const core = require('@actions/core')
const github = require('@actions/github')
import get_diff from "./grading.js"

try {
    const context = github.context
    const token = process.env.GITHUB_TOKEN
    const octokit = new github.getOctokit(token)
    const diff = await get_diff( context, octokit )

    if ( diff.length != 1 ) {
        core.setFailed( "🍐🔥❌ Debes cambiar exactamente 1 fichero, hay ❌" + diff.length + "❌ en el pull request" )
    }
    const file = diff[0]
    console.log( "✅ Hay solo un fichero 📁" + file.from + "📁 en el pull request")

    if ( file.additions != 1 ) {
	core.setFailed( "🍐🔥❌ Debes cambiar exactamente 1 línea en el fichero, hay ❌" + file.additions + "❌ cambiadas en el pull request" )
    }
    core.info( "✅ Hay solo una línea cambiada en el pull request")

    const line = file.chunks[0].changes[0].content
    if (  line.indexOf( "github.com" ) < 0 ) {
	core.setFailed( "🍐🔥❌ El cambio debe incluir el URL de la rama " )
    }

    var ghRepoMatch = /github.com\/(\S+)\/(.+?)(?=\s+|\))/.exec(line)
    core.setOutput('user',ghRepoMatch[1])
    core.setOutput('repo',ghRepoMatch[2])
    console.log( ghRepoMatch )
} catch (error) {
    core.setFailed("❌ Algo indeterminado ha fallado ❌. Mira el mensaje: " + error.message);
}
