import React, { Component } from 'react';
import { Button } from 'semantic-ui-react';
import factory from '../../ethereum/instances/factory';
import Layout from '../../client/components/Layout';
import { Link } from '../../routes';
import ArticleList from '../../client/components/ArticleList';

export default class ArticlesIndexPage extends Component {
  static async getInitialProps() {
    const articles = await factory.methods.getArticles().call();
    return { articles };
  }

  state = {
    refreshing: false,
    articles: this.props.articles,
  };

  refresh = async () => {
    this.setState({ articles: [], refreshing: true });
    const articles = await factory.methods.getArticles().call();
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
