import web3 from '../utils/web3';
import compiledArticle from '../build/Article';

function getInstance(address) {
  return new web3.eth.Contract(
    compiledArticle.abi,
    address,
  );
}

export default getInstance;
