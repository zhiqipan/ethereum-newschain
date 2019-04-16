const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider({ gasLimit: 10000000, debug: true }));

// assumes that contracts have already been compiled
const compiledFactory = require('../ethereum/build/CampaignFactory');
const compiledCampaign = require('../ethereum/build/Campaign');

let accounts;
let factory;
let campaign;
let campaignAddress;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode, arguments: [] })
    .send({ from: accounts[0], gas: 10000000 }); // deploy a campaign contract
  await factory.methods.createCampaign('My campaign', 100).send({ from: accounts[0], gas: 10000000 });
  campaignAddress = (await factory.methods.getCampaigns().call())[0];
  campaign = await new web3.eth.Contract(JSON.parse(compiledCampaign.interface), campaignAddress); // get the deployed campaign contract
});

describe('Campaign', () => {
  it('deploys a factory and a campaign', () => {
    expect(factory.options.address).toBeDefined();
    expect(campaign.options.address).toBeDefined();
  });

  it('marks the caller as the campaign manager', async () => {
    expect(await campaign.methods.manager().call()).toBe(accounts[0]);
  });

  it('allows people to contribute money and marks them as contributors', async () => {
    await campaign.methods.contribute().send({ from: accounts[1], value: 200 });
    expect(await campaign.methods.contributorMapping(accounts[1]).call()).toBe(true);
  });

  // more necessary tests omitted
});
