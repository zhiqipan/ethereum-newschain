import React, { Component } from 'react';
import { makeWidthFlexible, Sankey } from 'react-vis';
import loadData from '../../visual/loadData';

const FlexibleSankey = makeWidthFlexible(Sankey);

export default class CitationVisual extends Component {
  state = {
    nodes: [],
    links: [],
  };

  async componentDidMount() {
    const { nodes, links } = await loadData();
    this.setState({ nodes, links });
  }

  render() {
    const { nodes, links } = this.state;
    return (
      <FlexibleSankey
        nodes={nodes}
        links={links}
        height={300}
      />
    );
  }
}
