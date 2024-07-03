const fs = require('fs');

const simpleGit = require('simple-git');

const axios = require('axios');

const gitUsername = 'your-git-username'

const gitMail = 'your-git-email'

const masterBranch = 'develop'

const AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN = 'YOURS_AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN'

const repoId = 'your-repo-id'

const azureUserId = 'azure-your-userId'

const projectId = 'your-projectId'

const organizationName = 'name-of-your-organization'
            
const pullReqUrl = "https://{dev.azure.com}/{name-of-your-organization}/{your-projectId}/_apis/git/repositories/{your-repositoryId}/pullrequests?api-version=6.0"

const remote = 'your remote url for push'

const repoPath = 'your-local-path-to-repo'

const filePath = 'your-local-path-to-DbVersion-file/DbVersion.cs';

const git = simpleGit(repoPath);


async function start() {
    // Checkout to 'masterBranch' branch and pull to get the latest DB version
    try {
        await git.addConfig('user.name', gitUsername);
        await git.addConfig('user.email', gitMail);
        await git.checkout(masterBranch);
        await git.pull('origin', masterBranch);
        console.log(`1. Checked out and pulled the latest DB version in ${masterBranch} branch.`);

        // Update DB version in file
        await updateVersion(filePath);
    } catch (err) {
        console.error('Error during checkout and pull:', err);
    }
}

async function updateVersion(filePath) {
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        const versionRegex = /public const int VERSION = (\d+);/;
        const match = data.match(versionRegex);

        if (match) {
            // Increase version number
            const currentVersion = parseInt(match[1], 10);
            const newVersion = currentVersion + 1;
            const newData = data.replace(versionRegex, `public const int VERSION = ${newVersion};`);
            await fs.promises.writeFile(filePath, newData, 'utf8');
            console.log(`2. Update VERSION to ${newVersion} in DbVersion.cs`);

            // Git push new branch
            await gitCommitAndPush(filePath, newVersion);
        } else {
            console.log('VERSION constant not found.');
        }
    } catch (err) {
        console.error('Error reading or updating the file:', err);
    }
}

async function gitCommitAndPush(filePath, newVersion) {
    const branchName = `your-new-branch-name/dbv${newVersion}`;

    try {
        await git.addConfig('user.name', gitUsername);
        await git.addConfig('user.email', gitMail);

        // Create dbVersionUpdate branch and push to repo.
        await git.checkoutLocalBranch(branchName);
        await git.add(filePath);
        await git.commit(`Update VERSION to ${newVersion}`);
        const remotes = await git.getRemotes();
        if (!remotes.find(remote => remote.name === 'origin')) {
            await git.addRemote('origin', remote);
        }
        await git.push(['-u', 'origin', branchName]);
        console.log('3. New branch created and pushed successfully to Azure.');

        // Create PR
        await createPullRequest(branchName, newVersion);
    } catch (err) {
        console.error('Error in Git operations:', err);
    }
}

async function createPullRequest(branchName, newVersion) {
    const title = `update database version to ${newVersion}`;
    const description = `Update the version number in DbVersion.cs to ${newVersion}.`;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`:${AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN}`).toString('base64')}`
    };
    const data = {
        sourceRefName: `refs/heads/${branchName}`, // Source branch
        targetRefName: `refs/heads/${masterBranch}`,       // Target branch
        title,
        description,
        reviewers: [
            {
                id: 'b81d72e2-0ada-42c4-9882-41793a0717' // reviewer id (Optional)
            },
            {
                id: '3d5d1a8e-efad-4bd6-8632-ffec5a717e' // reviewer id (Optional)
            },
            {
                id: '7cc25ecd-3a29-4185-956f-a3f038d98f' // reviewer id (Optional)
            },
            {
                id: 'a0a5b0f5-7e01-4a0a-9c9f-673151db9e' // reviewer id (Optional)
            }
        ]
    };

    try {
        const response = await axios.post(pullReqUrl, data, { headers });
        //console.log(response.data); uncomment to debug response
        console.log('4. New PR created and set successfully to Azure.');
        
        const pullRequestId = response.data.pullRequestId;

        // Update the PR to set auto-complete (Optional)
        await setAutoComplete(pullRequestId, branchName, newVersion);

    } catch (error) {
        console.error('Error creating pull request:', error);
    }
}

async function setAutoComplete(pullRequestId, branchName, newVersion) {
    const autoCompleteUrl = `https:dev.azure.com/${organizationName}/${projectId}/_apis/git/repositories/${repoId}/pullRequests/${pullRequestId}?api-version=6.0`;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`:${AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN}`).toString('base64')}`
    };
    const data = {
        autoCompleteSetBy: {
            id: azureUserId // Azure your userId
        },
        completionOptions: {
            deleteSourceBranch: true,
            mergeCommitMessage: `Auto-completing PR to update version to ${newVersion}`
        }
    };

    try {
        const response = await axios.patch(autoCompleteUrl, data, { headers });
        //console.log(response.data); uncomment to debug response
        console.log('5. Auto-complete, set successfully for PR.');
        console.log('Done!');
    } catch (error) {
        console.log(error)
        console.log('Error setting auto-complete');
    }
}

start();