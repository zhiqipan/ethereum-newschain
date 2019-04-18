import React, { Component } from 'react';
import { Card, Grid, Statistic } from 'semantic-ui-react';
import Layout from '../../client/components/Layout';
import AddressLabel from '../../client/components/AddressLabel';
import { factoryAddress } from '../../ethereum/instances/factory';
import loadFactorySummary from '../../client/utils/loadFactorySummary';

export default class FactoryIndexPage extends Component {
  static async getInitialProps() {
    const summary = await loadFactorySummary();
    return { ...summary };
  }

  render() {
    const { admin, articleCount, enableAutoTokenReward, autoTokenRewardCitationCap, autoTokenRewardAmount, autoTokenRewardFrom } = this.props;

    return (
      <Layout>
        <h1>Factory</h1>
        <p>All the articles are constructed here</p>
        <Card fluid>
          <Card.Content>
            <AddressLabel basic color='brown' icon='cogs' name='Factory address' address={factoryAddress} style={{ marginBottom: 10 }} />
            <br />
            <AddressLabel basic color='green' icon='check' name='Managed by' address={admin} style={{ marginBottom: 10 }} />
            <Grid columns='equal' textAlign='center' style={{ height: 250 }}>
              <Grid.Column style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <Statistic label='Articles constructed' value={articleCount} size='huge' />
              </Grid.Column>
            </Grid>
          </Card.Content>
        </Card>
      </Layout>
    );
  }
}
