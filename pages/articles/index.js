import React, { Component } from 'react';
import factory from '../../ethereum/instances/factory';
import Layout from '../../client/components/Layout';
import { Link } from '../../routes';
import ArticleList from '../../client/components/ArticleList';

export default class ArticlesIndexPage extends Component {
  static async getInitialProps() {
    const articles = await factory.methods.getArticles().call();
    return { articles };
  }

  render() {
    return (
      <Layout>
        <h3>Published articles</h3>
        <div style={{ marginBottom: 10 }}>
          <Link route='/articles/new'><a className='ui button color orange'>Draft article</a></Link>
        </div>
        <ArticleList articles={this.props.articles} getLink={addr => `/articles/${addr}`} />
      </Layout>
    );
  }
}
