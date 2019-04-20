import React, { Component } from 'react';
import { Card, Divider, Icon } from 'semantic-ui-react';
import Layout from '../../client/components/Layout';
import { Router, Link } from '../../routes';
import { Context } from '../../client/context/context';
import ArticleAbstractCard from '../../client/components/ArticleAbstractCard';
import { MenuItemEnum } from '../../client/context/menu';
import ArticleInputForm from '../../client/components/ArticleInputForm';

export default class ArticleNewPage extends Component {
  static contextType = Context;

  state = {
    transacting: false,
  };

  componentDidMount() {
    this.context.menu.select(MenuItemEnum.ARTICLES);
  }

  renderPickedArticles() {
    const { articles } = this.context.picks;

    if (Object.keys(articles).length === 0) return <p>No articles yet</p>;

    return (
      <Card.Group itemsPerRow={2}>
        {Object.keys(articles).map(addr => {
          return (
            <ArticleAbstractCard
              {...articles[addr]}
              key={addr}
              address={addr}
              fluid={false}
              style={{ overflowWrap: 'break-word' }}
              renderCornerButton={() => {
                return (
                  <a style={this.state.transacting ? { color: 'lightgray', cursor: 'default' } : {}}
                     onClick={() => !this.state.transacting && this.context.picks.unpick(addr)}>Unpick</a>
                );
              }}
            />
          );
        })}
      </Card.Group>
    );
  }

  render() {
    return (
      <Layout>
        <h1>Publish an article</h1>
        <ArticleInputForm mode='create' onTransacting={(transacting) => this.setState({ transacting })} />
        <Divider />
        <h3><Icon name='quote left' />Citations / references:</h3>
        {this.renderPickedArticles()}
      </Layout>
    );
  }
}
