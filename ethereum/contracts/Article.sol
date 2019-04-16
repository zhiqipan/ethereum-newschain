pragma solidity ^0.4.17;

import './NcToken.sol';

/**
 * @title Article Factory
 * @dev Contract of article factory, use this factory to create articles
 **/
contract ArticleFactory {
  address[] public deployedArticles;

  bool public enableAutoTokenReward;
  uint public autoTokenRewardCitationCap;
  uint public autoTokenRewardAmount;
  address public autoTokenRewardFrom;

  function ArticleFactory(bool enableReward, uint citationCap, uint amount, address rewardFrom) public {
    enableAutoTokenReward = enableReward;
    autoTokenRewardCitationCap = citationCap;
    autoTokenRewardAmount = amount;
    autoTokenRewardFrom = rewardFrom;
  }

  function setEnableAutoTokenReward(bool enable) public {
    enableAutoTokenReward = enable;
  }

  function setAutoTokenRewardCitationCap(uint cap) public {
    autoTokenRewardCitationCap = cap;
  }

  function setAutoTokenRewardAmount(uint amount) public {
    autoTokenRewardAmount = amount;
  }

  function setAutoTokenRewardFrom(address tokenAddr) public {
    autoTokenRewardFrom = tokenAddr;
  }

  function createArticle(bytes32 _contentHash, address _rewardRecipient) public {
    address newArticle = new Article(_contentHash, msg.sender, _rewardRecipient);
    deployedArticles.push(newArticle);
  }

  function getArticles() public view returns (address[]) {
    return deployedArticles;
  }
}

/**
 * @title Article
 * @dev Contract of article, the higher the reward, citedBy and citation count, the better the article is
 **/
contract Article {
  bytes32 public contentHash; // also refers to the content in swarm
  address public creator;
  address public rewardRecipient; // rewardRecipient must be an EOA

  uint public rewardValue;
  uint public rewardTimes;
  mapping(address => uint) public rewardDonatorRecord;

  address[] public tokenTypes;
  mapping(address => uint) public tokenRewardTimes;
  mapping(address => mapping(address => uint)) public tokenDonatorRecord;

  address[] public citations;
  address[] public citedBy;

  address factoryAddress;
  bool public autoTokenRewarded;

  function Article(bytes32 _contentHash, address _creator, address _rewardRecipient) public {
    contentHash = _contentHash;
    creator = _creator;
    rewardRecipient = _rewardRecipient;
    factoryAddress = msg.sender;
  }

  function isArticle() external pure returns (bool) {
    return true;
  }

  function getTokenTypes() public view returns (address[]) {
    return tokenTypes;
  }

  function getCitations() public view returns (address[] articles) {
    return citations;
  }

  function getCitedBy() public view returns (address[] articles) {
    return citedBy;
  }

  function reward() public payable {
    require(msg.value > 0);
    rewardDonatorRecord[msg.sender] += msg.value;
    rewardValue += msg.value;
    rewardTimes += 1;
    rewardRecipient.transfer(msg.value);
  }

  function rewardToken(address tokenAddress, uint tokens) public {
    if (tokenRewardTimes[tokenAddress] == 0) {
      tokenTypes.push(tokenAddress); // add to tokenTypes if first time to donate such token
    }
    tokenDonatorRecord[msg.sender][tokenAddress] += tokens;
    tokenRewardTimes[tokenAddress] += 1;
    ERC20Interface(tokenAddress).transferFrom(msg.sender, rewardRecipient, tokens); // should be approved first
  }

  function addCitations(address[] others) public creatorOnly {
    for (uint i = 0; i < others.length; i++) {
      citations.push(others[i]);
      Article a = Article(others[i]);
      a.addCitedBy();
    }
  }

  function removeCitation(uint index) public creatorOnly { // this does not remove citedBy record though
    require(index >= 0 && index < citations.length);
    delete citations[index];
  }

  function addCitedBy() public {
    Article article = Article(msg.sender);
    require(article.isArticle()); // should be sent from an article
    citedBy.push(msg.sender);

    if (!autoTokenRewarded) {
      ArticleFactory factory = ArticleFactory(factoryAddress);
      if (factory.enableAutoTokenReward() && citedBy.length >= factory.autoTokenRewardCitationCap()) {
        NcToken(factory.autoTokenRewardFrom()).generateAutoRewardToArticle(factory.autoTokenRewardAmount());
        autoTokenRewarded = true;
      }
    }
  }

  function changeRewardRecipient(address newRewardRecipient) public {
    require(msg.sender == creator || msg.sender == rewardRecipient);
    rewardRecipient = newRewardRecipient;
  }

  function() public payable {
    reward();
  }

  modifier creatorOnly() {
    require(msg.sender == creator);
    _;
  }
}
