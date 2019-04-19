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
    articles: [],
    articleMap: {},
    isolated: [],
  };

  async componentDidMount() {
    const { nodes, links, articles, articleMap, isolated } = await loadData();
    articles.forEach(async article => { // lazy load
      // const articleDetail = await loadArticleDetail(article.address);
      const articleDetail = await loadFakeDetail(article.address);
      this.setState(state => {
        state.articleMap[article.address] = { ...state.articleMap[article.address], ...articleDetail };
        return { articleMap: { ...state.articleMap } };
      });
    });
    this.setState({ nodes, links, articles, articleMap, isolated });
  }

  render() {
    const { nodes, links, hoverLink, activeLink, articles, articleMap, isolated } = this.state;

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
          onLinkClick={activeLink => this.setState({ activeLink })}
        />
        <div>
          {articles.map((a, index) => {
            return (
              <Radio key={a.address} label={a.address} style={{ display: 'block' }} checked={!a.hidden} onClick={() => {
                this.setState(state => {
                  state.articles[index].hidden = !state.articles[index].hidden;
                  const { nodes, links } = recompute(state.articles.filter(a => !a.hidden));
                  return { nodes, links, articles: [...state.articles] }; // do not update articleMap and isolated
                });
              }} />
            );
          })}
        </div>
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
      </>
    );
  }
}
