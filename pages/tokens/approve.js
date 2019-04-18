import React, { Component } from 'react';
import { Button, Card, Form, Grid, Input, Segment, Statistic } from 'semantic-ui-react';
import Layout from '../../client/components/Layout';
import getArticle from '../../ethereum/instances/article';
import getERC20 from '../../ethereum/instances/erc20';
import web3 from '../../ethereum/utils/web3';
import { getFromSwarm } from '../../client/utils/swarm';
import ArticleAbstractCard from '../../client/components/ArticleAbstractCard';
import TokenLabel from '../../client/components/TokenLabel';
import AddressLabel from '../../client/components/AddressLabel';

export default class TokenApprovePage extends Component {
  static async getInitialProps(props) {
    const { token: tokenAddr, article: articleAddr } = props.query;
    const result = {};

    const rewardRecipient = await getArticle(articleAddr).methods.rewardRecipient().call();
    const contentHash = await getArticle(articleAddr).methods.contentHash().call();
    const { title, body } = JSON.parse(await getFromSwarm(contentHash.replace('0x', '')));
    result.article = { address: articleAddr, rewardRecipient, contentHash, title, body };

    const tokenName = await getERC20(tokenAddr).methods.name().call();
    const tokenSymbol = await getERC20(tokenAddr).methods.symbol().call();
    result.token = { address: tokenAddr, name: tokenName, symbol: tokenSymbol };

    return result;
  }

  state = {
    approvedAmount: null,
    amountToApprove: 0,
    account: '',
    balance: null,
  };

  async componentDidMount() {
    const { address } = this.props.token;
    const { rewardRecipient: recipient } = this.props.article;
    const account = (await web3.eth.getAccounts())[0];
    const approvedAmount = parseFloat(await getERC20(address).methods.allowance(account, recipient).call());
    const balance = parseFloat(await getERC20(address).methods.balanceOf(account).call());
    this.setState({ account, balance, approvedAmount });
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
    this.setState({ approvedAmount: parseFloat(amountToApprove), amountToApprove: 0 });
  };

  render() {
    const { token, article } = this.props;
    return (
      <Layout>
        <h1>Approve token transfer</h1>
        <p>Approve your account some amount of allowance (ERC20 tokens) to be retrieved by your recipient</p>
        <Segment raised>
          <AddressLabel basic color='blue' icon='gem' name='Token address' address={token.address} style={{ marginBottom: 10, marginRight: 10 }} />
          {!token.symbol && !token.name ?
            <TokenLabel style={{ marginBottom: 10 }} />
            :
            <AddressLabel basic color='green' icon='check' name='Verified' address={token.symbol + ' | ' + token.name} style={{ marginBottom: 10 }} />
          }
          <br />
          <AddressLabel icon='ethereum' name='Your account' address={this.state.account} style={{ marginBottom: 10 }} />
          <br />
          <AddressLabel icon='gift' name='Article reward recipient' address={article.rewardRecipient} style={{ marginBottom: 10 }} />

          <Card.Group itemsPerRow={2}>
            <Card>
              <Card.Content>
                <Grid columns='equal' textAlign='center' style={{ height: '100%' }}>
                  <Grid.Column style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Statistic label='Balance' value={this.state.balance || 0} />
                  </Grid.Column>
                  <Grid.Column style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Statistic label='Approved' value={this.state.approvedAmount || 0} />
                  </Grid.Column>
                  <Grid.Column style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Statistic label='After transfer' value={this.state.balance - this.state.approvedAmount} />
                  </Grid.Column>
                </Grid>
              </Card.Content>
            </Card>
            <ArticleAbstractCard {...article} />
          </Card.Group>

        </Segment>
        <Form onSubmit={this.approve}>
          <Form.Field>
            <label>Amount to (re)approve</label>
            <Input
              type='number'
              min='0'
              label='token(s)'
              labelPosition='right'
              value={this.state.amountToApprove}
              onChange={event => this.setState({ amountToApprove: event.target.value })}
            />
          </Form.Field>
          <Button primary>Approve</Button>
        </Form>
      </Layout>
    );
  }
}
