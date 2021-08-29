const core = require('@actions/core');
const {GitHub, context} = require('@actions/github')

try {
    const token = core.getInput('github-token', {required: true})
    const github = new GitHub(token, {} )
} catch (error) {
    core.setFailed(error.message);
}

function get_and_check_file_changed( context, github, core ) {
    const result = get_diff( context, github )
    const files = parse(result.data)
    if ( files.length != 1 ) {
        core.setFailed( "🍐🔥❌ Debes cambiar exactamente 1 fichero, hay ❌" + files.length + "❌ en el pull request" );
    }

}

function get_diff( context, github ) {
    const diff_url = context.payload.pull_request.diff_url
    return await github.request( diff_url )
}
