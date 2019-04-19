import React, { Component } from 'react';
import { Card, Loader } from 'semantic-ui-react';
import { Link } from '../../routes';
import loadArticleDetail from '../../client/utils/loadArticleDetail';
import HtmlViewer from '../../client/components/HtmlViewer';

const cachedArticles = {};

export default class ArticleList extends Component {
  static defaultProps = {
    articles: [],
    getLink: address => null,
  };

  state = {
    articles: {},
  };

  render() {
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
          meta: <Link route={this.props.getLink(addr)}>View article</Link>,
          description: <Loader active />,
          fluid: true,
        };
      }

      return {
        header: article.title,
        meta: <Link route={this.props.getLink(addr)}>View article</Link>,
        description: <HtmlViewer html={article.body.replace(/<img[^>]*>/g, '')} style={styles.bodyAbstract} />,
        fluid: true,
      };
    });

    return <Card.Group items={items} />;
  }
}

const styles = {
  bodyAbstract: {
    marginTop: 10,
    overflowWrap: 'break-word',
    maxHeight: 192,
    lineHeight: '24px',
    overflowY: 'hidden',
  },
};
