import React, { Component } from 'react';
import { Button, Table } from 'semantic-ui-react';
import Layout from '../../../components/Layout';
import { Link } from '../../../routes';
import getCampaign from '../../../ethereum/instances/campaign';
import RequestRow from '../../../components/RequestRow';
import web3 from '../../../ethereum/utils/web3';

export default class RequestsPage extends Component {
  static async getInitialProps(props) {
    const { address } = props.query;
    const campaign = getCampaign(address);
    const requestCount = await campaign.methods.getRequestCount().call();
    const manager = await campaign.methods.manager().call();
    const contributorCount = (await campaign.methods.getContributors().call()).length;
    let requests = await Promise.all(Array(parseInt(requestCount)).fill(0).map((_, index) => {
      return campaign.methods.requests(index).call();
    }));
    requests = requests.map(({ description, value, recipient, isCompleted, approvalCount }) => {
      return { description, value, recipient, isCompleted, approvalCount };
    });
    return { address, requests, manager, contributorCount };
  }

  state = {
    account: '',
  };

  async componentDidMount() {
    const account = (await web3.eth.getAccounts())[0];
    this.setState({ account });
  }

  renderRequestTable() {
    return (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>ID</Table.HeaderCell>
            <Table.HeaderCell>Description</Table.HeaderCell>
            <Table.HeaderCell>Amount (ether)</Table.HeaderCell>
            <Table.HeaderCell>Recipient</Table.HeaderCell>
            <Table.HeaderCell>Approval count</Table.HeaderCell>
            <Table.HeaderCell>Action</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {this.renderRequestRows()}
        </Table.Body>
      </Table>
    );
  }

  renderRequestRows() {
    const { address, requests, manager, contributorCount } = this.props;
    if (!requests) return null;

    return requests.map((request, index) => (
      <RequestRow
        key={index}
        index={index}
        address={address}
        request={request}
        isManager={manager.toLowerCase() === this.state.account.toLowerCase()}
        campaignContributorCount={contributorCount}
      />
    ));
  }

  render() {
    const { address, requests } = this.props;
    return (
      <Layout>
        <h1>Requests</h1>
        <p style={{ fontFamily: 'monospace' }}>{address}</p>
        <Link route={`/campaigns/${this.props.address}/requests/new`}>
          <a><Button primary floated='right' style={{ marginBottom: 10 }}>Add request</Button></a>
        </Link>
        {this.renderRequestTable()}
        <p>{requests.length.toString()} request(s) found</p>
      </Layout>
    );
  }
}
