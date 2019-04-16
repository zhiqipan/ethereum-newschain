import web3 from '../utils/web3';
import compiledFactory from '../build/CampaignFactory';

const address = '0xE5bE149d0cEa64016c488F0e017CE908C936DA64';

const instance = new web3.eth.Contract(
  JSON.parse(compiledFactory.interface),
  address,
);

export default instance;
