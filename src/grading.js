const core = require('@actions/core');
const {GitHub, context} = require('@actions/github')
const parse = require('parse-diff')

export default async function get_diff( context, github ) {
    const diff_url = context.payload.pull_request.diff_url
    const result = await github.request( diff_url )
    return parse( result.data )
}
