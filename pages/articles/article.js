import React, { Component } from 'react';
import { Button, Card, Divider, Grid } from 'semantic-ui-react';
import { Link } from '../../routes';
import Layout from '../../client/components/Layout';
import RewardForm from '../../client/components/RewardForm';
import web3 from '../../ethereum/utils/web3';
import getArticle from '../../ethereum/instances/article';
import { getFromSwarm } from '../../client/utils/swarm';
import { PicksContext } from '../../client/context/picks';

function translateSummary(original) {
  const summaryMap = [
    'contentHash',
    'creator',
    'rewardRecipient',
    'citations',
    'citedBy',
    'rewardValue',
    'rewardTimes',
    'tokenTypes',
  ];
  const result = {};
  summaryMap.forEach((name, index) => {
    result[name] = original[index];
  });
  result.contentHash = result.contentHash.replace('0x', '');
  return result;
}

export default class ArticleDetailPage extends Component {
  static contextType = PicksContext;

  static async getInitialProps(props) {
    const { address } = props.query;
    const summary = translateSummary(await getArticle(address).methods.getSummary().call());
    const { title, body } = JSON.parse(await getFromSwarm(summary.contentHash));

    return { address, ...summary, title, body };
  }

  renderSummary() {
    const { creator, rewardRecipient, citations, citedBy, rewardValue, rewardTimes, tokenTypes } = this.props;

    const items = [{
      header: creator,
      meta: 'Address of creator',
      description: 'This address created and published this article',
      style: { overflowWrap: 'break-word' },
    }, {
      header: rewardRecipient,
      meta: 'Address of reward recipient',
      description: 'This is the recipient of all rewards on this article',
      style: { overflowWrap: 'break-word' },
    }, {
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

    return <Card.Group itemsPerRow={3} items={items} />;
  }

  renderContent() {
    const { contentHash, title, body } = this.props;

    return (
      <div>
        <h2>{title}</h2>
        <p><a href={`https://swarm-gateways.net/bzz-raw:/${contentHash}`}>Publicly available here</a></p>
        <p>{body}</p>
      </div>
    );
  }

  render() {
    const { address, contentHash, title, body, citations, citedBy, rewardValue } = this.props;
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
              <div style={{ fontFamily: 'monospace' }}>
                <p>{address}</p>
                <p>{contentHash}</p>
              </div>
            </Grid.Column>
            <Grid.Column width={6}>
              <RewardForm address={address} />
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
              {this.renderContent()}
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
      </Layout>
    );
  }
}
