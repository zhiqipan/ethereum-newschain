import React, { Component } from 'react';
import { Card, Icon, Label } from 'semantic-ui-react';
import web3 from '../../ethereum/utils/web3';
import { Link } from '../../routes';
import HtmlViewer from './HtmlViewer';

export default class ArticleAbstractCard extends Component {
  static defaultProps = {
    title: '',
    body: '',
    address: '',
    citations: [],
    citedBy: [],
    contentHash: '',
    rewardValue: 0,
    rewardValueEther: undefined,
    ncTokenReward: 0,
    renderCornerButton: () => null,
  };

  render() {
    const { title, body, address, citations, citedBy, contentHash, rewardValue, ncTokenReward, ...otherProps } = this.props;
    const rewardValueEther = this.props.rewardValueEther || web3.utils.fromWei(rewardValue.toString(), 'ether');

    return (
      <Card {...otherProps}>
        <Card.Content>
          <Card.Header>
            {title}
          </Card.Header>
          <Card.Meta>
            {address}
          </Card.Meta>
          <div>
            <div style={{ margin: '10px 0' }}>
              <Label color='blue'>
                <Icon name='list' />
                {citations.length.toString()} citations
              </Label>
              <Label color='teal'>
                <Icon name='code branch' />
                <span>cited by {citedBy.length.toString()} articles</span>
              </Label>
              <Label color='yellow'>
                <Icon name='ethereum' />
                <span>{rewardValueEther.toString()} ether reward</span>
              </Label>
              <Label color='orange'>
                <Icon name='gem' />
                <span>{ncTokenReward.toString()} NCT tokens</span>
              </Label>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <HtmlViewer style={{ height: 96, lineHeight: '24px', overflow: 'hidden' }} html={body.replace(/<img[^>]*>/g, '')} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <Link route={`/articles/${address}`}><a>View article</a></Link>
                  <p><a target='_blank' href={`https://swarm-gateways.net/bzz-raw:/${contentHash}`}>Permalink</a></p>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  {this.props.renderCornerButton()}
                </div>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>
    );
  }
}
