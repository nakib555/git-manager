import re

with open('src/AppContext.tsx', 'r') as f:
    code = f.read()

old_delete = """  const deleteBranch = async (branchName: string) => {
    if (!state.currentRepo) return;
    if (!state.githubToken || !state.currentRepoOwner) {
      showToast("GitHub token and repository owner are required to delete a branch.");
      return;
    }
    try {
      const token = state.githubToken;
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      };
      const owner = state.currentRepoOwner;
      const repo = state.currentRepo;
      
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branchName}`,
        {
          method: "DELETE",
          headers,
        }
      );
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Status ${res.status}`);
      }
      
      showToast(`Branch '${branchName}' deleted from GitHub!`);
      await fetchRepoDetails(repo, owner);
    } catch (error: any) {
      console.error("Error deleting GitHub branch:", error);
      showToast(`Failed to delete branch: ${error.message || error}`);
    }
  };"""

new_delete = """  const deleteBranch = async (branchName: string) => {
    if (!state.currentRepo) return;
    if (state.githubToken && state.currentRepoOwner) {
      try {
        const token = state.githubToken;
        const headers = {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        };
        const owner = state.currentRepoOwner;
        const repo = state.currentRepo;
        
        const res = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branchName}`,
          {
            method: "DELETE",
            headers,
          }
        );
        
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Status ${res.status}`);
        }
        
        showToast(`Branch '${branchName}' deleted from GitHub!`);
        await fetchRepoDetails(repo, owner, false, state.currentBranch || undefined);
      } catch (error: any) {
        console.error("Error deleting GitHub branch:", error);
        showToast(`Failed to delete branch: ${error.message || error}`);
      }
    } else {
      const key = `local_details_${state.currentRepo}_branches`;
      const current = getLocalRepoDetails(state.currentRepo, "branches");
      const updated = current.filter((b: any) => b.name !== branchName);
      localStorage.setItem(key, JSON.stringify(updated));
      setState(prev => ({
        ...prev,
        activeBranches: updated
      }));
      showToast(`Local branch '${branchName}' deleted!`);
    }
  };"""

code = code.replace(old_delete, new_delete)

with open('src/AppContext.tsx', 'w') as f:
    f.write(code)
