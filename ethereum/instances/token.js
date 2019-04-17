import web3 from '../utils/web3';
import compiledToken from '../build/NcToken';

import address from '../config/token.address';

const instance = new web3.eth.Contract(
  compiledToken.abi,
  address,
);

export default instance;
