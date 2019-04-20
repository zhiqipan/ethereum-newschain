import React, { Component } from 'react';
import { Card, Menu } from 'semantic-ui-react';
import Layout from '../../client/components/Layout';
import CitationVisualSingle from '../../client/components/visual/CitationVisualSingle';
import ArticleStreamline from '../../client/components/ArticleStreamline';
import { Context } from '../../client/context/context';
import { MenuItemEnum } from '../../client/context/menu';

export default class VisualSinglePage extends Component {
  static contextType = Context;

  static getInitialProps(props) {
    const { address, tab } = props.query;
    return { address, tab };
  }

  componentDidMount() {
    this.context.menu.select(MenuItemEnum.VISUAL);
  }

  state = {
    menuActive: this.props.tab || 'all',
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
              <Menu.Item name='Streamline view' active={menuActive === 'streamline'} onClick={() => this.setState({ menuActive: 'streamline' })} />
            </Menu>
            {menuActive === 'streamline' ?
              <ArticleStreamline address={address} /> :
              <CitationVisualSingle address={address} mode={menuActive} />
            }
          </Card.Content>
        </Card>
      </Layout>
    );
  }
}
