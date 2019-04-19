import React, { Component } from 'react';
import { Menu } from 'semantic-ui-react';
import { Link } from '../../routes';

export default class Header extends Component {
  state = {
    active: '',
  };

  render() {
    return (
      <Menu>
        <Menu.Item href='/' style={{ color: '#f2711c' }}>NewsChain</Menu.Item>
        <Menu.Item href='/articles'>Articles</Menu.Item>
        <Menu.Item href='/tokens'>Tokens</Menu.Item>
        <Menu.Item href='/factory'>Factory</Menu.Item>
        <Menu.Item href='/visual'>Visual</Menu.Item>

        <Menu.Menu position='right'>
          <Menu.Item href='/articles/new'>+</Menu.Item>
        </Menu.Menu>
      </Menu>
    );
  }
}
