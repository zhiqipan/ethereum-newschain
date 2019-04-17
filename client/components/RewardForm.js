import React, { Component } from 'react';
import { Button, Form, Input, Message } from 'semantic-ui-react';
import { Router } from '../../routes';
import web3 from '../../ethereum/utils/web3';
import getArticle from '../../ethereum/instances/article';

export default class RewardForm extends Component {
  static defaultProps = {
    address: null,
    rewardRecipient: null,
  };

  state = {
    etherAmount: 0.1,
    transacting: false,
    errorMessage: null,
    showSuccessMessage: false,
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
      if (process.browser) {
        this.setState({ showSuccessMessage: true }, () => {
          setTimeout(() => this.setState({ showSuccessMessage: false }), 3000);
        });
      }
    } catch (e) {
      console.error(e);
      this.setState({ errorMessage: e.message });
    }
    Router.replaceRoute(`/articles/${this.props.address}`);
    this.setState({ transacting: false });
  };

  render() {
    const { etherAmount, transacting, errorMessage, showSuccessMessage } = this.state;

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
        <Button
          primary
          loading={transacting}
          disabled={!this.props.address || transacting}
          content='Reward'
        />
        <Message hidden={!transacting}>
          <Message.Header>
            Your donation is sending to
          </Message.Header>
          <p style={{ fontFamily: 'monospace' }}>{this.props.rewardRecipient}</p>
        </Message>
        <Message error header='Oops...' content={errorMessage} />
        <Message positive hidden={!showSuccessMessage} header='Successful' content='Thank you for your support' />
      </Form>
    );
  }
}
