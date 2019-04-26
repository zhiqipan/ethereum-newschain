import React, { Component } from 'react';
import { Card, Menu } from 'semantic-ui-react';
import Layout from '../../client/components/Layout';
import CitationVisualGlobal from '../../client/components/visual/CitationVisualGlobal';
import ArticleList from '../../client/components/ArticleList';
import factory from '../../ethereum/instances/factory';
import { Context } from '../../client/context/context';
import { MenuItemEnum } from '../../client/context/menu';

export default class VisualIndexPage extends Component {
  static contextType = Context;

  static async getInitialProps() {
    let articles = await factory.methods.getArticles().call();
    if (articles) {
      articles = articles.reverse();
    }
    return { articles };
  }

  componentDidMount() {
    this.context.menu.select(MenuItemEnum.VISUAL);
  }

  state = {
    menuActive: 'global',
  };

  renderGlobal() {
    return (
      <Card fluid>
        <Card.Content>
          <CitationVisualGlobal />
        </Card.Content>
      </Card>
    );
  }

  renderArticleList() {
    return <ArticleList articles={this.props.articles} getLink={addr => `/visual/${addr}`} />;
  }

  render() {
    const { menuActive } = this.state;
    return (
      <Layout>
        <Menu tabular>
          <Menu.Item name='Global' active={menuActive === 'global'} onClick={() => this.setState({ menuActive: 'global' })} />
          <Menu.Item name='Single' active={menuActive === 'single'} onClick={() => this.setState({ menuActive: 'single' })} />
        </Menu>
        {menuActive === 'global' && this.renderGlobal()}
        {menuActive === 'single' && this.renderArticleList()}
      </Layout>
    );
  }
}
