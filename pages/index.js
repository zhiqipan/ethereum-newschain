import React, { Component } from 'react';
import { Card, Grid, Statistic } from 'semantic-ui-react';
import Layout from '../client/components/Layout';
import { Context } from '../client/context/context';
import { Link } from '../routes';
import factory from '../ethereum/instances/factory';
import token from '../ethereum/instances/token';
import web3 from '../ethereum/utils/web3';
import { MenuItemEnum } from '../client/context/menu';

export default class IndexPage extends Component {
  static contextType = Context;

  async componentDidMount() {
    this.context.menu.select(MenuItemEnum.HOME);
    const articles = await factory.methods.getArticles().call();
    const tokenSupply = await token.methods.totalSupply().call();
    this.setState({ articleCount: articles.length, tokenSupply });
    await this.checkMetamask();
  }

  async checkMetamask() {
    if (process.browser) {
      if (!window.web3) {
        this.setState({ metamaskWarning: 'MetaMask not installed in your browser' });
      } else {
        const enabled = (await web3.eth.getAccounts()).length > 0;
        if (!enabled) {
          this.setState({ metamaskWarning: 'MetaMask not enabled on this site, run ethereum.enable() in browser console first' });
        }
      }
    }
  }

  state = {
    articleCount: 0,
    tokenSupply: 0,
  };

  render() {
    return (
      <Layout>
        <Card fluid style={{ height: 300 }}>
          <Card.Content>
            <Grid columns='equal' textAlign='center' style={{ height: 300 }}>
              <Grid.Column style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Statistic color='orange' label='Starts from' value={2019} size='huge' />
              </Grid.Column>
              <Grid.Column style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Statistic color='orange' label='Articles published' value={this.state.articleCount} size='huge' />
              </Grid.Column>
              <Grid.Column style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Statistic color='orange' label='NC Tokens generated' value={this.state.tokenSupply} size='huge' />
              </Grid.Column>
            </Grid>
          </Card.Content>
        </Card>
        <div style={{ margin: 20, textAlign: 'center' }}>
          <Link route='/articles'>
            <a className='ui button color orange huge'>More to Discover...</a>
          </Link>
        </div>
        {this.state.metamaskWarning &&
        <div style={{ margin: 20, textAlign: 'center', color: 'grey' }}>
          <p>{this.state.metamaskWarning}</p>
          <p><b>You can only read information on this site</b></p>
        </div>
        }
      </Layout>
    );
  }
}
