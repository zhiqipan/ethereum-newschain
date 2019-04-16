const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

const buildPath = path.resolve(__dirname, '..', 'build');
fs.removeSync(buildPath);

const contractPath = path.resolve(__dirname, '..', 'contracts', 'Campaign.sol');
const source = fs.readFileSync(contractPath, 'utf8');
const output = solc.compile(source, 1).contracts; // as indicated by the second argument, we compile 1 contract file (while it contains 2 contracts)

console.info(`${Object.keys(output).length} contract(s) compiled`);

fs.ensureDirSync(buildPath);

Object.keys(output).forEach(key => {
  console.info(`Writing contract ${key} to JSON file`);
  fs.outputJsonSync(path.resolve(buildPath, `${key.replace(':', '')}.json`), output[key]);
});
