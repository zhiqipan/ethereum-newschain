const fs = require('fs-extra');
const path = require('path');
const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');

// load env var (running this script does not require server, so env variables are NOT ready on process.env)
const { mnemonic, rinkebyAddress } = require('../../config/server.config');

// rinkebyAddress is the address of Infura rinkeby network endpoint, use Infura so we don't have to host node on our local machine (which is expensive)
// mnemonic gives information of our accounts (public key and private key) so web3 can take control of our account
const provider = new HDWalletProvider(mnemonic, rinkebyAddress);
const eth = new Web3(provider).eth;

async function deploy(abi, bytecode, arguments = []) {
  console.info('Retrieving accounts');
  const accounts = await eth.getAccounts();
  console.info('Attempting to deploy from account', accounts[0]);
  const result = await new eth.Contract(abi)
    .deploy({ data: '0x' + bytecode, arguments })
    .send({ from: accounts[0] });
  console.info('Contract deployed to', result.options.address);
  console.info('Contract interface:\n' + JSON.stringify(abi));
  console.info('More information:', `https://rinkeby.etherscan.io/address/${result.options.address}`);
  return result.options.address;
}

// assumes compilation has been done already
const compiledToken = require('../build/NcToken');
const compiledFactory = require('../build/ArticleFactory');

async function run(factoryOptions = {}) {
  const { enableAutoReward = true, citationCap = 1, amount = 3 } = factoryOptions;
  const tokenAddress = await deploy(compiledToken.abi, compiledToken.evm.bytecode.object);
  const factoryAddress = await deploy(
    compiledFactory.abi,
    compiledFactory.evm.bytecode.object,
    [enableAutoReward, citationCap, amount, tokenAddress]); // (bool enableReward, uint citationCap, uint amount, address rewardFrom)

  const tokenPath = path.resolve(__dirname, '..', 'config', 'token.address.json');
  const factoryPath = path.resolve(__dirname, '..', 'config', 'factory.address.json');
  fs.writeFileSync(tokenPath, `"${tokenAddress}"`);
  fs.writeFileSync(factoryPath, `"${factoryAddress}"`);

  return { tokenAddress, factoryAddress };
}

run().then(addresses => {
  console.info('\n\nDeployment completed');
  console.info(addresses);
  process.exit(0);
}).catch(e => {
  console.error('Failed to deploy', e);
  process.exit(1);
});
