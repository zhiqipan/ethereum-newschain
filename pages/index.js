import React, { Component } from 'react';
import { Button, Card } from 'semantic-ui-react';
import factory from '../ethereum/instances/factory';
import Layout from '../components/Layout';
import { Link } from '../routes';

class HomePage extends Component {
  /*
  This is specifically for next.js.
  Server-side rendering does not call componentDidMount(),
  so the initialization of data has to be done in this method.
  This is a class method so that next can call this without
  instantiation of the component,
  that is, no rendering of the component is needed when loading initial props.
  This is for the sake of efficiency.
  This can be called on client side as well when calling replaceRoute using the next-routes router.
  This method is only called if the component is in /pages folder.
  */
  static async getInitialProps() {
    const campaigns = await factory.methods.getCampaigns().call();
    return { campaigns };
  }

  renderCampaigns() {
    const items = this.props.campaigns.map(addr => {
      return {
        header: addr,
        description: (
          <Link route={`/campaigns/${addr}`}>
            <a>View campaign</a>
          </Link>
        ),
        fluid: true,
      };
    });

    return <Card.Group items={items} />;
  }

  render() {
    // Wrapping <Button> in <a> tag gives the right-click functionality in browser, e.g. opening in new tab
    return (
      <Layout>
        <h3>Open campaigns</h3>
        <Link route='/campaigns/new'>
          <a>
            <Button
              content='Create campaign'
              icon='add circle'
              floated='right'
              primary
            />
          </a>
        </Link>
        {this.renderCampaigns()}
      </Layout>
    );
  }
}

export default HomePage;
