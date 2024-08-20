
![alt text](https://github.com/mkalognomos/updatedbversion/blob/main/versions.jpg?raw=true)


# DB-Version-Updater

This project automates the process of updating the database version in your .Net project. It performs the following steps:

1. Checks out the 'develop' branch and pulls the latest changes.
2. Updates the database version in a specified file (`DbVersion.cs`).
3. Commits the changes to a new branch and pushes it to the remote repository.
4. Creates a pull request (PR) for the changes on Azure DevOps.
5. Optionally sets the PR to auto-complete.

## Prerequisites

- Node.js installed on your machine.
- An Azure DevOps personal access token.
- Simple Git installed (`npm install simple-git`).
- Axios installed (`npm install axios`).

## Setup

1. Clone this repository to your local machine.
2. Install the necessary dependencies by running:
   ```bash
   npm install
   ```
3. Configure the required constants in the script:

   ```javascript
   const gitUsername = 'your-git-username';
   const gitMail = 'your-git-email';
   const AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN = 'YOURS_AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN';
   const masterBranch = 'your-master-branch'
   const repoId = 'your-repo-id';
   const azureUserId = 'azure-your-userId';
   const projectId = 'your-projectId';
   const organizationName = 'name-of-your-organization';
   const pullReqUrl = "https://dev.azure.com/name-of-your-organization/your-projectId/_apis/git/repositories/your-repositoryId/pullrequests?api-version=6.0";
   const remote = 'your remote url for push';
   const repoPath = 'your-local-path-to-repo';
   const filePath = 'your-local-path-to-DbVersion-file/DbVersion.cs';
   ```

## Usage

To run the script, execute the following command:

```bash
node updatedbversion.js
```

Or simply double click run.bat file

The script will perform the following actions:

1. Checkout to the `develop` branch and pull the latest changes.
2. Update the database version in the specified file (`DbVersion.cs`).
3. Create a new branch with the updated version and push it to the remote repository.
4. Create a pull request on Azure DevOps.
5. Optionally set the PR to auto-complete.

## Detailed Steps

### 1. Checkout and Pull

The script checks out the `develop` branch and pulls the latest changes to ensure you have the most up-to-date version of the `DbVersion.cs` file.

### 2. Update Database Version

The script reads the `DbVersion.cs` file, finds the current version number, increments it by one, and writes the new version back to the file.

### 3. Commit and Push

A new branch is created, the updated `DbVersion.cs` file is committed to this branch, and the branch is pushed to the remote repository.

### 4. Create Pull Request

A pull request is created on Azure DevOps to merge the new branch into the `develop` branch. The PR includes a title and description indicating the new version number.

### 5. Set Auto-Complete (Optional)

The script can optionally set the pull request to auto-complete, which will merge the PR and delete the source branch once all conditions are met.

## Error Handling

The script includes error handling for each major step to ensure that issues are logged and can be addressed promptly.

## License

This project is licensed under the MIT License.

---

This `README.md` file provides an overview of the script and instructions on how to configure and use it. For any further questions or issues, please refer to the documentation or contact the project maintainers.
