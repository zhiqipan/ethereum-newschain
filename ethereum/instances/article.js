import web3 from '../utils/web3';
import compiledArticle from '../build/Article';

function getInstance(address) {
  return new web3.eth.Contract(
    JSON.parse(compiledArticle.interface),
    address,
  );
}

export default getInstance;
