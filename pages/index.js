import React, { Component } from 'react';
import { Button, Card } from 'semantic-ui-react';
import factory from '../ethereum/instances/factory';
import Layout from '../components/Layout';
import { Link } from '../routes';

class HomePage extends Component {
  static async getInitialProps() {
    const articles = await factory.methods.getArticles().call();
    return { articles };
  }

  renderArticles() {
    const items = this.props.articles.map(addr => {
      return {
        header: addr,
        description: (
          <Link route={`/articles/${addr}`}>
            <a>View article</a>
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
        <h3>Published articles</h3>
        <Link route='/articles/new'>
          <a>
            <Button
              content='Draft article'
              icon='add circle'
              floated='right'
              primary
            />
          </a>
        </Link>
        {this.renderArticles()}
      </Layout>
    );
  }
}

export default HomePage;
