const core = require('@actions/core');
const {GitHub, context} = require('@actions/github')
import "./grading.js"

try {
    const token = process.env.GITHUB_TOKEN
    const github = new GitHub(token, {} )

    const diff = await get_diff( context, github)
     if ( diff.length != 1 ) {
        core.setFailed( "🍐🔥❌ Debes cambiar exactamente 1 fichero, hay ❌" + diff.length + "❌ en el pull request" );
     }
} catch (error) {
    core.setFailed(error.message);
}
