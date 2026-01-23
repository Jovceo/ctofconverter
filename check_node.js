const fs = require('fs');
fs.writeFileSync('node_version.txt', process.version);
console.log('Node version written to node_version.txt');
