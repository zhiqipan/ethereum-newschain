import React, { Component } from 'react';
import { Button, Form, Input, Message } from 'semantic-ui-react';
import Layout from '../../components/Layout';
import web3 from '../../ethereum/utils/web3';
import factory from '../../ethereum/instances/factory';
import { Router } from '../../routes';

export default class CampaignNewPage extends Component {
  state = {
    description: '',
    minimumContribution: 0,
    transacting: false,
    errorMessage: null,
  };

  onSubmit = async event => {
    event.preventDefault();
    this.setState({ transacting: true, errorMessage: '' });
    try {
      const account = (await web3.eth.getAccounts())[0];
      await factory.methods.createCampaign(this.state.description, this.state.minimumContribution).send({
        from: account,
      });
      Router.push('/');
    } catch (e) {
      console.error(e);
      this.setState({ errorMessage: e.message });
    }
    this.setState({ transacting: false });
  };

  render() {
    const { description, minimumContribution, transacting, errorMessage } = this.state;
    return (
      <Layout>
        <h1>Create a campaign</h1>
        <Form error={!!errorMessage} onSubmit={this.onSubmit}>
          <Form.Field>
            <label>Description</label>
            <Input value={description} onChange={event => this.setState({ description: event.target.value })} />
          </Form.Field>
          <Form.Field>
            <label>Minimum contribution</label>
            <Input
              label='wei'
              labelPosition='right'
              value={minimumContribution}
              onChange={event => this.setState({ minimumContribution: event.target.value })}
            />
          </Form.Field>
          <Button disabled={transacting} primary loading={transacting}>Create</Button>
          <Message error header='Oops...' content={errorMessage} />
        </Form>
      </Layout>
    );
  }
}
