const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

function compile(inputPath, outputPath) {
  const sources = {};
  fs.readdirSync(inputPath).forEach(name => {
    sources[name] = { content: fs.readFileSync(path.resolve(inputPath, name), 'utf8') };
  });

  const { contracts } = JSON.parse(solc.compile(JSON.stringify({
    sources,
    language: 'Solidity',
    settings: {
      outputSelection: {
        '*': {
          '*': ['*'],
        },
      },
    },
  })));

  console.info(`${Object.keys(contracts).length} contract(s) compiled`);

  fs.removeSync(outputPath);
  fs.ensureDirSync(outputPath);

  Object.keys(contracts).forEach(solFileName => {
    Object.keys(contracts[solFileName]).forEach(contractName => {
      console.info(`Writing contract to: ${contractName}.json`);
      fs.outputJsonSync(path.resolve(outputPath, contractName + '.json'), contracts[solFileName][contractName]);
    });
  });
}

const inputPath = path.resolve(__dirname, '..', 'contracts');
const outputPath = path.resolve(__dirname, '..', 'build');

compile(inputPath, outputPath);
