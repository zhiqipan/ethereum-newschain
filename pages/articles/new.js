import React, { Component } from 'react';
import { Button, Form, Input, TextArea, Message } from 'semantic-ui-react';
import Layout from '../../components/Layout';
import web3 from '../../ethereum/utils/web3';
import factory from '../../ethereum/instances/factory';
import { Router } from '../../routes';
import { putToSwarm } from '../../utils/swarm';

export default class ArticleNewPage extends Component {
  state = {
    title: '',
    body: '',
    transacting: false,
    errorMessage: null,
  };

  onSubmit = async event => {
    event.preventDefault();
    this.setState({ transacting: true, errorMessage: '' });

    try {
      const { title, body } = this.state;
      console.info('Publishing article to Swarm...');
      const hash = await putToSwarm(JSON.stringify({ title, body }));
      const account = (await web3.eth.getAccounts())[0];
      console.info('Article published', hash);
      await factory.methods.createArticle('0x' + hash, account).send({
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
    const { title, body, transacting, errorMessage } = this.state;
    return (
      <Layout>
        <h1>Publish an article</h1>
        <Form error={!!errorMessage} onSubmit={this.onSubmit}>
          <Form.Field>
            <label>Title</label>
            <Input value={title} onChange={event => this.setState({ title: event.target.value })} />
          </Form.Field>
          <Form.Field>
            <label>Body</label>
            <TextArea value={body} onChange={event => this.setState({ body: event.target.value })} />
          </Form.Field>
          <Button disabled={transacting} primary loading={transacting}>Create</Button>
          <Message error header='Oops...' content={errorMessage} />
        </Form>
      </Layout>
    );
  }
}
