const fs = require('fs');
let code = fs.readFileSync('src/AppContext.tsx', 'utf8');

// Update fetchRepoDetails signature
code = code.replace(
  'const fetchRepoDetails = async (repoName: string, owner: string, isBackground = false) => {',
  'const fetchRepoDetails = async (repoName: string, owner: string, isBackground = false, branchOverride?: string) => {'
);

// We need to resolve the active branch.
// Let's find: `// 1. Fetch Commits`
const fetchCommitsBlock = `      // 1. Fetch Commits
      let activeBranch = branchOverride;
      if (!activeBranch) {
        // Try to get default branch
        try {
          const repoRes = await fetch(\`https://api.github.com/repos/\${owner}/\${repoName}\`, { headers });
          if (repoRes.ok) {
            const repoData = await repoRes.json();
            activeBranch = repoData.default_branch;
          }
        } catch (e) {}
      }
      if (!activeBranch) activeBranch = "main";
      
      console.log(\`Fetching commits for \${owner}/\${repoName} on branch \${activeBranch}...\`);
      const commitsRes = await fetch(
        \`https://api.github.com/repos/\${owner}/\${repoName}/commits?sha=\${activeBranch}&per_page=15\`,
        { headers },
      );`;

code = code.replace(
  /      \/\/ 1\. Fetch Commits\n      console\.log\(`Fetching commits for \${owner}\/\${repoName}\.\.\.`\);\n      const commitsRes = await fetch\(\n        `https:\/\/api\.github\.com\/repos\/\${owner}\/\${repoName}\/commits\?per_page=15`,\n        { headers },\n      \);/g,
  fetchCommitsBlock
);

// Update branches map to use activeBranch
const branchesMapBlock = `        branchesData = rawBranches.map((b: any) => ({
          name: b.name,
          desc: \`Branch head: \${b.commit.sha.substring(0, 7)}\`,
          isDefault: b.name === activeBranch,
          borderColor:
            b.name === activeBranch
              ? "#38BDF8"
              : "transparent",
        }));`;

code = code.replace(
  /        branchesData = rawBranches\.map\(\(b: any\) => \(\{\n          name: b\.name,\n          desc: `Branch head: \${b\.commit\.sha\.substring\(0, 7\)}`,\n          isDefault: b\.name === "main" \|\| b\.name === "master",\n          borderColor:\n            b\.name === "main" \|\| b\.name === "master"\n              \? "#38BDF8"\n              : "transparent",\n        \}\)\);/g,
  branchesMapBlock
);

// Update files fetch to use activeBranch instead of HEAD
code = code.replace(
  /\`https:\/\/api\.github\.com\/repos\/\${owner}\/\${repoName}\/git\/trees\/HEAD\?recursive=1\`/g,
  '`https://api.github.com/repos/${owner}/${repoName}/git/trees/${activeBranch}?recursive=1`'
);

// Add switchBranch
const switchBranchBlock = `  const switchBranch = async (branchName: string) => {
    if (!state.currentRepo || !state.currentRepoOwner) return;
    localStorage.setItem("currentBranch", branchName);
    setState((prev) => ({ ...prev, currentBranch: branchName }));
    await fetchRepoDetails(state.currentRepo, state.currentRepoOwner, false, branchName);
  };`;

code = code.replace(
  /  const openActionSheet = \(\) =>/g,
  switchBranchBlock + '\n  const openActionSheet = () =>'
);

fs.writeFileSync('src/AppContext.tsx', code);
