require('../ethereum/scripts/compile');
const web3 = require('./web3');

let accounts;
let articleFactory;
let article;
let token;
beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  article = await new web3.eth.Contract(JSON.parse(ArticleAbi)) // teaches web3 what methods the contract has
    .deploy({ data: bytecode, arguments: [] }) // tells web3 that we want to deploy a new copy of this contract (creates a transaction object)
    .send({ from: accounts[0], gas: '1000000' }); // instructs web3 to send out a transaction that creates this contract
  articleFactory = await new web3.eth.Contract(JSON.parse(ArticleFactoryAbi))
    .deploy({ data: bytecode, arguments: [] })
    .send({ from: accounts[0], gas: '1000000' });
  token = await new web3.eth.Contract(JSON.parse(tokenAbi))
    .deploy({ data: bytecode, arguments: [] })
    .send({ from: accounts[0], gas: '1000000' });
});

describe('Testing', () => {
  it('deploys article contract', () => {
    expect(article.options.address).toBeDefined();
  });

  it('deploys article factory contract', () => {
    expect(articleFactory.options.address).toBeDefined();
  });

  it('deploys token contract', () => {
    expect(token.options.address).toBeDefined();
  });

  it('sets creator address when publishing', async () => {
    const creator = await article.methods.creator().call();
    expect(creator).toBe(accounts[0]);
  });

  it('allows sending ether', async () => {
    await article.methods.enter().send({
      from: player,
      value: web3.utils.toWei('0.02', 'ether'),
    });
  });

  it('allows sending multiple ether', async () => {
    await article.methods.enter().send({
      from: player,
      value: web3.utils.toWei('3', 'ether'),
    });
  });

  it('disallows sending zero ether', async () => {
    expect.assertions(1);

    await expect(article.methods.enter().send({
      from: player,
      value: web3.utils.toWei('3', 'ether'),
    })).rejects.toBeDefined();
  });
});
