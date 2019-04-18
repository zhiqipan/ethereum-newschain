import React, { Component } from 'react';
import { Icon, Label } from 'semantic-ui-react';

export default class AddressLabel extends Component {
  render() {
    const { name, address, icon, style, ...otherProps } = this.props;
    return (
      <Label {...otherProps} style={{ margin: 0, ...style }}>
        <Icon name={icon} style={{ width: 11 }} /><span style={{ userSelect: 'none' }}>{name}</span>
        <Label.Detail style={{ fontFamily: 'monospace' }}>{address}</Label.Detail>
      </Label>
    );
  }
}
