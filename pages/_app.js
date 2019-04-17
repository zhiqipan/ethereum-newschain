import App, { Container } from 'next/app';
import React from 'react';
import { PicksContext } from '../client/context/picks';

export default class MyApp extends App {
  pick = article => {
    this.setState(state => {
      if (state.articles.includes(article)) return {};
      else return { articles: [...state.articles, article] };
    });
  };

  unpick = article => {
    this.setState(state => ({
      articles: [...state.articles.filter(a => a !== article)],
    }));
  };

  state = {
    articles: [],
    pick: this.pick,
    unpick: this.unpick,
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
