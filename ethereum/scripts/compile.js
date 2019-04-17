const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

function compile(inputPath, outputPath) {
  const sources = {};
  fs.readdirSync(inputPath).forEach(name => {
    sources[name] = fs.readFileSync(path.resolve(inputPath, name), 'utf8');
  });

  const { contracts } = solc.compile({ sources }, 1);

  console.info(`${Object.keys(contracts).length} contract(s) compiled`);

  fs.removeSync(outputPath);
  fs.ensureDirSync(outputPath);

  Object.keys(contracts).forEach(key => {
    const name = `${key.split(':')[1]}.json`;
    console.info(`Writing contract to: ${name}`);
    fs.outputJsonSync(path.resolve(outputPath, name), contracts[key]);
  });
}

const inputPath = path.resolve(__dirname, '..', 'contracts');
const outputPath = path.resolve(__dirname, '..', 'build');

compile(inputPath, outputPath);
