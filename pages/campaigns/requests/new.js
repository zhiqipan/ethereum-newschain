import React, { Component } from 'react';
import { Button, Form, Input, Message } from 'semantic-ui-react';
import { Router, Link } from '../../../routes';
import Layout from '../../../components/Layout';
import getCampaign from '../../../ethereum/instances/campaign';
import web3 from '../../../ethereum/utils/web3';

export default class RequestNewPage extends Component {
  static getInitialProps(props) {
    const { address } = props.query;
    return { address };
  }

  state = {
    description: '',
    etherAmount: 0,
    recipient: '',
    transacting: false,
    errorMessage: null,
  };

  onSubmit = async event => {
    event.preventDefault();

    const { address } = this.props;
    const { description, etherAmount, recipient } = this.state;
    const campaign = getCampaign(address);
    this.setState({ transacting: true, errorMessage: null });
    try {
      const account = (await web3.eth.getAccounts())[0];
      const weiAmount = web3.utils.toWei(etherAmount.toString(), 'ether');
      await campaign.methods
        .createRequest(description, weiAmount, recipient)
        .send({ from: account });
      Router.replaceRoute(`/campaigns/${address}/requests`);
    } catch (e) {
      console.error(e);
      this.setState({ errorMessage: e.message });
    }
    this.setState({ transacting: false });
  };

  render() {
    const { address } = this.props;
    const { description, etherAmount, recipient, transacting, errorMessage } = this.state;

    return (
      <Layout>
        <Link route={`/campaigns/${address}/requests`}>
          <a>&lt; Back</a>
        </Link>
        <h1>Create a request</h1>
        <p style={{ fontFamily: 'monospace' }}>{address}</p>
        <Form error={!!errorMessage} onSubmit={this.onSubmit}>
          <Form.Field>
            <label>Description</label>
            <Input
              value={description}
              onChange={event => this.setState({ description: event.target.value })}
            />
          </Form.Field>
          <Form.Field>
            <label>Amount (ether)</label>
            <Input
              label='ether'
              labelPosition='right'
              value={etherAmount}
              onChange={event => this.setState({ etherAmount: event.target.value })}
            />
          </Form.Field>
          <Form.Field>
            <label>Recipient (address)</label>
            <Input
              value={recipient}
              onChange={event => this.setState({ recipient: event.target.value })}
            />
          </Form.Field>
          <Button disabled={transacting} loading={transacting} primary>Create</Button>
          <Message error header='Oops...' content={errorMessage} />
        </Form>
      </Layout>
    );
  }
}
