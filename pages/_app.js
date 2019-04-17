import App, { Container } from 'next/app';
import React from 'react';
import { PicksContext } from '../client/context/picks';

export default class MyApp extends App {
  pick = (address, payload) => {
    this.setState(state => {
      state.articles[address] = payload;
      return { articles: { ...state.articles } };
    });
  };

  unpick = address => {
    this.setState(state => {
      delete state.articles[address];
      return { articles: { ...state.articles } };
    });
  };

  unpickAll = () => {
    this.setState(state => {
      return { articles: {} };
    });
  };

  state = {
    articles: {},
    pick: this.pick,
    unpick: this.unpick,
    unpickAll: this.unpickAll,
  };

  render() {
    const { Component, pageProps } = this.props;
    return (
      <Container>
        <PicksContext.Provider value={this.state}>
          <Component {...pageProps} />
        </PicksContext.Provider>
      </Container>
    );
  }
}
