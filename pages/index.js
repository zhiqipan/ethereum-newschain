import React, { Component } from 'react';
import { Button, Card, Grid, Icon, Label, Statistic } from 'semantic-ui-react';
import Layout from '../client/components/Layout';
import { Context } from '../client/context/context';
import { Link } from '../routes';
import factory from '../ethereum/instances/factory';
import token from '../ethereum/instances/token';
import web3 from '../ethereum/utils/web3';
import { MenuItemEnum } from '../client/context/menu';
import { loadArticleSummary } from '../client/utils/loadArticleDetail';

export default class IndexPage extends Component {
  static contextType = Context;

  state = {
    articles: [],
    tokenSupply: 0,
    citationCount: 0,
    creatorMap: {},
    totalRewardValue: 0,
    totalRewardTimes: 0,

    unfold: false,
    metamaskOk: null,
    metamaskWarning: null,
  };

  async componentDidMount() {
    this.context.menu.select(MenuItemEnum.HOME);
    const articles = await factory.methods.getArticles().call();
    const tokenSupply = await token.methods.totalSupply().call();
    this.setState({ articles, tokenSupply });
    await this.checkMetamask();
    await this.loadMoreStat();
  }

  loadMoreStat = async () => {
    const { articles: addresses } = this.state;
    addresses.map(async address => {
      const article = await loadArticleSummary(address);
      const { creator, citations, rewardValue, rewardTimes } = article;
      this.setState(state => {
        state.totalRewardTimes += parseInt(rewardTimes);
        state.totalRewardValue += parseInt(rewardValue);
        if (!state.creatorMap[creator]) state.creatorMap[creator] = 0;
        state.creatorMap[creator] += 1;
        state.citationCount += citations.length;
        return {
          totalRewardTimes: state.totalRewardTimes,
          totalRewardValue: state.totalRewardValue,
          creatorMap: { ...state.creatorMap },
          citationCount: state.citationCount,
        };
      });
    });
  };

  async checkMetamask() {
    if (process.browser) {
      let metamaskOk = true;
      if (!window.web3) {
        this.setState({ metamaskWarning: 'MetaMask not installed in your browser' });
        metamaskOk = false;
      } else {
        const enabled = (await web3.eth.getAccounts()).length > 0;
        if (!enabled) {
          this.setState({ metamaskWarning: 'MetaMask not enabled on this site, run ethereum.enable() in browser console first', hasMetamask: false });
          metamaskOk = false;
        }
      }
      this.setState({ metamaskOk });
    }
  }

  render() {
    const { tokenSupply, articles, creatorMap, totalRewardValue, totalRewardTimes, citationCount } = this.state;
    const articleCount = articles.length;
    const creatorCount = Object.keys(creatorMap).length;
    const totalRewardValueEther = parseFloat(web3.utils.fromWei(totalRewardValue.toString(), 'ether').toString());

    return (
      <Layout>
        <Card fluid style={{ height: 500 }}>
          <Card.Content>
            <Grid columns='equal' textAlign='center' style={{ height: 250 }}>
              <Grid.Column style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Statistic color='orange' label='Articles published' value={articleCount} size='huge' />
              </Grid.Column>
              <Grid.Column style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Statistic color='orange' label='Starts from' value={2019} size='huge' />
              </Grid.Column>
              <Grid.Column style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Statistic color='orange' label='Tokens offered' value={tokenSupply} size='huge' />
              </Grid.Column>
            </Grid>
          </Card.Content>
          <Card.Content>
            <Grid columns='equal' textAlign='center' style={{ height: 250 }}>
              <Grid.Column style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Statistic color='orange' label='Unique publishers' value={creatorCount} size='huge' />
              </Grid.Column>
              <Grid.Column style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Statistic color='orange' label='Times of citations' value={citationCount} size='huge' />
              </Grid.Column>
              <Grid.Column style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Statistic color='orange' label='Times of rewarding' value={totalRewardTimes} size='huge' />
              </Grid.Column>
              <Grid.Column style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Statistic color='orange' label='Ether rewarded' value={totalRewardValueEther} size='huge' />
              </Grid.Column>
            </Grid>
          </Card.Content>
        </Card>
        <div style={{ margin: 20, textAlign: 'center' }}>
          <Link route='/articles'>
            <a className='ui button color orange huge'>More to Discover...</a>
          </Link>
        </div>
        {this.state.metamaskOk === false &&
        <div style={{ margin: 20, textAlign: 'center', color: 'grey' }}>
          <p>{this.state.metamaskWarning}</p>
          <p><b>You can only read information on this site</b></p>
        </div>
        }
        {this.state.metamaskOk === true &&
        <div style={{ margin: 20, textAlign: 'center' }}><Label color='orange' basic><Icon name='check' />MetaMask ready</Label></div>
        }
      </Layout>
    );
  }
}
