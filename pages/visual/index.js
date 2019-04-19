import React, { Component } from 'react';
import { Card } from 'semantic-ui-react';
import Layout from '../../client/components/Layout';
import CitationVisualGlobal from '../../client/components/visual/CitationVisualGlobal';
import CitationVisualSingle from '../../client/components/visual/CitationVisualSingle';

export default class Header extends Component {
  render() {
    return (
      <Layout>
        <Card fluid>
          <Card.Content>
            {/*<CitationVisualGlobal />*/}
            <CitationVisualSingle />
          </Card.Content>
        </Card>
      </Layout>
    );
  }
}
