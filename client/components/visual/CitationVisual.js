import React, { Component } from 'react';
import { makeWidthFlexible, Sankey } from 'react-vis';
import loadData, { recompute } from '../../visual/loadData';
import { Card, Radio, Segment } from 'semantic-ui-react';
import loadArticleDetail from '../../utils/loadArticleDetail';
import { loadArticleDetail as loadFakeDetail } from '../../visual/fixtures';
import ArticleAbstractCard from '../ArticleAbstractCard';

const FlexibleSankey = makeWidthFlexible(Sankey);

const LINK_OPACITY = 0.3;
const HOVER_LINK_OPACITY = 0.6;
const ACTIVE_LINK_OPACITY = 0.9;

export default class CitationVisual extends Component {
  state = {
    hoverLink: null,
    activeLink: null,

    nodes: [],
    links: [],
    articleMap: {},
    isolated: [],
  };

  async componentDidMount() {
    const { nodes, links, articleMap, isolated } = await loadData();
    this.setState({ nodes, links, articleMap, isolated }, () => {
      Object.keys(articleMap).forEach(async address => { // lazy load
        // const articleDetail = await loadArticleDetail(article.address);
        const articleDetail = await loadFakeDetail(address);
        this.setState(state => {
          state.articleMap[address] = { ...state.articleMap[address], ...articleDetail };
          return { articleMap: { ...state.articleMap } };
        });
      });
    });
  }

  render() {
    const { nodes, links, hoverLink, activeLink, articleMap, isolated } = this.state;

    const hoverFrom = hoverLink && hoverLink.source.address;
    const hoverTo = hoverLink && hoverLink.target.address;
    const activeFrom = activeLink && activeLink.source.address;
    const activeTo = activeLink && activeLink.target.address;

    return (
      <>
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
        <Segment style={{ height: 100 }}>
          {hoverLink &&
          <>
            <p>Article {hoverLink.source.name} is cited by {hoverLink.target.name}</p>
            <p>From: {hoverFrom}</p>
            <p>To: {hoverTo}</p>
          </>
          }
          {!hoverLink &&
          <p>Hover to see more</p>
          }
        </Segment>
        {activeLink &&
        <Card.Group itemsPerRow={2}>
          <ArticleAbstractCard {...articleMap[activeFrom]} address={activeFrom} style={{ overflowWrap: 'break-word' }} />
          <ArticleAbstractCard {...articleMap[activeTo]} address={activeTo} style={{ overflowWrap: 'break-word' }} />
        </Card.Group>
        }
        <Segment>
          {Object.keys(articleMap).map(address => {
            const article = articleMap[address];
            return (
              <div>
                <Radio key={address} label={article.displayName} style={{ padding: 10 }} checked={!article.hidden} onClick={() => {
                  this.setState(state => {
                    const map = state.articleMap;
                    map[address].hidden = !map[address].hidden;
                    const selectedArticles = Object.keys(map).filter(address => !map[address].hidden).map(address => map[address]);
                    const { nodes, links } = recompute(selectedArticles);
                    const existedAddresses = nodes.map(node => node.address);
                    Object.keys(map).forEach(address => {
                      if (!existedAddresses.includes(address)) {
                        map[address].hidden = true;
                      }
                    });
                    return { nodes, links, articleMap: { ...map }, activeLink: null }; // do not update articleMap and isolated from the result of recompute()
                  });
                }} />
                <div>

                </div>
              </div>
            );
          })}
        </Segment>
        {isolated.length > 0 &&
        <Segment>
          <h3>The following {isolated.length} articles are isolated:</h3>
          {isolated.map(a => {
            return (
              <p key={a.address}>{a.address}</p>
            );
          })}
        </Segment>
        }
      </>
    );
  }
}
