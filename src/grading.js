const core = require('@actions/core');
const {GitHub, context} = require('@actions/github')
const parse = require('parse-diff')

export async function get_diff( context, octokit ) {
    const diff_url = context.payload.pull_request.diff_url
    const result = await octokit.request( diff_url )
    return parse( result.data )
}

export  function set_vars( core, var_name, value ) {
    core.setOutput(var_name, value)
    core.setEnv(var_name, value )
}
