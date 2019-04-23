import React, { Component } from 'react';
import { Card, Icon, Label } from 'semantic-ui-react';
import moment from 'moment';
import h2p from 'html2plaintext';
import web3 from '../../ethereum/utils/web3';
import { Link } from '../../routes';

export default class ArticleAbstractCard extends Component {
  static defaultProps = {
    swarmContent: {},
    address: '',
    citations: [],
    citedBy: [],
    contentHash: '',
    rewardValue: 0,
    rewardValueEther: undefined,
    ncTokenReward: 0,
    simple: false,
    renderCornerButton: () => null,
  };

  render() {
    const { swarmContent, address, citations, citedBy, contentHash, rewardValue, ncTokenReward, simple, renderCornerButton, ...otherProps } = this.props;
    const { title, body, subtitle, authorNames, initialPublishTime, lastModifyTime } = swarmContent;
    const rewardValueEther = this.props.rewardValueEther || web3.utils.fromWei(rewardValue.toString(), 'ether');

    const timestamp = initialPublishTime || lastModifyTime;

    const authors = authorNames && authorNames.length > 0 && <span style={{ marginRight: 10 }}>Authored by: {authorNames.join(', ')}</span>;
    const time = timestamp && <span>on {moment(timestamp).format('YYYY-MM-DD')}</span>;
    const lineOne = subtitle ? <p>{subtitle}</p> : <p style={{ fontFamily: 'monospace' }}>{address}</p>;
    const lineTwo = (authors || time) ? <p>{authors}{time}</p> : <p>No record of authors and time</p>;

    return (
      <Card {...otherProps}>
        <Card.Content>
          <Card.Header>
            {title}
          </Card.Header>
          <Card.Meta>
            {lineOne}
            {lineTwo}
          </Card.Meta>
          <div>
            <div hidden={simple} style={{ margin: '10px 0' }}>
              <Label color='blue' style={{ margin: '0 3px 5px 0' }}>
                <Icon name='list' />
                {citations.length.toString()} citations
              </Label>
              <Label color='teal' style={{ margin: '0 3px 5px 0' }}>
                <Icon name='code branch' />
                <span>cited by {citedBy.length.toString()} articles</span>
              </Label>
              <Label color='yellow' style={{ margin: '0 3px 5px 0' }}>
                <Icon name='ethereum' />
                <span>{rewardValueEther.toString()} ether reward</span>
              </Label>
              <Label color='orange' style={{ margin: '0 3px 5px 0' }}>
                <Icon name='gem' />
                <span>{ncTokenReward.toString()} NCT tokens</span>
              </Label>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: 5 }}>
              <p style={{ height: 96, lineHeight: '24px', overflow: 'hidden' }}>{h2p(body)}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <Link route={`/articles/${address}`}><a>View article</a></Link>
                  <p style={{ marginTop: 10 }}><a target='_blank' href={`http://swarm-gateways.net/bzz-raw:/${contentHash}`}>Permalink</a></p>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  {renderCornerButton()}
                </div>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>
    );
  }
}
