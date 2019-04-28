import web3 from '../web3';
import compiledToken from '../../ethereum/build/NcToken';

function getInstance(address) {
  return new web3.eth.Contract(
    compiledToken.abi,
    address,
  );
}

export default getInstance;
