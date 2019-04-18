import React, { Component } from 'react';
import { Label } from 'semantic-ui-react';

export default class TokenLabel extends Component {
  render() {
    const { name, symbol, style } = this.props;
    return (
      <Label color={!name && !symbol ? 'red' : 'blue'} basic style={style}>
        {!name && !symbol &&
        <span>Unrecognized token</span>
        }
        {symbol && <span>{symbol}</span>}
        {name && <Label.Detail>{name}</Label.Detail>}
      </Label>
    );
  }
}
