import React, { Component } from 'react';
import { Button, Table } from 'semantic-ui-react';
import { Router } from '../routes';
import web3 from '../ethereum/utils/web3';
import getCampaign from '../ethereum/instances/campaign';

export default class RequestRow extends Component {
  state = {
    transacting: false,
    errorMessage: null,
  };

  sendTx = async (name, args, transacting) => {
    const { address, index } = this.props;
    this.setState({ transacting, errorMessage: null });
    try {
      const account = (await web3.eth.getAccounts())[0];
      const campaign = getCampaign(address);
      await campaign.methods[name](...args).send({ from: account });
      Router.replaceRoute(`/campaigns/${address}/requests`);
    } catch (e) {
      console.error(e);
      alert('Transaction failed\n' + e.message); // no place to display error message in the interface ;(
      this.setState({ errorMessage: e.message });
    }
    this.setState({ transacting: false });
  };

  onVote = async (isApproved) => {
    const { index } = this.props;
    await this.sendTx('voteForRequest', [index, isApproved], isApproved ? 'approving' : 'disapproving');
  };

  onExecute = async () => {
    const { index } = this.props;
    await this.sendTx('executeRequest', [index], 'executing');
  };

  renderContributorAction() {
    const { transacting } = this.state;

    return (
      <React.Fragment>
        <Button disabled={!!transacting} loading={transacting === 'approving'} color='green' icon='check' basic onClick={e => this.onVote(true)} />
        <Button disabled={!!transacting} loading={transacting === 'disapproving'} color='red' icon='ban' basic onClick={e => this.onVote(false)} />
      </React.Fragment>
    );
  }

  renderManagerAction() {
    const { transacting } = this.state;

    return (
      <React.Fragment>
        <Button disabled={!!transacting} loading={transacting === 'executing'} color='blue' basic onClick={this.onExecute}>Execute</Button>
      </React.Fragment>
    );
  }

  render() {
    const { Row, Cell } = Table;
    const { index, request, campaignContributorCount, isManager } = this.props;
    if (!request) return null;

    const { description, value: weiValue, recipient, approvalCount, isCompleted } = request;
    const etherValue = web3.utils.fromWei(weiValue, 'ether');
    const readyToExecute = approvalCount > campaignContributorCount / 2;
    return (
      <Row disabled={isCompleted} positive={readyToExecute && !isCompleted}>
        <Cell>{index}</Cell>
        <Cell>{description}</Cell>
        <Cell>{etherValue}</Cell>
        <Cell>{recipient}</Cell>
        <Cell>{approvalCount}/{campaignContributorCount}</Cell>
        {isCompleted &&
        <Cell>Completed</Cell>
        }
        {!isCompleted && (
          <Cell>
            {isManager ? this.renderManagerAction() : this.renderContributorAction()}
          </Cell>
        )}
      </Row>
    );
  }
}
