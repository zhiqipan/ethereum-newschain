import React, { Component } from 'react';
import { Button, Form, Input, Message } from 'semantic-ui-react';
import { Router } from '../routes';
import web3 from '../ethereum/utils/web3';
import getArticle from '../ethereum/instances/article';

export default class RewardForm extends Component {
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
      const campaign = getArticle(this.props.address);
      const value = web3.utils.toWei(this.state.etherAmount.toString());
      const account = (await web3.eth.getAccounts())[0];
      await campaign.methods.reward().send({
        from: account,
        value,
      });
    } catch (e) {
      console.error(e);
      this.setState({ errorMessage: e.message });
    }
    Router.replaceRoute(`/articles/${this.props.address}`);
    this.setState({ transacting: false });
  };

  render() {
    const { etherAmount, transacting, errorMessage } = this.state;

    return (
      <Form error={!!errorMessage} onSubmit={this.onSubmit}>
        <Form.Field>
          <label>Amount to reward</label>
          <Input
            label='ether'
            labelPosition='right'
            value={etherAmount}
            onChange={event => this.setState({ etherAmount: event.target.value })}
          />
        </Form.Field>
        <Button disabled={!this.props.address || transacting} primary loading={transacting}>Reward</Button>
        <Message error header='Oops...' content={errorMessage} />
      </Form>
    );
  }
}
