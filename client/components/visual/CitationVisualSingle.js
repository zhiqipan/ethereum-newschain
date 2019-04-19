import React, { Component } from 'react';
import { makeWidthFlexible, Sankey } from 'react-vis';
import { loadDataSingle } from '../../visual/dataProcessor';
import { Card, Icon, Segment } from 'semantic-ui-react';
import AddressLabel from '../AddressLabel';
import ArticleAbstractCard from '../ArticleAbstractCard';
import { loadArticleDetail as __loadFakeDetail } from '../../visual/fixtures';
import loadArticleDetail from '../../utils/loadArticleDetail';

const FlexibleSankey = makeWidthFlexible(Sankey);

const MOCK = true;

const LINK_OPACITY = 0.3;
const HOVER_LINK_OPACITY = 0.6;
const ACTIVE_LINK_OPACITY = 0.9;

function getColorByPos(pos) {
  let color = '#f2711c';
  if (pos === 'left') color = '#fbbd08';
  if (pos === 'right') color = '#db2828';
  return color;
}

export default class CitationVisualSingle extends Component {
  static defaultProps = {
    address: '0xA0',
    mode: 'all',
  };

  state = {
    hoverLink: null,
    activeLink: null,
    articlePopulated: null,
    nodes: [],
    links: [],
  };

  async componentDidMount() {
    const { address } = this.props;
    const { nodes, links } = await loadDataSingle(address);
    const articlePopulated = await (MOCK ? __loadFakeDetail(address, true) : loadArticleDetail(address, true));
    this.setState({ nodes, links, articlePopulated });
  }

  async componentDidUpdate(prevProps, prevState) {
    if (prevProps.mode !== this.props.mode) {
      const { address, mode } = this.props;
      const { nodes, links } = await loadDataSingle(address, { hasCitations: mode !== 'citedBy', hasCitedBy: mode !== 'citations' });
      this.setState({ nodes, links, hoverLink: null, activeLink: null, fromArticle: null, toArticle: null });
    }
  }

  renderOtherArticle(activeLink) {
    if (!activeLink) return null;
    const { articlePopulated } = this.state;
    const isCitedByOther = activeLink.source.address === this.props.address;
    const otherAddress = isCitedByOther ? activeLink.target.address : activeLink.source.address;
    const otherArticle = isCitedByOther ? articlePopulated.citedByMap[otherAddress] : articlePopulated.citationsMap[otherAddress];

    function renderArrow(pointDown) {
      const style = pointDown ? { transform: 'scaleY(-1) rotate(-90deg)' } : {};
      const name = pointDown ? 'level down alternative' : 'level up alternative';

      return (
        <Card style={{ width: 200 }}>
          <Card.Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Icon size='massive' style={style} name={name} />
          </Card.Content>
        </Card>
      );
    }

    return (
      <Card.Group itemsPerRow={2}>
        {isCitedByOther && renderArrow(true)}
        <ArticleAbstractCard {...otherArticle} address={otherAddress} style={{ overflowWrap: 'break-word', width: 'calc(100% - 256px)' }} />
        {!isCitedByOther && renderArrow(false)}
      </Card.Group>
    );
  }

  render() {
    const { nodes, links, hoverLink, activeLink, articlePopulated } = this.state;

    return (
      <div>
        <h2>Citation relationship</h2>
        <FlexibleSankey
          height={300}
          nodes={nodes.map((d) => {
            const color = getColorByPos(d.position);
            return { ...d, color };
          })}
          links={links.map((d, i) => {
            let opacity = LINK_OPACITY;
            if (hoverLink && i === hoverLink.index) opacity = HOVER_LINK_OPACITY;
            if (activeLink && i === activeLink.index) opacity = ACTIVE_LINK_OPACITY;
            let color = '#f2711c';
            if (d.target === 0) color = '#fbbd08';
            return { ...d, opacity, color };
          })}
          onLinkMouseOver={hoverLink => this.setState({ hoverLink })}
          onLinkMouseOut={() => this.setState({ hoverLink: null })}
          onLinkClick={activeLink => {
            if (this.state.activeLink && this.state.activeLink.index === activeLink.index) {
              this.setState({ activeLink: null });
            } else {
              this.setState({ activeLink });
            }
          }}
        />
        <Segment>
          <AddressLabel style={{ marginBottom: 10 }} color='black' icon='ethereum' name='Viewing' address={this.props.address} />
          <Card.Group>
            <ArticleAbstractCard {...articlePopulated} address={this.props.address} fluid />
          </Card.Group>
        </Segment>
        {activeLink && this.renderOtherArticle(activeLink)}
      </div>
    );
  }
}
