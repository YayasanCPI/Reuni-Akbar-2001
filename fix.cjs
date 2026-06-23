const fs = require('fs');

const files = [
  'server.ts',
  'src/server/db.ts'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/\\\`/g, '\`');
  fs.writeFileSync(f, content);
});
