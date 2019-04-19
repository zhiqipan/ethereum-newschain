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

  render() {
    return (
      <Layout>
        <h3>Published articles</h3>
        <Button
          href='/articles/new'
          content='Draft article'
          icon='add circle'
          floated='right'
          primary
        />
        <ArticleList articles={this.props.articles} getLink={addr => `/articles/${addr}`} />
      </Layout>
    );
  }
}
