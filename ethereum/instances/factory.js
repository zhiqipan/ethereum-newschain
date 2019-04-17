import web3 from '../utils/web3';
import compiledFactory from '../build/ArticleFactory';

import address from '../config/factory.address';

const instance = new web3.eth.Contract(
  compiledFactory.abi,
  address,
);

export default instance;
