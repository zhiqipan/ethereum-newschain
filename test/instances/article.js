import web3 from '../web3';
import compiledArticle from '../../ethereum/build/Article';

function getInstance(address) {
  return new web3.eth.Contract(
    compiledArticle.abi,
    address,
  );
}

export default getInstance;
