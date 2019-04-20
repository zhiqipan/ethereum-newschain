import React, { Component } from 'react';
import { Button, Card, Divider, Grid, Segment } from 'semantic-ui-react';
import { Link } from '../../routes';
import Layout from '../../client/components/Layout';
import RewardForm from '../../client/components/RewardForm';
import web3 from '../../ethereum/utils/web3';
import { Context } from '../../client/context/context';
import loadArticleDetail from '../../client/utils/loadArticleDetail';
import Article from '../../client/components/Article';
import AddressLabel from '../../client/components/AddressLabel';
import { MenuItemEnum } from '../../client/context/menu';

export default class ArticleDetailPage extends Component {
  static contextType = Context;

  static async getInitialProps(props) {
    const { address } = props.query;
    const detail = await loadArticleDetail(address);

    return { address, ...detail };
  }

  componentDidMount() {
    this.context.menu.select(MenuItemEnum.ARTICLES);
  }

  renderSummary() {
    const { citations, citedBy, rewardValue, rewardTimes, tokenTypes, ncTokenReward } = this.props;
    const rewardValueEther = web3.utils.fromWei(rewardValue.toString(), 'ether');
    const otherTokenTypes = ncTokenReward > 0 ? tokenTypes.length - 1 : tokenTypes.length;

    function word(int, name) {
      return int + ' ' + name + (int > 1 ? 's' : '');
    }

    const items = [{
      header: `Cites ${word(citations.length, 'article')}`,
      meta: 'Number of citations of this article',
      description: 'How many other articles inspires the author',
    }, {
      header: `Cited by ${word(citedBy.length, 'article')}`,
      meta: 'The influence of this article',
      description: 'The more cited, the more influential the article is',
    }, {
      header: `${rewardValueEther} ether in ${word(rewardTimes, 'time')}`,
      meta: 'Reward gained',
      description: `This article has been rewarded by ether`,
    }, {
      header: `${word(ncTokenReward, 'NCT')}, ${word(otherTokenTypes, 'type')} of others`,
      meta: 'Tokens gained',
      description: `This article has been rewarded by tokens (NewsChain Token or others)`,
    }];

    return <Card.Group itemsPerRow={4} items={items} />;
  }

  render() {
    const { address, contentHash, title, body, citations, citedBy, rewardValue, version, creator, rewardRecipient, autoTokenRewarded, ncTokenReward } = this.props;
    const picked = this.context.picks.articles[address];
    const payload = {
      contentHash,
      title,
      body,
      citations,
      citedBy,
      rewardValueEther: web3.utils.fromWei(rewardValue.toString(), 'ether'),
      ncTokenReward,
    };

    return (
      <Layout>
        <Grid>
          <Grid.Row>
            <Grid.Column width={10}>
              <h1>Article</h1>
              <div>
                <AddressLabel icon='copyright' name='Creator address' address={creator} style={{ marginBottom: 10 }} />
                <AddressLabel icon='ethereum' name='Contract address' address={address} style={{ marginBottom: 10 }} />
                <AddressLabel icon='slack hash' name='Swarm hash' address={contentHash} style={{ marginBottom: 10 }} />
              </div>
            </Grid.Column>
            <Grid.Column width={6}>
              <RewardForm address={address} rewardRecipient={rewardRecipient} />
            </Grid.Column>
          </Grid.Row>
          <Divider />
          <Grid.Row>
            <Grid.Column>
              {this.renderSummary()}
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Segment raised stacked>
                <Article
                  address={address}
                  contentHash={contentHash}
                  title={title}
                  body={body}
                  version={version}
                  autoTokenRewarded={autoTokenRewarded}
                />
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Divider />
        {!picked &&
        <Button primary content='Pick to cite' onClick={() => this.context.picks.pick(address, payload)} />
        }
        {picked &&
        <Button negative content='Unpick' onClick={() => this.context.picks.unpick(address)} />
        }
        <Link route={`/articles/${address}/modify?hash=${contentHash}`}><a><Button content='Modify' /></a></Link>
      </Layout>
    );
  }
}
