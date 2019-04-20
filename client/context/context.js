import React, { Component } from 'react';

import { menuContextDefault } from './menu';
import { picksContextDefault } from './picks';

export const Context = React.createContext({ menu: menuContextDefault, picks: picksContextDefault });

export class ContextProvider extends Component {
  pick = (address, payload) => {
    this.setState(state => {
      state.picks.articles[address] = payload;
      return { picks: { ...state.picks } };
    });
  };

  unpick = address => {
    this.setState(state => {
      delete state.picks.articles[address];
      return { picks: { ...state.picks } };
    });
  };

  unpickAll = () => {
    this.setState(state => {
      state.picks.articles = {};
      return { picks: { ...state.picks } };
    });
  };

  select = menuItem => {
    this.setState(state => {
      state.menu.current = menuItem;
      return { menu: { ...state.menu } };
    });
  };

  state = {
    picks: {
      articles: {},
      pick: this.pick,
      unpick: this.unpick,
      unpickAll: this.unpickAll,
    },
    menu: {
      current: '',
      select: this.select,
    },
  };

  render() {
    return (
      <Context.Provider value={this.state}>
        {this.props.children}
      </Context.Provider>
    );
  }
}
