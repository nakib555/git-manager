const fs = require('fs');
let content = fs.readFileSync('src/AppContext.tsx', 'utf8');
content = content.replace(/Authorization:\s*`Bearer \${token}`\s*`Bearer \${token}`\s*,/g, "Authorization: `Bearer ${token}`,");
content = content.replace(/Authorization:\s*`Bearer \${token}`\s*`Bearer \${token}`\s*/g, "Authorization: `Bearer ${token}`");
fs.writeFileSync('src/AppContext.tsx', content);
