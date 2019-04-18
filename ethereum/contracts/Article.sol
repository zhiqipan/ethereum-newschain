pragma solidity ^0.5.7;

import './NcToken.sol';

/**
 * @title Article Factory
 * @dev Contract of article factory, use this factory to create articles
 **/
contract ArticleFactory {
  address public admin;
  address[] public deployedArticles;

  bool public enableAutoTokenReward;
  uint public autoTokenRewardCitationCap;
  uint public autoTokenRewardAmount;
  address public autoTokenRewardFrom; // should be an NcToken

  constructor(bool enableReward, uint citationCap, uint amount, address rewardFrom) public {
    admin = msg.sender;
    enableAutoTokenReward = enableReward;
    autoTokenRewardCitationCap = citationCap;
    autoTokenRewardAmount = amount;
    autoTokenRewardFrom = rewardFrom;
  }

  function getSummary() public view returns (address, uint, bool, uint, uint, address) {
    return (
    admin,
    deployedArticles.length,
    enableAutoTokenReward,
    autoTokenRewardCitationCap,
    autoTokenRewardAmount,
    autoTokenRewardFrom
    );
  }

  function setEnableAutoTokenReward(bool enable) public adminOnly {
    enableAutoTokenReward = enable;
  }

  function setAutoTokenRewardCitationCap(uint cap) public adminOnly {
    autoTokenRewardCitationCap = cap;
  }

  function setAutoTokenRewardAmount(uint amount) public adminOnly {
    autoTokenRewardAmount = amount;
  }

  function setAutoTokenRewardFrom(address tokenAddr) public adminOnly {
    autoTokenRewardFrom = tokenAddr;
  }

  function createArticle(bytes32 _contentHash, address payable _rewardRecipient, address[] memory _citations) public {
    address newArticle = address(new Article(_contentHash, msg.sender, _rewardRecipient, _citations));
    deployedArticles.push(newArticle);
    for (uint i = 0; i < _citations.length; i++) {
      Article a = Article(_citations[i]);
      a.addCitedBy(newArticle);
    }
    emit ArticleCreated(newArticle);
  }

  function getArticles() public view returns (address[] memory) {
    return deployedArticles;
  }

  modifier adminOnly() {
    require(msg.sender == admin);
    _;
  }

  event ArticleCreated(address newArticle);
}

/**
 * @title Article
 * @dev Contract of article, the higher the reward, citedBy and citation count, the better the article is
 **/
contract Article {
  bytes32 public contentHash; // also refers to the content in swarm
  uint public version;
  mapping(uint => bytes32) public history;

  address public creator;
  address payable public rewardRecipient; // rewardRecipient must be an EOA

  uint public rewardValue;
  uint public rewardTimes;
  mapping(address => uint) public rewardDonatorRecord;

  address[] public tokenTypes;
  mapping(address => uint) public tokenRewardTimes;
  mapping(address => uint) public tokenRewardValue;
  mapping(address => mapping(address => uint)) public tokenDonatorRecord;

  address[] public citations;
  address[] public citedBy;

  address factoryAddress;
  bool public autoTokenRewarded;

  constructor(bytes32 _contentHash, address _creator, address payable _rewardRecipient, address[] memory _citations) public {
    contentHash = _contentHash;
    version = 0;
    creator = _creator;
    rewardRecipient = _rewardRecipient;
    factoryAddress = msg.sender;
    for (uint i = 0; i < _citations.length; i++) {
      citations.push(_citations[i]);
      // this exceeds block gas limit
      // Article a = Article(_citations[i]);
      // a.addCitedBy();
    }
  }

  function modify(bytes32 newHash) public creatorOnly {
    history[version] = contentHash;
    contentHash = newHash;
    version += 1;
    emit Modified(newHash, version);
  }

  function getSummary() public view returns
  (bytes32, uint, address, address, address[] memory, address[] memory, uint, uint, address[] memory, bool) {
    return (
    contentHash,
    version,
    creator,
    rewardRecipient,
    citations,
    citedBy,
    rewardValue,
    rewardTimes,
    tokenTypes,
    autoTokenRewarded
    );
  }

  function isArticle() external pure returns (bool) {
    return true;
  }

  function getTokenTypes() public view returns (address[] memory) {
    return tokenTypes;
  }

  function getCitations() public view returns (address[] memory articles) {
    return citations;
  }

  function getCitedBy() public view returns (address[] memory articles) {
    return citedBy;
  }

  function reward() public payable {
    require(msg.value > 0);
    rewardDonatorRecord[msg.sender] += msg.value;
    rewardValue += msg.value;
    rewardTimes += 1;
    rewardRecipient.transfer(msg.value);
    emit Rewarded(msg.sender, msg.value);
  }

  function rewardToken(address tokenAddress, address from, uint tokens) public {
    if (tokenRewardTimes[tokenAddress] == 0) {
      tokenTypes.push(tokenAddress); // add to tokenTypes if first time to donate such token
    }
    tokenDonatorRecord[msg.sender][tokenAddress] += tokens;
    tokenRewardTimes[tokenAddress] += 1;
    tokenRewardValue[tokenAddress] += tokens;
    ERC20Interface(tokenAddress).transferFrom(from, rewardRecipient, tokens); // should be approved first
    emit TokenRewarded(from, tokenAddress, tokens);
  }

  function addCitations(address[] memory others) public creatorOnly {
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

  function addCitedBy() external {
    Article article = Article(msg.sender);
    require(article.isArticle()); // should be sent from an article
    citedBy.push(msg.sender);

    emit Cited(msg.sender);
    checkAndGenerateAutoReward();
  }

  function addCitedBy(address other) external {
    require(msg.sender == factoryAddress);
    citedBy.push(other);

    emit Cited(other);
    checkAndGenerateAutoReward();
  }

  function changeRewardRecipient(address payable newRewardRecipient) public {
    require(msg.sender == creator || msg.sender == rewardRecipient);
    rewardRecipient = newRewardRecipient;
  }

  function checkAndGenerateAutoReward() private {
    if (!autoTokenRewarded) {
      ArticleFactory factory = ArticleFactory(factoryAddress);
      address tokenAddr = factory.autoTokenRewardFrom();
      uint tokenAmt = factory.autoTokenRewardAmount();
      if (factory.enableAutoTokenReward() && citedBy.length >= factory.autoTokenRewardCitationCap()) {
        NcToken(tokenAddr).generateAutoRewardToArticle(tokenAmt);
        if (tokenRewardTimes[tokenAddr] == 0) {
          tokenTypes.push(tokenAddr); // add to tokenTypes if first time to donate such token
        }
        tokenDonatorRecord[factoryAddress][tokenAddr] += tokenAmt;
        tokenRewardTimes[tokenAddr] += 1;
        tokenRewardValue[tokenAddr] += tokenAmt;
        autoTokenRewarded = true;
        emit TokenRewarded(factoryAddress, tokenAddr, tokenAmt);
      }
    }
  }

  //   function() external payable {
  //     reward();
  //   }

  modifier creatorOnly() {
    require(msg.sender == creator);
    _;
  }

  event Cited(address otherArticle);
  event Modified(bytes32 newContentHash, uint newVersion);
  event Rewarded(address donatorAddress, uint amount);
  event TokenRewarded(address donatorAddress, address tokenAddress, uint tokenAmount);
}
