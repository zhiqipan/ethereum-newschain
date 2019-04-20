import React, { Component } from 'react';
import { Card, Loader, Pagination } from 'semantic-ui-react';
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
    articlesDetail: {},
    itemsPerPage: 10,
    activePage: 1, // start from 1
  };

  load = (articles) => {
    articles.map(addr => {
      if (!cachedArticles[addr])
        loadArticleDetail(addr).then(detail => {
          this.setState(state => {
            state.articlesDetail[addr] = detail;
            cachedArticles[addr] = detail;
            return { articlesDetail: { ...state.articlesDetail } };
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
    const { articles: addresses } = this.props;
    const { articlesDetail, activePage, itemsPerPage } = this.state;

    const items = addresses
      .filter((_, index) => {
        return index >= (activePage - 1) * itemsPerPage && index < activePage * itemsPerPage;
      })
      .map(addr => {
        const article = articlesDetail[addr] || cachedArticles[addr];

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

    return (
      <div>
        <Card.Group items={items} />
        <Pagination
          style={{ marginTop: 20 }}
          activePage={activePage}
          onPageChange={(e, { activePage }) => this.setState({ activePage })}
          totalPages={Math.ceil(addresses.length / itemsPerPage)}
        />
      </div>
    );
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
