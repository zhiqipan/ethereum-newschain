import React, { Component } from 'react';
import { makeWidthFlexible, Sankey } from 'react-vis';
import { loadDataSingle } from '../../visual/dataProcessor';
import { Card, Segment } from 'semantic-ui-react';
import AddressLabel from '../AddressLabel';
import ArticleAbstractCard from '../ArticleAbstractCard';
import { loadArticleDetail as __loadFakeDetail, loadArticleDetail as loadFakeDetail } from '../../visual/fixtures';
import loadArticleDetail from '../../utils/loadArticleDetail';

const FlexibleSankey = makeWidthFlexible(Sankey);

const MOCK = true;

const LINK_OPACITY = 0.3;
const HOVER_LINK_OPACITY = 0.6;
const ACTIVE_LINK_OPACITY = 0.9;

export default class CitationVisualSingle extends Component {
  static defaultProps = {
    address: '0xA0',
  };

  state = {
    hoverLink: null,
    activeLink: null,
    nodes: [],
    links: [],
    fromArticle: null,
    toArticle: null,
  };

  async componentDidMount() {
    const { nodes, links } = await loadDataSingle(this.props.address);
    this.setState({ nodes, links });
  }

  async componentDidUpdate(prevProps, prevState) {
    if (prevState.activeLink !== this.state.activeLink) {
      if (this.state.activeLink) {
        const fromArticle = await (MOCK ? __loadFakeDetail() : loadArticleDetail(this.state.activeLink.source));
        const toArticle = await (MOCK ? __loadFakeDetail() : loadArticleDetail(this.state.activeLink.target));
        this.setState({ fromArticle, toArticle });
      } else {
        this.setState({ fromArticle: null, toArticle: null });
      }
    }
  }

  render() {
    const { nodes, links, hoverLink, activeLink, fromArticle, toArticle } = this.state;

    const hoverFrom = hoverLink && hoverLink.source.address;
    const hoverTo = hoverLink && hoverLink.target.address;
    const activeFrom = activeLink && activeLink.source.address;
    const activeTo = activeLink && activeLink.target.address;

    return (
      <div>
        <h2>Citation relationship</h2>
        <FlexibleSankey
          height={300}
          nodes={nodes}
          links={links.map((d, i) => {
            let opacity = LINK_OPACITY;
            if (hoverLink && i === hoverLink.index) opacity = HOVER_LINK_OPACITY;
            if (activeLink && i === activeLink.index) opacity = ACTIVE_LINK_OPACITY;
            return { ...d, opacity };
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
        <Segment style={{ height: 95 }}>
          {hoverLink &&
          <>
            <div style={{ marginBottom: 10 }}>
              <AddressLabel color='brown' icon='ethereum' name='original' basic address={hoverFrom} />&nbsp;&nbsp;
              {/*<b>{articleMap[hoverFrom].title}</b>*/}
            </div>
            <div>
              <AddressLabel color='orange' icon='ethereum' name='derived' basic address={hoverTo} />&nbsp;&nbsp;
              {/*<b>{articleMap[hoverFrom].title}</b>*/}
            </div>
          </>
          }
          {!hoverLink &&
          <h3 style={{ color: 'gray' }}>Hover to see more</h3>
          }
        </Segment>
        {activeLink &&
        <Card.Group itemsPerRow={2}>
          {fromArticle ? <ArticleAbstractCard {...fromArticle} address={activeFrom} style={{ overflowWrap: 'break-word' }} /> : <Card />}
          {toArticle ? <ArticleAbstractCard {...toArticle} address={activeTo} style={{ overflowWrap: 'break-word' }} /> : <Card />}
        </Card.Group>
        }
      </div>
    );
  }
}
