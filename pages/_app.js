import App, { Container } from 'next/app';
import React from 'react';
import { ContextProvider } from '../client/context/context';

export default class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <Container>
        <ContextProvider>
          <Component {...pageProps} />
        </ContextProvider>
      </Container>
    );
  }
}
