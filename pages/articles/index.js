import React, { Component } from 'react';
import { Button } from 'semantic-ui-react';
import factory from '../../ethereum/instances/factory';
import Layout from '../../client/components/Layout';
import { Link } from '../../routes';
import ArticleList from '../../client/components/ArticleList';
import { Context } from '../../client/context/context';
import { MenuItemEnum } from '../../client/context/menu';

export default class ArticlesIndexPage extends Component {
  static contextType = Context;

  static async getInitialProps() {
    let articles = await factory.methods.getArticles().call();
    if (articles) {
      articles = articles.reverse();
    }
    return { articles };
  }

  state = {
    refreshing: false,
    articles: this.props.articles,
  };

  componentDidMount() {
    this.context.menu.select(MenuItemEnum.ARTICLES);
  }

  refresh = async () => {
    this.setState({ articles: [], refreshing: true });
    let articles = await factory.methods.getArticles().call();
    if (articles) {
      articles = articles.reverse();
    }
    this.setState({ articles, refreshing: false });
  };

  render() {
    const { articles, refreshing } = this.state;

    return (
      <Layout>
        <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
          <h1>Published articles</h1>
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link route='/articles/new'><a style={{ marginRight: 10 }} className='ui button color orange'>Draft article</a></Link>
              <Button basic secondary content='Refresh' icon='refresh' onClick={this.refresh} disabled={refreshing} loading={refreshing} />
            </div>
          </div>
        </div>
        <ArticleList articles={articles} getLink={addr => `/articles/${addr}`} />
      </Layout>
    );
  }
}
