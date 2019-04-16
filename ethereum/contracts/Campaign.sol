pragma solidity ^0.4.17;

contract CampaignFactory {
  address[] public deployedCampaigns;

  function createCampaign(string description, uint minimumContribution) public {
    address newCampaign = new Campaign(description, minimumContribution, msg.sender);
    deployedCampaigns.push(newCampaign);
  }

  function getCampaigns() public view returns (address[]) {
    return deployedCampaigns;
  }
}

contract Campaign {
  struct Request {
    string description;
    uint value;
    address recipient;
    bool isCompleted;
    mapping(address => int8) voters; // value 0 for not voted yet; 1 for positive; -1 for negative
    uint approvalCount;
  }

  address public manager;
  string public description;
  uint public minContribution;
  mapping(address => bool) public contributorMapping; // for better performance (less gas cost)
  address[] public contributorArray;
  Request[] public requests;

  modifier managerOnly() {
    require(msg.sender == manager);
    _;
  }

  function Campaign(string des, uint min, address creator) public {
    manager = creator;
    description = des;
    minContribution = min;
  }

  function getContributors() public view returns (address[]) {
    return contributorArray;
  }

  // workaround for not being able to return a array of Request structs
  function getRequestCount() public view returns (uint) {
    return requests.length;
  }

  function contribute() public payable {
    require(msg.sender != manager);
    require(msg.value > minContribution);
    require(!contributorMapping[msg.sender]); // do not allow multiple contributions
    contributorMapping[msg.sender] = true;
    contributorArray.push(msg.sender);
  }

  function createRequest(string desc, uint value, address recipient) public managerOnly {
    Request memory newRequest = Request({ // explicitly specify that this var is created in memory, not storage
      description: desc,
      value: value,
      recipient: recipient,
      isCompleted: false,
      approvalCount: 0
      // we don't have to initialize reference types, so we don't initialize voters
      });
    requests.push(newRequest);
  }

  function voteForRequest(uint requestIndex, bool isApproved) public {
    Request storage request = requests[requestIndex]; // specifically references to the storage variable and changes made will hence be persisted

    require(!request.isCompleted); // this request has not yet completed
    require(contributorMapping[msg.sender]); // this person is a contributor
    require(request.voters[msg.sender] == 0); // this person has not voted yet

    request.voters[msg.sender] = isApproved ? int8(1) : -1;
    if (isApproved) {
      request.approvalCount += 1;
    }
  }

  function executeRequest(uint requestIndex) public managerOnly {
    Request storage request = requests[requestIndex];

    require(!request.isCompleted);
    require(request.approvalCount > contributorArray.length / 2);

    request.recipient.transfer(request.value);
    request.isCompleted = true;
  }

  function getSummary() public view returns (address, string, uint, uint, uint, uint) {
    return (
      manager,
      description,
      minContribution,
      this.balance,
      contributorArray.length,
      requests.length
    );
  }
}

/*
Solidity passes variable to function by copy (same as modified using memory keyword),
while we can change this behavior by using storage keyword,
so this way, it passes variable by reference which points to the storage variable
*/

/*
In solidity mappings, keys are not stored, and values are not iterable (so we cannot fetch all values from a mapping)
If a value does not exist on a key, a default value (empty string for string type) is returned (so we can see it as "all values exist")
It's impossible to use JavaScript to retrieve mapping voters in Request struct, as keys of mapping are not stored
*/
