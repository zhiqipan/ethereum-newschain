import React, { Component } from 'react';
import { Button, Card, Grid } from 'semantic-ui-react';
import { Link } from '../../routes';
import Layout from '../../components/Layout';
import web3 from '../../ethereum/utils/web3';
import getCampaign from '../../ethereum/instances/campaign';
import ContributeForm from '../../components/ContributeForm';

function translateSummary(original) {
  const summaryMap = ['manager', 'description', 'minContribution', 'balance', 'contributorCount', 'requestCount'];
  const result = {};
  summaryMap.forEach((name, index) => {
    result[name] = original[index];
  });
  return result;
}

export default class CampaignDetailsPage extends Component {
  static async getInitialProps(props) {
    const { address } = props.query;
    const summary = await getCampaign(address).methods.getSummary().call();
    return { address, summary: translateSummary(summary) };
  }

  renderSummary() {
    const { manager, description, minContribution, balance, contributorCount, requestCount } = this.props.summary;
    const items = [{
      header: manager,
      meta: 'Address of manager',
      description: 'This manager created such campaign and can create requests to retrieve funding',
      style: { overflowWrap: 'break-word' },
    }, {
      header: description,
      description: 'Description of this campaign',
    }, {
      header: minContribution,
      meta: 'Minimum contribution (wei)',
      description: 'You must contribute at least this much wei to become a contributor',
    }, {
      header: contributorCount,
      meta: 'Number of contributors',
    }, {
      header: requestCount,
      meta: 'Number of requests',
    }, {
      header: web3.utils.fromWei(balance.toString(), 'ether'),
      meta: 'Balance (ether)',
    }];
    return <Card.Group items={items} />;
  }

  render() {
    const { address } = this.props;
    return (
      <Layout>
        <h1>Campaign details</h1>
        <p style={{ fontFamily: 'monospace' }}>{address}</p>
        <Grid>
          <Grid.Row>
            <Grid.Column width={10}>
              {this.renderSummary()}
            </Grid.Column>
            <Grid.Column width={6}>
              <ContributeForm address={address} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Link route={`/campaigns/${address}/requests`}>
                <a><Button primary>View requests</Button></a>
              </Link>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Layout>
    );
  }
}
