const core = require('@actions/core');
const {GitHub, context} = require('@actions/github')
const parse = require('parse-diff')

export async function get_diff( context, octokit ) {
    const diff_url = context.payload.pull_request.diff_url
    const result = await octokit.request( diff_url )
    return parse( result.data )
}

export async function get_pull( context, octokit, user, repo, pull_number ) {
    const pull_url = `https://api.github.com/repos/{user}/{repo}/pulls/{pull_number}`
    const result = await octokit.request( pull_url )
    console.log( result )
    return parse( result.data )
}

export  function set_vars( core, var_name, value ) {
    core.setOutput(var_name, value)
    core.exportVariable(var_name, value )
}
