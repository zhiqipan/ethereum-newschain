import Web3 from 'web3';
import { rinkebyAddress } from '../config/config';

let web3;

if (typeof window === 'object' && typeof window.web3 === 'object') {
  // running/rendering on browser with MetaMask
  web3 = new Web3(window.web3.currentProvider);
} else {
  // running/rendering on server *OR* the user does not have MetaMask
  const provider = new Web3.providers.HttpProvider(rinkebyAddress);
  web3 = new Web3(provider);
}

export default web3;
