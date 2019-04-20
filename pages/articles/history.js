import React, { Component } from 'react';
import { Link } from '../../routes';
import Layout from '../../client/components/Layout';
import getArticle from '../../ethereum/instances/article';
import { getFromSwarm } from '../../client/utils/swarm';
import { Loader, Pagination, Segment } from 'semantic-ui-react';
import Article from '../../client/components/Article';
import { Context } from '../../client/context/context';
import { MenuItemEnum } from '../../client/context/menu';

export default class ArticleHistoryPage extends Component {
  static contextType = Context;

  static async getInitialProps(props) {
    const { address } = props.query;
    const lastVersionNum = parseInt(await getArticle(address).methods.version().call());
    const latestHash = (await getArticle(address).methods.contentHash().call()).replace('0x', '');
    return { address, lastVersionNum, latestHash };
  }

  state = {
    activeVersion: this.props.lastVersionNum,
    versions: [],
  };

  handlePaginationChange = (e, { activePage }) => {
    this.setState({ activeVersion: activePage - 1 });
  };

  async componentDidMount() {
    this.context.menu.select(MenuItemEnum.ARTICLES);

    const { latestHash: contentHash } = this.props;
    const { title, body } = JSON.parse(await getFromSwarm(contentHash));
    this.setState(state => {
      state.versions[this.props.lastVersionNum] = { title, body, contentHash };
      return { versions: state.versions };
    });
  }

  async componentDidUpdate(prevProps, prevState) {
    const versionChanged = prevState.activeVersion !== this.state.activeVersion;
    const notFetched = !this.state.versions[this.state.activeVersion];
    if (versionChanged && notFetched) {
      const { address } = this.props;
      const { activeVersion } = this.state;
      const contentHash = (await getArticle(address).methods.history(activeVersion).call()).replace('0x', '');
      const { title, body } = JSON.parse(await getFromSwarm(contentHash));
      this.setState(state => {
        state.versions[activeVersion] = { title, body, contentHash };
        return { versions: state.versions };
      });
    }
  }

  render() {
    const { activeVersion: version } = this.state;
    const article = this.state.versions[version];
    return (
      <Layout>
        <h1>History</h1>
        <Loader active={!article} />
        {article &&
        <Segment raised style={{ overflowY: 'auto', maxHeight: 580 }}>
          <Article
            address={this.props.address}
            contentHash={article.contentHash}
            title={article.title}
            body={article.body}
            version={version}
            hideHistoryMenuItem
          />
        </Segment>
        }
        <Pagination
          style={{ position: 'absolute', bottom: 20 }}
          onPageChange={this.handlePaginationChange}
          activePage={this.state.activeVersion + 1}
          totalPages={this.props.lastVersionNum + 1} />
      </Layout>
    );
  }
}
