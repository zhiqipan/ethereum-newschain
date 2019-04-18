import React, { Component } from 'react';
import { Label } from 'semantic-ui-react';
import AddressLabel from './AddressLabel';

export default class TokenLabel extends Component {
  render() {
    const { name, symbol, style } = this.props;
    const isRecognizable = !!(name && symbol);
    if (!isRecognizable) {
      return (
        <Label color='red' basic style={style}>
          <span>Unrecognized token</span>
        </Label>
      );
    }

    const displayName = (name && symbol) ? (symbol + ' | ' + name) : (symbol || name);
    return <AddressLabel basic color='green' icon='check' name='Verified' address={displayName} style={style} />;
  }
}
