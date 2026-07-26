import re

with open('src/AppContext.tsx', 'r') as f:
    code = f.read()

code = code.replace(
    'const fetchRepoDetails = async (repoName: string, owner: string, isBackground = false) => {',
    'const fetchRepoDetails = async (repoName: string, owner: string, isBackground = false, branchOverride?: string) => {'
)

old_commits_block = """      // 1. Fetch Commits
      console.log(`Fetching commits for ${owner}/${repoName}...`);
      const commitsRes = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/commits?per_page=15`,
        { headers },
      );"""

new_commits_block = """      // 1. Fetch Commits
      let activeBranch = branchOverride;
      if (!activeBranch) {
        // Try to get default branch
        try {
          const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, { headers });
          if (repoRes.ok) {
            const repoData = await repoRes.json();
            activeBranch = repoData.default_branch;
          }
        } catch (e) {}
      }
      if (!activeBranch) activeBranch = "main";
      
      console.log(`Fetching commits for ${owner}/${repoName} on branch ${activeBranch}...`);
      const commitsRes = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/commits?sha=${activeBranch}&per_page=15`,
        { headers },
      );"""

code = code.replace(old_commits_block, new_commits_block)

old_branches = """        branchesData = rawBranches.map((b: any) => ({
          name: b.name,
          desc: `Branch head: ${b.commit.sha.substring(0, 7)}`,
          isDefault: b.name === "main" || b.name === "master",
          borderColor:
            b.name === "main" || b.name === "master"
              ? "#38BDF8"
              : "transparent",
        }));"""

new_branches = """        branchesData = rawBranches.map((b: any) => ({
          name: b.name,
          desc: `Branch head: ${b.commit.sha.substring(0, 7)}`,
          isDefault: b.name === activeBranch,
          borderColor:
            b.name === activeBranch
              ? "#38BDF8"
              : "transparent",
        }));"""

code = code.replace(old_branches, new_branches)

code = code.replace(
    '`https://api.github.com/repos/${owner}/${repoName}/git/trees/HEAD?recursive=1`',
    '`https://api.github.com/repos/${owner}/${repoName}/git/trees/${activeBranch}?recursive=1`'
)

new_switch_branch = """  const switchBranch = async (branchName: string) => {
    if (!state.currentRepo || !state.currentRepoOwner) return;
    localStorage.setItem("currentBranch", branchName);
    setState((prev) => ({ ...prev, currentBranch: branchName }));
    await fetchRepoDetails(state.currentRepo, state.currentRepoOwner, false, branchName);
  };
  const openActionSheet = () =>"""

code = code.replace('  const openActionSheet = () =>', new_switch_branch)

with open('src/AppContext.tsx', 'w') as f:
    f.write(code)
