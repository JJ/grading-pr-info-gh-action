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
    console.log( "✅ Hay solo un fichero en el pull request")
    console.log(file);
} catch (error) {
    core.setFailed(error.message);
}
