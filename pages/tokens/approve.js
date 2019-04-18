import React, { Component } from 'react';
import { Button, Form, Input, Segment } from 'semantic-ui-react';
import Layout from '../../client/components/Layout';
import getArticle from '../../ethereum/instances/article';
import getERC20 from '../../ethereum/instances/erc20';
import web3 from '../../ethereum/utils/web3';
import { getFromSwarm } from '../../client/utils/swarm';
import HtmlViewer from '../../client/components/HtmlViewer';

export default class TokenApprovePage extends Component {
  static async getInitialProps(props) {
    const { token: tokenAddr, article: articleAddr } = props.query;
    const result = {};

    if (articleAddr) {
      const rewardRecipient = await getArticle(articleAddr).methods.rewardRecipient().call();
      const contentHash = await getArticle(articleAddr).methods.contentHash().call();
      const { title, body } = JSON.parse(await getFromSwarm(contentHash.replace('0x', '')));
      result.article = { address: articleAddr, rewardRecipient, contentHash, title, body };
    }

    const tokenName = await getERC20(tokenAddr).methods.name().call();
    const tokenSymbol = await getERC20(tokenAddr).methods.symbol().call();
    result.token = { address: tokenAddr, name: tokenName, symbol: tokenSymbol };

    return result;
  }

  state = {
    recipient: this.props.article && this.props.article.rewardRecipient,
    approvedAmount: null,
    amountToApprove: 0,
  };

  async componentDidMount() {
    const { address } = this.props.token;
    const { rewardRecipient: recipient } = this.props.article;
    const spender = (await web3.eth.getAccounts())[0];
    const approvedAmount = parseFloat(await getERC20(address).methods.allowance(spender, recipient).call());
    this.setState({ approvedAmount });
  }

  approve = async () => {
    const { amountToApprove } = this.state;
    if (isNaN(parseFloat(amountToApprove)) || amountToApprove <= 0) {
      return null;
    }

    const erc20 = getERC20(this.props.token.address);
    const account = (await web3.eth.getAccounts())[0];
    await erc20.methods
      .approve(this.props.article.rewardRecipient, amountToApprove)
      .send({ from: account });
    this.setState({ approvedAmount: this.state.approvedAmount + amountToApprove });
  };

  renderArticleRelated() {
    const { article } = this.props;
    if (!article) return null;

    return (
      <Segment raised>
        <p>Article recipient recipient: {article.rewardRecipient}</p>
        <h3>{article.title}</h3>
        <HtmlViewer html={article.body.replace(/<img[^>]*>/g, '')} style={styles.bodyAbstract} />
      </Segment>
    );
  }

  render() {
    const { token } = this.props;
    return (
      <Layout>
        <h1>Approve token transfer</h1>
        <h3>Token address: {token.address}</h3>
        {this.renderArticleRelated()}
        <Form>
          <Form.Field>
            <label>Recipient address</label>
            <Input
              value={this.state.recipient}
              onChange={event => this.setState({ recipient: event.target.value })}
            />
          </Form.Field>
          <Form.Field>
            <label>Amount to approve</label>
            <Input
              label='token(s)'
              labelPosition='right'
              value={this.state.amountToApprove}
              onChange={event => this.setState({ amountToApprove: event.target.value })}
            />
          </Form.Field>
        </Form>
        <div>Approved amount: {this.state.approvedAmount}</div>
        <Button primary onClick={() => this.approve()}>Approve</Button>
      </Layout>
    );
  }
}

const styles = {
  bodyAbstract: {
    marginTop: 10,
    overflowWrap: 'break-word',
    maxHeight: 192,
    lineHeight: '24px',
    overflowY: 'hidden',
  },
};
