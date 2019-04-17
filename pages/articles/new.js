import React, { Component } from 'react';
import dynamic from 'next/dynamic';
import { Button, Card, Form, Input, TextArea, Message, Divider, Label, Icon } from 'semantic-ui-react';
import Layout from '../../client/components/Layout';
import web3 from '../../ethereum/utils/web3';
import factory from '../../ethereum/instances/factory';
import { Router, Link } from '../../routes';
import { putToSwarm } from '../../client/utils/swarm';
import { PicksContext } from '../../client/context/picks';

const MarkdownEditor = process.browser ? dynamic(() => {
  return import('../../client/components/MarkdownEditor' /* webpackChunkName: 'MarkdownEditor' */);
}) : () => null;

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
      this.context.unpickAll();
      Router.push('/');
    } catch (e) {
      console.error(e);
      this.setState({ errorMessage: e.message });
    }
    this.setState({ transacting: false });
  };

  renderPickedArticles() {
    const { articles } = this.context;

    if (Object.keys(articles).length === 0) return <p>No citation</p>;

    const items = Object.keys(articles).map(addr => {
      const { contentHash, title, body, citations = [], citedBy = [], rewardValueEther } = articles[addr];
      return {
        header: title,
        meta: addr,
        description: (
          <div>
            <div style={{ margin: '10px 0' }}>
              <Label color='blue'>
                <Icon name='list' />
                {citations.length.toString()} citations
              </Label>
              <Label color='teal'>
                <Icon name='code branch' />
                <span>cited by {citedBy.length.toString()} articles</span>
              </Label>
              <Label color='yellow'>
                <Icon name='ethereum' />
                <span>{rewardValueEther.toString()} ether reward</span>
              </Label>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <p style={{ height: 60 }}>{body.substr(0, 200)}{body.length > 200 && '...'}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <Link route={`/articles/${addr}`}><a>View article</a></Link>
                  <p><a target='_blank' href={`https://swarm-gateways.net/bzz-raw:/${contentHash}`}>Permalink</a></p>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <a style={this.state.transacting ? { color: 'lightgray', cursor: 'default' } : {}} onClick={() => {
                    if (this.state.transacting) return;
                    this.context.unpick(addr);
                  }}>Unpick</a>
                </div>
              </div>
            </div>
          </div>
        ),
        fluid: false,
        style: { overflowWrap: 'break-word' },
      };
    });

    return <Card.Group itemsPerRow={2} items={items} />;
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
            <MarkdownEditor onChange={html => this.setState({ body: html })} initialHtml={body} />
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
