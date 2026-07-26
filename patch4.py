import re

with open('src/AppContext.tsx', 'r') as f:
    code = f.read()

# Fix the useEffects calling fetchRepoDetails
old_effect1 = """  useEffect(() => {
    if (state.currentRepo) {
      const owner = state.currentRepoOwner || (state.githubToken && state.githubUser?.login ? state.githubUser.login : null);
      if (owner) {
        fetchRepoDetails(state.currentRepo, owner);
      } else {
        const matchedRepo = state.githubRepos.find(r => r.name === state.currentRepo);
        const resolvedOwner = (matchedRepo as any)?.owner?.login || 'facebook';
        fetchRepoDetails(state.currentRepo, resolvedOwner);
      }
    }
  }, [state.currentRepo, state.githubToken, state.currentRepoOwner, refreshTrigger]);"""

new_effect1 = """  useEffect(() => {
    if (state.currentRepo) {
      const owner = state.currentRepoOwner || (state.githubToken && state.githubUser?.login ? state.githubUser.login : null);
      const targetBranch = state.currentBranch || undefined;
      if (owner) {
        fetchRepoDetails(state.currentRepo, owner, false, targetBranch);
      } else {
        const matchedRepo = state.githubRepos.find(r => r.name === state.currentRepo);
        const resolvedOwner = (matchedRepo as any)?.owner?.login || 'facebook';
        fetchRepoDetails(state.currentRepo, resolvedOwner, false, targetBranch);
      }
    }
  }, [state.currentRepo, state.githubToken, state.currentRepoOwner, refreshTrigger]);"""

code = code.replace(old_effect1, new_effect1)


old_effect2 = """  useEffect(() => {
    let timer: any;
    if (state.githubToken) {
      timer = setInterval(() => {
        fetchGitHubData(state.githubToken!, true);
        if (state.currentRepo) {
          const owner = state.currentRepoOwner || (state.githubUser?.login ? state.githubUser.login : null);
          if (owner) {
            fetchRepoDetails(state.currentRepo, owner, true);
          } else {
            const matchedRepo = state.githubRepos.find(r => r.name === state.currentRepo);
            const resolvedOwner = (matchedRepo as any)?.owner?.login || 'facebook';
            fetchRepoDetails(state.currentRepo, resolvedOwner, true);
          }
        }
      }, 1000);"""

new_effect2 = """  useEffect(() => {
    let timer: any;
    if (state.githubToken) {
      timer = setInterval(() => {
        fetchGitHubData(state.githubToken!, true);
        if (state.currentRepo) {
          const owner = state.currentRepoOwner || (state.githubUser?.login ? state.githubUser.login : null);
          const targetBranch = state.currentBranch || undefined;
          if (owner) {
            fetchRepoDetails(state.currentRepo, owner, true, targetBranch);
          } else {
            const matchedRepo = state.githubRepos.find(r => r.name === state.currentRepo);
            const resolvedOwner = (matchedRepo as any)?.owner?.login || 'facebook';
            fetchRepoDetails(state.currentRepo, resolvedOwner, true, targetBranch);
          }
        }
      }, 1000);"""

code = code.replace(old_effect2, new_effect2)

with open('src/AppContext.tsx', 'w') as f:
    f.write(code)
