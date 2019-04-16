import web3 from '../utils/web3';
import compiledCampaign from '../build/Campaign';

function getInstance(address) {
  return new web3.eth.Contract(
    JSON.parse(compiledCampaign.interface),
    address,
  );
}

export default getInstance;
