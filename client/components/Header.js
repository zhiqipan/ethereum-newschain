import React, { Component } from 'react';
import { Menu } from 'semantic-ui-react';
import { Link } from '../../routes';

export default class Header extends Component {
  state = {
    active: '',
  };

  render() {
    // do NOT use menu item with href (e.g. <Menu.Item href='/articles/new'>+</Menu.Item>),
    // this reloads the page and react context will be lost,
    // while link with route will handle this elegantly
    return (
      <Menu>
        <Link route='/'><a className='item' style={{ color: '#f2711c' }}>NewsChain</a></Link>
        <Link route='/articles'><a className='item'>Articles</a></Link>
        <Link route='/tokens'><a className='item'>Tokens</a></Link>
        <Link route='/factory'><a className='item'>Factory</a></Link>
        <Link route='/visual'><a className='item'>Visual</a></Link>

        <Menu.Menu position='right'>
          <Link route='/articles/new'><a className="item">+</a></Link>
        </Menu.Menu>
      </Menu>
    );
  }
}
