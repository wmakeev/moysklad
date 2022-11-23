const fs = require('fs')
const path = require('path')

const package = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
)

fs.writeFileSync(
  path.join(process.cwd(), 'src/version.js'),
  `module.exports = { version: '${package.version}' }\n`
)
