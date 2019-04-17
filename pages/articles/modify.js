import React, { Component } from 'react';
import { Button, Form, Input, TextArea, Message, Loader } from 'semantic-ui-react';
import Layout from '../../client/components/Layout';
import web3 from '../../ethereum/utils/web3';
import { Router, Link } from '../../routes';
import { getFromSwarm, putToSwarm } from '../../client/utils/swarm';
import getArticle from '../../ethereum/instances/article';

export default class ArticleModifyPage extends Component {
  static getInitialProps(props) {
    const { address, hash: contentHash } = props.query;
    return { address, contentHash };
  }

  static defaultProps = {
    address: '',
    contentHash: '',
  };

  state = {
    title: '',
    body: '',
    transacting: false,
    errorMessage: null,
    isCreator: null,
  };

  async componentDidMount() {
    const { title, body } = JSON.parse(await getFromSwarm(this.props.contentHash));
    this.setState({ title, body });

    const account = (await web3.eth.getAccounts())[0];
    const creator = await getArticle(this.props.address).methods.creator().call();
    this.setState({ isCreator: account.toLowerCase() === creator.toLowerCase() });
  }

  onSubmit = async event => {
    event.preventDefault();
    this.setState({ transacting: true, errorMessage: '' });

    try {
      const { title, body } = this.state;
      console.info('Publishing article to Swarm...');
      const hash = await putToSwarm(JSON.stringify({ title, body }));
      const account = (await web3.eth.getAccounts())[0];
      console.info('Article published to Swarm:', hash);
      const result = await getArticle(this.props.address).methods.modify('0x' + hash).send({ from: account });
      console.info('Article confirmed on Ethereum:', `block #${result.blockNumber}, transaction ${result.transactionHash}`);
      Router.replaceRoute(`/articles/${this.props.address}`);
    } catch (e) {
      console.error(e);
      this.setState({ errorMessage: e.message });
    }
    this.setState({ transacting: false });
  };

  render() {
    const { address } = this.props;
    const { title, body, transacting, errorMessage, isCreator } = this.state;
    return (
      <Layout>
        <h1>Modify an article</h1>
        <h3 style={{ fontFamily: 'monospace' }}>{address}</h3>
        <Form error={!!errorMessage} onSubmit={this.onSubmit}>
          <Form.Field>
            <label>Title</label>
            <Input disabled={!isCreator} value={title} onChange={event => this.setState({ title: event.target.value })} />
          </Form.Field>
          <Form.Field>
            <label>Body</label>
            <TextArea disabled={!isCreator} value={body} onChange={event => this.setState({ body: event.target.value })} rows={12} style={{ minHeight: 100 }} />
          </Form.Field>
          {isCreator === true &&
          <React.Fragment>
            <Button disabled={transacting} primary loading={transacting}>Modify</Button>
            <Message error header='Oops...' content={errorMessage} />
          </React.Fragment>
          }
        </Form>
        {isCreator === false &&
        <Message error header='You are not the creator' content={'Only the creator itself can modify this article'} />
        }
        {isCreator === null &&
        <div style={{ marginTop: 15, display: 'flex', alignItems: 'center' }}>
          <Loader active inline style={{ marginRight: 10 }} /><span>Checking your identity...</span>
        </div>
        }
      </Layout>
    );
  }
}
