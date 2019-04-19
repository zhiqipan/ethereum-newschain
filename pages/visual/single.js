import React, { Component } from 'react';
import { Card, Menu } from 'semantic-ui-react';
import Layout from '../../client/components/Layout';
import CitationVisualSingle from '../../client/components/visual/CitationVisualSingle';

export default class VisualSinglePage extends Component {
  static getInitialProps(props) {
    const { address } = props.query;
    return { address };
  }

  state = {
    menuActive: 'all',
  };

  render() {
    const { address } = this.props;
    const { menuActive } = this.state;

    return (
      <Layout>
        <Card fluid>
          <Card.Content>
            <Menu secondary>
              <Menu.Item name='All' active={menuActive === 'all'} onClick={() => this.setState({ menuActive: 'all' })} />
              <Menu.Item name='Citations only' active={menuActive === 'citations'} onClick={() => this.setState({ menuActive: 'citations' })} />
              <Menu.Item name='Cited by others only' active={menuActive === 'citedBy'} onClick={() => this.setState({ menuActive: 'citedBy' })} />
            </Menu>
            <CitationVisualSingle address={address} mode={menuActive} />
          </Card.Content>
        </Card>
      </Layout>
    );
  }
}
