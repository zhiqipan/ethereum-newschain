import React, { Component } from 'react';
import { Menu } from 'semantic-ui-react';
import { Link } from '../../routes';
import { Context } from '../context/context';
import { MenuItemEnum } from '../context/menu';

export default class Header extends Component {
  static contextType = Context;

  state = {
    menuActive: this.context.menu.current,
  };

  getClassName = (item) => {
    if (item === this.state.menuActive) return 'item active';
    return 'item';
  };

  componentDidUpdate(prevProps, prevState, prevContext) {
    if (this.context && this.context.menu && this.context.menu.current) {
      if (this.context.menu.current !== this.state.menuActive) {
        this.setState({ menuActive: this.context.menu.current });
      }
    }
  }

  render() {
    // do NOT use menu item with href (e.g. <Menu.Item href='/articles/new'>+</Menu.Item>),
    // this reloads the page and react context will be lost,
    // while link with route will handle this elegantly
    return (
      <Menu>
        <Link route='/'><a className={this.getClassName(MenuItemEnum.HOME)} style={{ color: '#f2711c' }}>NewsChain</a></Link>
        <Link route='/articles'><a className={this.getClassName(MenuItemEnum.ARTICLES)}>Articles</a></Link>
        <Link route='/tokens'><a className={this.getClassName(MenuItemEnum.TOKENS)}>Tokens</a></Link>
        <Link route='/factory'><a className={this.getClassName(MenuItemEnum.FACTORY)}>Factory</a></Link>
        <Link route='/visual'><a className={this.getClassName(MenuItemEnum.VISUAL)}>Visual</a></Link>

        <Menu.Menu position='right'>
          <Link route='/articles/new'><a className="item">+</a></Link>
        </Menu.Menu>
      </Menu>
    );
  }
}
