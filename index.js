const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    try {
        const token = core.getInput('repo_token');
        const octokit = github.getOctokit(token);

        const { owner, repo } = github.context.repo;
        const pull_number = github.context.payload.pull_request.number;

        // Fetch the pull request details
        const { data: pullRequest } = await octokit.rest.pulls.get({
            owner,
            repo,
            pull_number,
        });

        const mergeable = pullRequest.mergeable;
        const mergeable_state = pullRequest.mergeable_state;

        console.log(`PR mergeable: ${mergeable}`);
        console.log(`PR mergeable state: ${mergeable_state}`);

        if (mergeable === false || mergeable_state === 'dirty') {
            core.setFailed("Merge conflicts detected. Please resolve the conflicts and update the pull request.");

            await octokit.rest.issues.addLabels({
                owner,
                repo,
                issue_number: pull_number,
                labels: ['merge-conflict'],
            });

            console.log('Label "merge-conflict" added to the pull request.');
        } else {
            console.log("No merge conflicts detected.");
        }
    } catch (error) {
        core.setFailed(`Failed to fetch PR details: ${error.message}`);
    }
}

run();
