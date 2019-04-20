import React, { Component } from 'react';
import { Card, Loader } from 'semantic-ui-react';
import h2p from 'html2plaintext';
import { Link } from '../../routes';
import loadArticleDetail from '../../client/utils/loadArticleDetail';

const cachedArticles = {};

export default class ArticleList extends Component {
  static defaultProps = {
    articles: [],
    getLink: address => null,
  };

  state = {
    articles: {},
  };

  load = (articles) => {
    articles.map(addr => {
      if (!cachedArticles[addr])
        loadArticleDetail(addr).then(detail => {
          this.setState(state => {
            state.articles[addr] = detail;
            cachedArticles[addr] = detail;
            return { articles: { ...state.articles } };
          });
        });
    });
  };

  componentDidMount() {
    this.load(this.props.articles);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.articles !== this.props.articles) {
      this.load(this.props.articles);
    }
  }

  render() {
    const items = this.props.articles.map(addr => {
      const article = this.state.articles[addr] || cachedArticles[addr];

      if (!article) {
        return {
          key: addr,
          header: <span style={{ fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{addr}</span>,
          meta: 'Loading...',
          description: <Loader active />,
          fluid: true,
        };
      }

      return {
        header: article.title,
        meta: <Link route={this.props.getLink(addr)}><a>View article</a></Link>,
        description: <p style={styles.bodyAbstract}>{h2p(article.body)}</p>,
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
