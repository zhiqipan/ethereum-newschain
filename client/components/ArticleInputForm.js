import React, { Component } from 'react';
import dynamic from 'next/dynamic';
import { Button, Form, Input, Message, Divider, Icon } from 'semantic-ui-react';
import web3 from '../../ethereum/utils/web3';
import { Router, Link } from '../../routes';
import { putToSwarm } from '../../client/utils/swarm';
import { Context } from '../../client/context/context';
import factory from '../../ethereum/instances/factory';
import getArticle from '../../ethereum/instances/article';

const MarkdownEditor = process.browser ? dynamic(() => {
  return import('../../client/components/MarkdownEditor' /* webpackChunkName: 'MarkdownEditor' */);
}) : () => null;

export default class ArticleInputForm extends Component {
  static contextType = Context;
  static defaultProps = {
    mode: null, // either 'create' or 'modify'
    address: null, // modify mode only
    initialSwarmContent: {}, // modify mode only
    disabled: false,
    onTransacting: (transacting) => null,
  };

  state = {
    transacting: false,
    errorMessage: null,
  };

  init = async () => {
    const { initialSwarmContent: content } = this.props;
    if (content.authorNames) content.authorNames = content.authorNames.join(', ');
    if (content.editorNames) content.editorNames = content.editorNames.join(', ');
    this.setState({ ...content });
  };

  async componentDidMount() {
    await this.init();
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.initialSwarmContent !== this.props.initialSwarmContent) {
      await this.init();
    }
  }

  onSubmit = async event => {
    event.preventDefault();

    const { title, body, subtitle, geoLocation } = this.state;
    const authorNames = this.state.authorNames ? this.state.authorNames.split(/\s*,\s*/) : [];
    const editorNames = this.state.editorNames ? this.state.editorNames.split(/\s*,\s*/) : [];
    if (!title || !body) {
      this.setState({ errorMessage: 'Title and body cannot be empty, write down what\'s in your mind' });
      return;
    }

    if (this.props.mode !== 'create' && this.props.mode !== 'modify') {
      this.setState({ errorMessage: 'Internal error: Invalid mode (should be either create or modify)' });
      return;
    }

    this.setState({ transacting: true, errorMessage: '' });
    this.props.onTransacting(true);
    try {
      const timestamp = new Date().getTime();
      const swarmContent = { title, body, subtitle, authorNames, editorNames, geoLocation };
      if (this.props.mode === 'create') swarmContent.initialPublishTime = timestamp;
      if (this.props.mode === 'modify') swarmContent.lastModifyTime = timestamp;

      console.info('Publishing article to Swarm...');
      const hash = await putToSwarm(JSON.stringify(swarmContent));
      const account = (await web3.eth.getAccounts())[0];
      console.info('Article published to Swarm:', hash);

      let result;
      if (this.props.mode === 'create') {
        result = await factory.methods.createArticle('0x' + hash, account, Object.keys(this.context.picks.articles)).send({
          from: account,
        });
      } else if (this.props.mode === 'modify') {
        result = await getArticle(this.props.address).methods.modify('0x' + hash).send({ from: account });
      } else {
        throw new Error('Invalid mode, should be either create or modify');
      }

      console.info('Article confirmed on Ethereum:', `block #${result.blockNumber}, transaction ${result.transactionHash}`);
      this.context.picks.unpickAll();
      await Router.replaceRoute('/articles');
    } catch (e) {
      console.error(e);
      this.setState({ errorMessage: e.message });
    }
    this.setState({ transacting: false });
    this.props.onTransacting(false);
  };

  renderTextInputField({ name, label, width, placeholder, required, icon }) {
    const { transacting } = this.state;

    return (
      <Form.Field width={width} key={name} required={required}>
        <label><Icon name={icon} style={{ width: 15 }} />&nbsp;{label}</label>
        <Input
          disabled={transacting} placeholder={placeholder} value={this.state[name]}
          onChange={event => this.setState({ [name]: event.target.value })} />
      </Form.Field>
    );
  }

  render() {
    const { mode, disabled } = this.props;
    const { body, transacting, errorMessage } = this.state;
    const fields = [
      { name: 'title', label: 'Title', width: 8, icon: 'header', placeholder: '', required: true },
      { name: 'subtitle', label: 'Subtitle', width: 8, icon: 'header', placeholder: '' },
      { name: 'authorNames', label: 'Author(s)', width: 5, icon: 'group', placeholder: 'display names, separated by comma' },
      { name: 'editorNames', label: 'Editor(s)', width: 5, icon: 'group', placeholder: 'display names, separated by comma' },
      { name: 'geoLocation', label: 'Geographical Location', width: 5, icon: 'location arrow', placeholder: 'where are you?' },
    ];
    return (
      <Form error={!!errorMessage} onSubmit={this.onSubmit}>
        {fields.map(field => this.renderTextInputField(field))}
        <Form.Field required>
          <label><Icon name='file alternate' />Body</label>
          <MarkdownEditor
            placeholder='speak up, your voice matters'
            disabled={transacting}
            onChange={html => this.setState({ body: html })}
            initialHtml={body} />
        </Form.Field>
        {mode === 'create' &&
        <Button icon disabled={disabled || transacting} color='orange' loading={transacting}><Icon name='paper plane' />&nbsp;Create</Button>
        }
        {mode === 'modify' &&
        <Button icon disabled={disabled || transacting} color='orange' loading={transacting}><Icon name='pencil' />&nbsp;Modify</Button>
        }
        <Message error header='Oops...' content={errorMessage} />
      </Form>
    );
  }
}
