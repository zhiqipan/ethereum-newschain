import React, { Component } from 'react';
import { Card, Divider, Input, Loader, Pagination } from 'semantic-ui-react';
import h2p from 'html2plaintext';
import moment from 'moment';
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
    itemsPerPage: 6,
    activePage: 1, // start from 1
    filterInput: '',
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

  renderSearchBar() {
    const { filterInput } = this.state;

    return (
      <div style={{ marginBottom: 20 }}>
        <Input
          style={{ width: 500 }}
          value={filterInput}
          onChange={e => this.setState({ filterInput: e.target.value })}
          placeholder='filter anything' />
        <Divider />
      </div>
    );
  }

  render() {
    const { articles: addresses } = this.props;
    const { articlesDetail, activePage, itemsPerPage, filterInput } = this.state;

    const items = addresses
      .filter(addr => { // do this filtering before paging
        const article = articlesDetail[addr] || cachedArticles[addr];
        if (!article || !filterInput) return true;

        const wordsAndPhrases = [];

        const phrases = filterInput.trim().match(/(\s*"([^"]|"")*"\s*)/g);
        if (phrases && phrases.length > 0) wordsAndPhrases.push(...phrases.map(p => p.substr(1, p.length - 2).trim()).filter(Boolean));
        const words = filterInput.trim().replace(/("([^"]|"")*")/g, ' ').split(/\s+/);
        if (words && words.length > 0) wordsAndPhrases.push(...words.map(w => w.trim()).filter(Boolean));

        const { creator, contentHash, swarmContent } = article;
        const { title, body, subtitle = '', authorNames, initialPublishTime, lastModifyTime } = swarmContent;
        // const plainBody = h2p(body);
        let matched = false;
        wordsAndPhrases.forEach(wordOrPhrase => {
          if (!wordOrPhrase) return matched = false;

          const wp = wordOrPhrase.toLowerCase();
          if (wp.length >= 4 && addr.toLowerCase().includes(wp)) return matched = true;
          if (wp.length >= 4 && creator.toLowerCase().includes(wp)) return matched = true;
          if (wp.length >= 4 && contentHash.toLowerCase().includes(wp)) return matched = true;
          if (title.toLowerCase().includes(wp)) return matched = true;
          if (subtitle.toLowerCase().includes(wp)) return matched = true;
          // if (plainBody && plainBody.toLowerCase().includes(wp)) return matched = true;
          if (authorNames && authorNames.length > 0 && authorNames.join(' ').toLowerCase().includes(wp)) return matched = true;
          if (initialPublishTime && moment(initialPublishTime).format('YYYY-MM-DD').toLowerCase().includes(wp)) return matched = true;
          if (lastModifyTime && moment(lastModifyTime).format('YYYY-MM-DD').toLowerCase().includes(wp)) return matched = true;
        });
        return matched;
      })
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

        const { title, body, subtitle, authorNames, initialPublishTime, lastModifyTime } = article.swarmContent;
        const timestamp = initialPublishTime || lastModifyTime;
        const authors = authorNames && authorNames.length > 0 && `Authored by: ${authorNames.join(', ')}`;
        const time = timestamp && moment(timestamp).format('YYYY-MM-DD');

        const mataContent = [subtitle, authors, time].filter(Boolean);

        return {
          header: title,
          meta: mataContent.join('  |  '),
          description: (
            <>
              <Link route={this.props.getLink(addr)}><a>View article</a></Link>
              <p style={styles.bodyAbstract}>{h2p(body)}</p>
            </>
          ),
          fluid: true,
        };
      });

    return (
      <div>
        {this.renderSearchBar()}
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
