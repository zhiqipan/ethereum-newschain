import React, { Component } from 'react';
import { Button, Card, Divider, Grid, Icon, Label, Menu, Segment } from 'semantic-ui-react';
import { Link } from '../../routes';
import Layout from '../../client/components/Layout';
import RewardForm from '../../client/components/RewardForm';
import web3 from '../../ethereum/utils/web3';
import { PicksContext } from '../../client/context/picks';
import loadArticleDetail from '../../client/utils/loadArticleDetail';
import Article from '../../client/components/Article';

export default class ArticleDetailPage extends Component {
  static contextType = PicksContext;

  static async getInitialProps(props) {
    const { address } = props.query;
    const detail = await loadArticleDetail(address);

    return { address, ...detail };
  }

  renderSummary() {
    const { citations, citedBy, rewardValue, rewardTimes, tokenTypes } = this.props;

    const items = [{
      header: `Refers to ${citations.length} article(s)`,
      meta: 'Number of citations of this article',
      description: 'How many other articles the author refers to / gets inspiration from',
    }, {
      header: `Cited by ${citedBy.length} article(s)`,
      meta: 'The influence of this article',
      description: 'The more other articles cite this article, the more influential this article is',
    }, {
      header: `${web3.utils.fromWei(rewardValue.toString(), 'ether')} ether in ${rewardTimes} time(s)`,
      meta: 'Reward gained',
      description: `This article has been rewarded by ether`,
    }, {
      header: `${tokenTypes.length} type(s) of tokens`,
      meta: 'Tokens gained',
      description: `This article has been rewarded by tokens`,
    }];

    return <Card.Group itemsPerRow={4} items={items} />;
  }

  render() {
    const { address, contentHash, title, body, citations, citedBy, rewardValue, version, creator, rewardRecipient } = this.props;
    const picked = this.context.articles[address];
    const payload = {
      contentHash,
      title,
      body,
      citations,
      citedBy,
      rewardValueEther: web3.utils.fromWei(rewardValue.toString(), 'ether'),
    };

    return (
      <Layout>
        <Grid>
          <Grid.Row>
            <Grid.Column width={10}>
              <h1>Article</h1>
              <div>
                <Label style={{ margin: 0, marginBottom: 10 }}>
                  <Icon name='copyright' style={{ width: 11 }} />Creator address
                  <Label.Detail style={{ fontFamily: 'monospace' }}>{creator}</Label.Detail>
                </Label>
                <Label style={{ margin: 0, marginBottom: 10 }}>
                  <Icon name='ethereum' style={{ width: 11 }} />Contract address
                  <Label.Detail style={{ fontFamily: 'monospace' }}>{address}</Label.Detail>
                </Label>
                <Label style={{ margin: 0, marginBottom: 10 }}>
                  <Icon name='slack hash' style={{ width: 11 }} />Swarm hash
                  <Label.Detail style={{ fontFamily: 'monospace' }}>{contentHash}</Label.Detail>
                </Label>
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
                />
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Divider />
        {!picked &&
        <Button primary content='Pick to cite' onClick={() => this.context.pick(address, payload)} />
        }
        {picked &&
        <Button negative content='Unpick' onClick={() => this.context.unpick(address)} />
        }
        <Link route={`/articles/${address}/modify?hash=${contentHash}`}><Button content='Modify' /></Link>
      </Layout>
    );
  }
}
