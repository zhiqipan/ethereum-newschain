import React, { Component } from 'react';
import { loadArticleDetail as __loadFakeDetail } from '../../client/visual/fixtures';
import loadArticleDetail from '../../client/utils/loadArticleDetail';
import { Button, Card, Divider, Header, Icon, Loader, Menu, Radio, Segment } from 'semantic-ui-react';
import Article from '../../client/components/Article';
import ArticleAbstractCard from '../../client/components/ArticleAbstractCard';

// todo: set env var: https://jaketrent.com/post/environment-variables-in-nextjs
const MOCK = true;

export default class VisualSingleStreamlinePage extends Component {
  state = {
    itemsPerRow: 1,
    simplified: true,
    inverted: true,
    articlePopulated: null,
  };

  async componentDidMount() {
    const { address } = this.props;
    const articlePopulated = await (MOCK ? __loadFakeDetail(address, true) : loadArticleDetail(address, true));
    this.setState({ articlePopulated });
  }

  renderControlPanel() {
    const { itemsPerRow } = this.state;
    const itemsPerRowRadio = (n) => (
      <Button basic compact onClick={() => this.setState({ itemsPerRow: n })}><Radio label={n} checked={parseInt(itemsPerRow) === n} /></Button>
    );
    const flagRadios = (name, labelTrue, labelFalse) => (
      <>
        <Button basic compact onClick={() => this.setState({ [name]: true })}><Radio label={labelTrue} checked={!!this.state[name]} /></Button>
        <Button basic compact onClick={() => this.setState({ [name]: false })}><Radio label={labelFalse} checked={!this.state[name]} /></Button>
      </>
    );
    return (
      <Card.Group itemsPerRow={1}>
        <Card>
          <Card.Content>
            <h3 style={{ display: 'inline-block', marginRight: 20 }}>
              Articles per row
            </h3>
            {itemsPerRowRadio(1)}
            {itemsPerRowRadio(2)}
            {itemsPerRowRadio(3)}
          </Card.Content>
          <Card.Content>
            <h3 style={{ display: 'inline-block', marginRight: 20 }}>
              Color mode of main article
            </h3>
            {flagRadios('inverted', 'Dark', 'Light')}
          </Card.Content>
          <Card.Content>
            <h3 style={{ display: 'inline-block', marginRight: 20 }}>
              Minimalism
            </h3>
            {flagRadios('simplified', 'Minimal', 'Normal')}
          </Card.Content>
        </Card>
      </Card.Group>
    );
  }

  render() {
    const { articlePopulated, itemsPerRow, inverted, simplified } = this.state;
    if (!articlePopulated) return <Loader />;

    const { citedByMap, citationsMap } = articlePopulated;
    return (
      <div>
        {this.renderControlPanel()}
        <Divider horizontal style={{ marginTop: 30 }}>
          <Header as='h4'>
            <Icon name='map outline' style={{ transform: 'rotate(90deg)' }} />
            Article Streamline
          </Header>
        </Divider>
        <Card.Group itemsPerRow={itemsPerRow}>
          {Object.keys(citationsMap).map(address => {
            return <ArticleAbstractCard simple={simplified} key={address} {...citationsMap[address]} />;
          })}
        </Card.Group>
        <Segment inverted={inverted} raised stacked>
          <Article {...articlePopulated} inverted={inverted} />
        </Segment>
        <Card.Group itemsPerRow={itemsPerRow}>
          {Object.keys(citedByMap).map(address => {
            return <ArticleAbstractCard simple={simplified} key={address} {...citedByMap[address]} />;
          })}
        </Card.Group>
      </div>
    );
  }
}
