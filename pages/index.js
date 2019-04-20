import React, { Component } from 'react';
import { Button, Card, Grid, Statistic } from 'semantic-ui-react';
import Layout from '../client/components/Layout';
import { Context } from '../client/context/context';
import { Link } from '../routes';
import factory from '../ethereum/instances/factory';
import token from '../ethereum/instances/token';
import { MenuItemEnum } from '../client/context/menu';

export default class IndexPage extends Component {
  static contextType = Context;

  async componentDidMount() {
    this.context.menu.select(MenuItemEnum.HOME);
    const articles = await factory.methods.getArticles().call();
    const tokenSupply = await token.methods.totalSupply().call();
    this.setState({ articleCount: articles.length, tokenSupply });
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
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link route='/articles'>
            <a className='ui button color orange huge'>More to Discover...</a>
          </Link>
        </div>
      </Layout>
    );
  }
}
