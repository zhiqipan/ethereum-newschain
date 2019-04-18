import web3 from '../utils/web3';
import compiledERC20 from '../build/ERC20Interface';

function getInstance(address) {
  return new web3.eth.Contract(
    compiledERC20.abi,
    address,
  );
}

export default getInstance;
