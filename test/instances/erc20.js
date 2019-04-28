import web3 from '../web3';
import compiledERC20 from '../../ethereum/build/ERC20Interface';

function getInstance(address) {
  return new web3.eth.Contract(
    compiledERC20.abi,
    address,
  );
}

export default getInstance;
