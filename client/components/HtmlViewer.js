import React, { Component } from 'react';

export default class HtmlViewer extends Component {
  static defaultProps = {
    html: '',
    style: {},
  };

  render() {
    return (
      <div style={this.props.style} dangerouslySetInnerHTML={{ __html: this.props.html }} />
    );
  }
}
