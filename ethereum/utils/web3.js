import Web3 from 'web3';
import config from '../../client/client.config';

const { ETHEREUM_NODE_ADDRESS } = config;

let web3;

// 2019-04-20: Note that for new version of MetaMask, users need to enable it for each domain by calling ethereum.enable() in browser console
// To disable it, call ethereum.enable(false)
if (process.browser && typeof window.web3 === 'object') {
  // running/rendering on browser with MetaMask
  web3 = new Web3(window.web3.currentProvider);
  web3.eth.getAccounts().then(accounts => {
    if (accounts.length === 0) {
      console.warn('MetaMask is not enable on this site, please call ethereum.enable() in your browser console for this domain first');
    } else {
      console.log('OK: MetaMask installed and enabled for this site');
    }
  });
} else {
  // running/rendering on server *OR* the user does not have MetaMask
  const provider = new Web3.providers.HttpProvider(ETHEREUM_NODE_ADDRESS);
  web3 = new Web3(provider);
  if (process.browser) {
    console.warn('MetaMask is not installed in your browser, please install it first if you want to make transactions');
  }
}

export default web3;
