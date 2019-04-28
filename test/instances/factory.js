import web3 from '../web3';
import compiledFactory from '../../ethereum/build/ArticleFactory';

function getInstance(address) {
  return new web3.eth.Contract(
    compiledFactory.abi,
    address,
  );
}

export default getInstance;
