import React, { Component } from 'react';
import { Grid, Menu, Icon, Label } from 'semantic-ui-react';
import moment from 'moment';
import HtmlViewer from './HtmlViewer';
import { Link } from '../../routes';

export default class Article extends Component {
  static defaultProps = {
    address: '',
    contentHash: '',
    swarmContent: {},
    version: null,
    autoTokenRewarded: false,
    inverted: false,
  };

  render() {
    const { address, contentHash, swarmContent, autoTokenRewarded, inverted } = this.props;
    const { title, body, subtitle, authorNames, editorNames, geoLocation, initialPublishTime, lastModifyTime } = swarmContent;
    const version = parseInt(this.props.version);
    const { Row, Column } = Grid;
    return (
      <Grid inverted={inverted} columns='equal'>
        <Row>
          <Column>
            <h2>{title}</h2>
            {subtitle && <h3 style={{ fontSize: 16, marginTop: -8, marginLeft: 3 }}>{subtitle}</h3>}
            {!isNaN(version) &&
            <Label color={inverted ? 'grey' : 'brown'}>
              {version === 0 ? 'Initial version' : `Modified | version: ${version + 1}`}
            </Label>
            }
            {autoTokenRewarded && <Label color={inverted ? 'grey' : 'brown'}>NCT auto rewarded</Label>}
          </Column>
          <Column textAlign='right'>
            <Menu inverted={inverted} compact borderless secondary icon='labeled'>
              <Menu.Item target='_blank' href={`https://swarm-gateways.net/bzz-raw:/${contentHash}`}>
                <Icon size='large' color='grey' name='linkify' />
                Permalink
              </Menu.Item>
              <Menu.Item target='_blank' href={`https://rinkeby.etherscan.io/address/${address}`}>
                <Icon size='large' color='grey' name='ethereum' />
                Etherscan
              </Menu.Item>
              {(typeof window !== 'object' || window.location.pathname.replace(/\/$/, '') !== `/articles/${address}/history`) &&
              <Link route={`/articles/${address}/history`}>
                <a className='item'>
                  <Icon size='large' color='grey' name='history' />
                  History
                </a>
              </Link>
              }
              <Link route={`/visual/${address}?tab=streamline`}>
                <a className='item'>
                  <Icon size='large' color='grey' name='map outline' style={{ transform: 'rotate(90deg)' }} />
                  Streamline
                </a>
              </Link>
            </Menu>
          </Column>
        </Row>
        <Row>
          <Column>
            <div>
              {authorNames && authorNames.length > 0 && <Label color={inverted ? 'grey' : null}>Authored by: {authorNames.join(', ')}</Label>}
              {editorNames && editorNames.length > 0 && <Label color={inverted ? 'grey' : null}>Edited by: {editorNames.join(', ')}</Label>}
              {geoLocation && <Label color={inverted ? 'grey' : null}>From: {geoLocation}</Label>}
              {initialPublishTime && <Label>Initial published: {moment(initialPublishTime).format('YYYY-MM-DD HH:mm')}</Label>}
              {lastModifyTime && <Label>Last modified: {moment(lastModifyTime).format('YYYY-MM-DD HH:mm')}</Label>}
            </div>
          </Column>
        </Row>
        <Row>
          <Column>
            <div style={{ marginLeft: 3 }}>
              <HtmlViewer html={body} />
            </div>
          </Column>
        </Row>
      </Grid>
    );
  }
}
