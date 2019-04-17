import React, { Component } from 'react';
import { Menu } from 'semantic-ui-react';
import { Link } from '../routes';

export default class Header extends Component {
  render() {
    return (
      <Menu style={{ marginTop: 10 }}>
        <Link route='/'>
          <a className='item'>NewsChain</a>
        </Link>

        <Menu.Menu position='right'>
          <Link route='/'>
            <a className='item'>Articles</a>
          </Link>
          <Link route='/articles/new'>
            <a className='item'>+</a>
          </Link>
        </Menu.Menu>
      </Menu>
    );
  }
}
