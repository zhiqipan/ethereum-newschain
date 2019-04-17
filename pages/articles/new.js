import React, { Component } from 'react';
import { Button, Card, Form, Input, TextArea, Message, Divider } from 'semantic-ui-react';
import Layout from '../../client/components/Layout';
import web3 from '../../ethereum/utils/web3';
import factory from '../../ethereum/instances/factory';
import { Router, Link } from '../../routes';
import { putToSwarm } from '../../client/utils/swarm';
import { PicksContext } from '../../client/context/picks';

export default class ArticleNewPage extends Component {
  static contextType = PicksContext;

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
      console.info('Article published to Swarm:', hash);
      const result = await factory.methods.createArticle('0x' + hash, account, Object.keys(this.context.articles)).send({
        from: account,
      });
      console.info('Article confirmed on Ethereum:', `block #${result.blockNumber}, transaction ${result.transactionHash}`);
      Router.push('/');
    } catch (e) {
      console.error(e);
      this.setState({ errorMessage: e.message });
    }
    this.setState({ transacting: false });
  };

  renderPickedArticles() {
    const { articles } = this.context;

    const items = Object.keys(articles).map(addr => {
      return {
        header: addr,
        meta: articles[addr].contentHash,
        description: (
          <Link route={`/articles/${addr}`}>
            <a>View article</a>
          </Link>
        ),
        fluid: true,
      };
    });

    return <Card.Group items={items} />;
  }

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
            <TextArea value={body} onChange={event => this.setState({ body: event.target.value })} rows={12} style={{ minHeight: 100 }} />
          </Form.Field>
          <Button disabled={transacting} primary loading={transacting}>Create</Button>
          <Message error header='Oops...' content={errorMessage} />
        </Form>
        <Divider />
        <h3>Citations:</h3>
        {this.renderPickedArticles()}
      </Layout>
    );
  }
}
