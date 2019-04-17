import React, { Component } from 'react';
import { Grid, Menu, Icon, Label } from 'semantic-ui-react';

export default class Article extends Component {
  static defaultProps = {
    address: '',
    contentHash: '',
    title: '',
    body: '',
    version: 0,
  };

  render() {
    const { address, contentHash, title, body } = this.props;
    const version = parseInt(this.props.version);
    const { Row, Column } = Grid;
    return (
      <Grid columns='equal'>
        <Row>
          <Column>
            <h2>{title}</h2>
            <Label color='purple'>{version === 0 ? 'Initial version' : `Modified | Version: ${version + 1}`}</Label>
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
        <Row><Column>{body}</Column></Row>
      </Grid>
    );
  }
}
