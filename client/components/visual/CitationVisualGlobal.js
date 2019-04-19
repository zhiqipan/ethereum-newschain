import React, { Component } from 'react';
import { makeWidthFlexible, Sankey } from 'react-vis';
import { loadDataGlobal, recomputeGlobal } from '../../visual/dataProcessor';
import { Button, Card, Radio, Segment } from 'semantic-ui-react';
import loadArticleDetail from '../../utils/loadArticleDetail';
import { loadArticleDetail as __loadFakeDetail } from '../../visual/fixtures';
import ArticleAbstractCard from '../ArticleAbstractCard';
import AddressLabel from '../AddressLabel';

const FlexibleSankey = makeWidthFlexible(Sankey);

const MOCK = false;

const LINK_OPACITY = 0.3;
const HOVER_LINK_OPACITY = 0.6;
const ACTIVE_LINK_OPACITY = 0.9;

export default class CitationVisualGlobal extends Component {
  state = {
    hoverLink: null,
    activeLink: null,

    nodes: [],
    links: [],
    articleMap: {},
    isolated: [],
  };

  async componentDidMount() {
    const { nodes, links, articleMap, isolated } = await loadDataGlobal();
    this.setState({ nodes, links, articleMap, isolated }, () => {
      Object.keys(articleMap).forEach(async address => { // lazy load
        // const articleDetail = await loadArticleDetail(article.address);
        const articleDetail = await (MOCK ? __loadFakeDetail() : loadArticleDetail(address));
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
              <AddressLabel color='brown' icon='ethereum' name='Original' basic address={hoverFrom} />&nbsp;&nbsp;
              <b>{articleMap[hoverFrom].title}</b>
            </div>
            <div>
              <AddressLabel color='orange' icon='ethereum' name='Derived' basic address={hoverTo} />&nbsp;&nbsp;
              <b>{articleMap[hoverFrom].title}</b>
            </div>
          </>
          }
          {!hoverLink &&
          <h3 style={{ color: 'gray' }}>Hover to see more</h3>
          }
        </Segment>
        {activeLink &&
        <Card.Group itemsPerRow={2}>
          <ArticleAbstractCard {...articleMap[activeFrom]} address={activeFrom} style={{ overflowWrap: 'break-word' }} />
          <ArticleAbstractCard {...articleMap[activeTo]} address={activeTo} style={{ overflowWrap: 'break-word' }} />
        </Card.Group>
        }
        <Segment>
          <div style={{ display: 'grid', gridTemplateColumns: '33% 33% 33%' }}>
            {Object.keys(articleMap).map(address => {
              const article = articleMap[address];
              const activeButton = activeFrom === address || activeTo === address;
              const greyButton = article.isolated;
              return (
                <div style={{ marginBottom: 15, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  <Button color={activeButton && 'orange'} basic={!activeButton} compact size='small'
                          inverted={greyButton} onClick={() => {
                    this.setState(state => {
                      const map = state.articleMap;
                      map[address].hidden = !map[address].hidden;
                      const selectedArticles = Object.keys(map).filter(address => !map[address].hidden).map(address => map[address]);
                      const { nodes, links } = recomputeGlobal(selectedArticles);
                      const existedAddresses = nodes.map(node => node.address);
                      Object.keys(map).forEach(address => {
                        if (!existedAddresses.includes(address)) {
                          map[address].isolated = true;
                        } else {
                          map[address].isolated = false;
                        }
                      });
                      // do not update articleMap and isolated from the result of recompute()
                      return { nodes, links, articleMap: { ...map }, activeLink: null };
                    });
                  }}>
                    <Radio key={address} checked={!article.hidden} label={article.displayName} />
                  </Button>
                  <span style={{
                    display: 'inline-block',
                    fontSize: 15,
                    lineHeight: '15px',
                    height: 15,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    marginLeft: 5,
                    width: 'calc(100% - 150px)',
                  }}>{article.title}</span>
                  <div style={{ color: 'gray', overflow: 'hidden', whiteSpace: 'nowrap', marginRight: 10, marginTop: 5 }}>
                    <p style={{
                      fontSize: 13,
                      lineHeight: '13px',
                      height: 13,
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}>{article.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Segment>
        {isolated.length > 0 &&
        <Segment>
          <h3>The following {isolated.length} articles are completely isolated:</h3>
          {isolated.map(a => {
            return (
              <p key={a.address}>{a.address}</p>
            );
          })}
        </Segment>
        }
      </div>
    );
  }
}
