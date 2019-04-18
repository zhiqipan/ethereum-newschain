import React, { Component } from 'react';
import { Grid, Menu, Icon, Label } from 'semantic-ui-react';
import HtmlViewer from './HtmlViewer';

export default class Article extends Component {
  static defaultProps = {
    address: '',
    contentHash: '',
    title: '',
    body: '',
    version: 0,
    autoTokenRewarded: false,
  };

  render() {
    const { address, contentHash, title, body, autoTokenRewarded } = this.props;
    const version = parseInt(this.props.version);
    const { Row, Column } = Grid;
    return (
      <Grid columns='equal'>
        <Row>
          <Column>
            <h2>{title}</h2>
            <Label color='brown'>{version === 0 ? 'Initial version' : `Modified | version: ${version + 1}`}</Label>
            {autoTokenRewarded && <Label color='pink'>NCT auto rewarded</Label>}
          </Column>
          <Column textAlign='right'>
            <Menu compact borderless secondary icon='labeled'>
              <Menu.Item target='_blank' href={`https://swarm-gateways.net/bzz-raw:/${contentHash}`}>
                <Icon size='large' color='grey' name='linkify' />
                Permalink
              </Menu.Item>
              <Menu.Item target='_blank' href={`https://rinkeby.etherscan.io/address/${address}`}>
                <Icon size='large' color='grey' name='ethereum' />
                Etherscan
              </Menu.Item>
              {(typeof window !== 'object' || window.location.pathname.replace(/\/$/, '') !== `/articles/${address}/history`) &&
              <Menu.Item href={`/articles/${address}/history`}>
                <Icon size='large' color='grey' name='history' />
                History
              </Menu.Item>
              }
            </Menu>
          </Column>
        </Row>
        <Row>
          <Column>
            <HtmlViewer html={body} />
          </Column>
        </Row>
      </Grid>
    );
  }
}
