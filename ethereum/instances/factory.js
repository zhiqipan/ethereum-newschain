import web3 from '../utils/web3';
import compiledFactory from '../build/ArticleFactory';

import address from '../config/factory.address';

const instance = new web3.eth.Contract(
  JSON.parse(compiledFactory.interface),
  address,
);

export default instance;
