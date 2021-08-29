const core = require('@actions/core');
const github = require('@actions/github')
import get_diff from "./grading.js"

try {
    const context = github.context
    const token = process.env.GITHUB_TOKEN
    const octokit = new github.getOctokit(token)
    const diff = await get_diff( context, octokit )

    if ( diff.length != 1 ) {
        core.setFailed( "🍐🔥❌ Debes cambiar exactamente 1 fichero, hay ❌" + diff.length + "❌ en el pull request" );
    }
    const file = diff[0];
    core.info( "✅ Hay solo un fichero en el pull request")
    core.info(file);

    if ( file.additions != 1 ) {
	core.setFailed( "🍐🔥❌ Debes cambiar exactamente 1 línea en el fichero, hay ❌" + file.additions + "❌ cambiadas en el pull request" );
    }
    core.info( "✅ Hay solo una sola línea cambiada en el pull request")
} catch (error) {
    core.setFailed("❌ Algo indeterminado ha fallado ❌. Mira el mensaje: " + error.message);
}
