import React, { Component } from 'react';
import { makeWidthFlexible, Sankey } from 'react-vis';
import loadData, { recompute } from '../../visual/loadData';
import { Radio } from 'semantic-ui-react';

const FlexibleSankey = makeWidthFlexible(Sankey);

const BLURRED_LINK_OPACITY = 0.3;
const FOCUSED_LINK_OPACITY = 0.6;

export default class CitationVisual extends Component {
  state = {
    activeLink: null,
    nodes: [],
    links: [],
    articles: [],
    articleMap: {},
  };

  async componentDidMount() {
    const { nodes, links, articles, articleMap } = await loadData();
    this.setState({ nodes, links, articles, articleMap });
  }

  render() {
    const { nodes, links, activeLink, articles, articleMap } = this.state;

    const from = activeLink && nodes[activeLink.source.index].name;
    const to = activeLink && nodes[activeLink.target.index].name;

    return (
      <>
        <h2>Citation relationship</h2>
        <FlexibleSankey
          height={300}
          nodes={nodes}
          links={links.map((d, i) => ({
            ...d,
            opacity: activeLink && i === activeLink.index ? FOCUSED_LINK_OPACITY : BLURRED_LINK_OPACITY,
          }))}
          onLinkMouseOver={node => this.setState({ activeLink: node })}
          onLinkMouseOut={() => {
            this.setState({ activeLink: null });
          }}
        />
        <div>
          {articles.map((a, index) => {
            return (
              <Radio key={a.address} label={a.address} style={{ display: 'block' }} checked={!a.hidden} onClick={() => {
                this.setState(state => {
                  state.articles[index].hidden = !state.articles[index].hidden;
                  const { nodes, links, articleMap } = recompute(state.articles.filter(a => !a.hidden));
                  return { nodes, links, articleMap, articles: [...state.articles] };
                });
              }} />
            );
          })}
        </div>
        <div style={{ height: 150 }}>
          {activeLink &&
          <div>
            <p>Article {from} references to {to}</p>
          </div>
          }
        </div>
      </>
    );
  }
}
