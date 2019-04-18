pragma solidity ^0.5.7;

import './Article.sol';

contract ERC20Interface {
  function name() public view returns (string memory);
  function symbol() public view returns (string memory);
  function totalSupply() public view returns (uint);
  function balanceOf(address tokenOwner) public view returns (uint balance);
  function transfer(address to, uint tokens) public returns (bool success);

  function allowance(address tokenOwner, address spender) public view returns (uint remaining);
  function approve(address spender, uint tokens) public returns (bool success);
  function transferFrom(address from, address to, uint tokens) public returns (bool success);

  event Transfer(address indexed from, address indexed to, uint tokens);
  event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
}

contract NcToken is ERC20Interface {
  string private _name = "NewsChain Token";
  string private _symbol = "NCT";
  uint public decimals = 0;

  uint public supply;
  address public founder;

  mapping(address => uint) public balances;
  mapping(address => mapping(address => uint)) allowed;

  event Transfer(address indexed from, address indexed to, uint tokens);
  event Approval(address indexed tokenOwner, address indexed spender, uint tokens);

  constructor() public {
    founder = msg.sender;
    // supply = 10000;
    // balances[founder] = 10000;
  }

  function name() public view returns(string memory) {
    return _name;
  }

  function symbol() public view returns(string memory) {
    return _symbol;
  }

  function allowance(address tokenOwner, address spender) view public returns(uint) {
    return allowed[tokenOwner][spender];
  }

  function approve(address spender, uint tokens) public returns(bool) {
    require(balances[msg.sender] >= tokens);
    require(tokens > 0);

    allowed[msg.sender][spender] = tokens;
    emit Approval(msg.sender, spender, tokens); // emit
    return true;
  }

  function transferFrom(address from, address to, uint tokens) public returns(bool) {
    require(allowed[from][to] >= tokens);
    require(balances[from] >= tokens);

    balances[from] -= tokens;
    balances[to] += tokens;

    allowed[from][to] -= tokens;

    return true;
  }

  function totalSupply() public view returns (uint) {
    return supply;
  }

  function balanceOf(address tokenOwner) public view returns (uint balance) {
    return balances[tokenOwner];
  }

  function transfer(address to, uint tokens) public returns (bool success) {
    require(balances[msg.sender] >= tokens && tokens > 0);

    balances[to] += tokens;
    balances[msg.sender] -= tokens;
    emit Transfer(msg.sender, to, tokens); // emit
    return true;
  }

  function generateAutoRewardToArticle(uint tokens) public {
    Article article = Article(msg.sender);
    require(article.isArticle()); // should be sent from an article

    balances[article.rewardRecipient()] += tokens;
    supply += tokens;
  }
}
