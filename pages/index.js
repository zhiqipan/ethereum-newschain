import React, { Component } from 'react';
import { Button, Card, Dimmer, Loader } from 'semantic-ui-react';
import factory from '../ethereum/instances/factory';
import Layout from '../client/components/Layout';
import { Link } from '../routes';
import loadArticleDetail from '../client/utils/loadArticleDetail';
import HtmlViewer from '../client/components/HtmlViewer';

const cachedArticles = {};

class HomePage extends Component {
  static async getInitialProps() {
    const articles = await factory.methods.getArticles().call();
    return { articles };
  }

  state = {
    articles: {},
  };

  renderArticles() {
    const items = this.props.articles.map(addr => {
      const article = this.state.articles[addr] || cachedArticles[addr];

      if (!article) {
        loadArticleDetail(addr).then(detail => {
          this.setState(state => {
            state.articles[addr] = detail;
            cachedArticles[addr] = detail;
            return { articles: { ...state.articles } };
          });
        });

        return {
          header: addr,
          meta: <Link route={`/articles/${addr}`}><a>View article</a></Link>,
          description: <Loader active />,
          fluid: true,
        };
      }

      return {
        header: article.title,
        meta: <Link route={`/articles/${addr}`}><a>View article</a></Link>,
        description: <HtmlViewer html={article.body.replace(/<img[^>]*>/g, '')} style={styles.bodyAbstract} />,
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

const styles = {
  bodyAbstract: {
    marginTop: 10,
    overflowWrap: 'break-word',
    maxHeight: 192,
    lineHeight: '24px',
    overflowY: 'hidden',
  },
};
