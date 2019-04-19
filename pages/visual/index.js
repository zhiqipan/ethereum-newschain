import React, { Component } from 'react';
import { Card } from 'semantic-ui-react';
import Layout from '../../client/components/Layout';
import CitationVisual from '../../client/components/visual/CitationVisual';

export default class Header extends Component {
  render() {
    return (
      <Layout>
        <Card fluid>
          <Card.Content>
            <CitationVisual />
          </Card.Content>
        </Card>
      </Layout>
    );
  }
}
