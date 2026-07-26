import re

with open('src/AppContext.tsx', 'r') as f:
    code = f.read()

# Update fetchRepoDetails state update
old_state_update = """      setState((prev) => ({
        ...prev,
        activeCommits: mergedCommits,"""

new_state_update = """      localStorage.setItem("currentBranch", activeBranch);
      setState((prev) => ({
        ...prev,
        currentBranch: activeBranch,
        activeCommits: mergedCommits,"""

code = code.replace(old_state_update, new_state_update)

with open('src/AppContext.tsx', 'w') as f:
    f.write(code)
