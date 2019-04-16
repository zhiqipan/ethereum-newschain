import React, { Component } from 'react';
import { Button, Form, Input, Message } from 'semantic-ui-react';
import { Router } from '../routes';
import web3 from '../ethereum/utils/web3';
import getCampaign from '../ethereum/instances/campaign';

export default class ContributeForm extends Component {
  static defaultProps = {
    address: null,
  };

  state = {
    etherAmount: 0.1,
    transacting: false,
    errorMessage: null,
  };

  onSubmit = async event => {
    event.preventDefault();
    this.setState({ transacting: true, errorMessage: null });
    try {
      const campaign = getCampaign(this.props.address);
      const value = web3.utils.toWei(this.state.etherAmount.toString());
      const account = (await web3.eth.getAccounts())[0];
      await campaign.methods.contribute().send({
        from: account,
        value,
      });
    } catch (e) {
      console.error(e);
      this.setState({ errorMessage: e.message });
    }
    // this calls getInitialProps() in CampaignDetailsPage (in browser) to update the props, instead of refreshing the page
    // getInitialProps() can be called on both server side and client side
    Router.replaceRoute(`/campaigns/${this.props.address}`);
    this.setState({ transacting: false });
  };

  render() {
    const { etherAmount, transacting, errorMessage } = this.state;

    return (
      <Form error={!!errorMessage} onSubmit={this.onSubmit}>
        <Form.Field>
          <label>Amount to contribute</label>
          <Input
            label='ether'
            labelPosition='right'
            value={etherAmount}
            onChange={event => this.setState({ etherAmount: event.target.value })}
          />
        </Form.Field>
        <Button disabled={!this.props.address || transacting} primary loading={transacting}>Create</Button>
        <Message error header='Oops...' content={errorMessage} />
      </Form>
    );
  }
}
