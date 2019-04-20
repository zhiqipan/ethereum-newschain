import React, { Component } from 'react';
import { Message, Loader } from 'semantic-ui-react';
import Layout from '../../client/components/Layout';
import web3 from '../../ethereum/utils/web3';
import { Router, Link } from '../../routes';
import { getFromSwarm } from '../../client/utils/swarm';
import getArticle from '../../ethereum/instances/article';
import { Context } from '../../client/context/context';
import { MenuItemEnum } from '../../client/context/menu';
import ArticleInputForm from '../../client/components/ArticleInputForm';
import AddressLabel from '../../client/components/AddressLabel';

export default class ArticleModifyPage extends Component {
  static contextType = Context;

  static getInitialProps(props) {
    const { address, hash: contentHash } = props.query;
    return { address, contentHash };
  }

  static defaultProps = {
    address: '',
    contentHash: '',
  };

  state = {
    loading: true,
    swarmContent: {},
    isCreator: null,
  };

  async componentDidMount() {
    this.context.menu.select(MenuItemEnum.ARTICLES);

    const swarmContent = JSON.parse(await getFromSwarm(this.props.contentHash));
    this.setState({ swarmContent, loading: false });

    const account = (await web3.eth.getAccounts())[0];
    const creator = await getArticle(this.props.address).methods.creator().call();
    this.setState({ isCreator: account.toLowerCase() === creator.toLowerCase() });
  }

  render() {
    const { address } = this.props;
    const { isCreator, swarmContent, loadingSwarm } = this.state;

    return (
      <Layout>
        <h1>Modify an article</h1>
        <AddressLabel basic name='Article address' icon='ethereum' address={address} color='orange' style={{ marginBottom: 20 }} />
        {!loadingSwarm &&
        <>
          <ArticleInputForm address={address} mode='modify' disabled={isCreator === false} initialSwarmContent={swarmContent} />
        </>
        }
        <Loader active={loadingSwarm} />
        {isCreator === false &&
        <Message error header='You are not the creator' content={'Only the creator itself can modify this article'} />
        }
        {isCreator === null &&
        <div style={{ marginTop: 15, display: 'flex', alignItems: 'center' }}>
          <Loader active inline style={{ marginRight: 10 }} /><span>Checking your identity...</span>
        </div>
        }
      </Layout>
    );
  }
}
