import React, { Component } from 'react';
import { Button, Form, Input, Label, Message } from 'semantic-ui-react';
import { Router, Link } from '../../routes';
import web3 from '../../ethereum/utils/web3';
import getArticle from '../../ethereum/instances/article';
import getERC20 from '../../ethereum/instances/erc20';
import { tokenAddress as nctAddress } from '../../ethereum/instances/token';

export default class RewardTokenForm extends Component {
  static defaultProps = {
    address: null,
    rewardRecipient: null,
    fromNct: false,
  };

  state = {
    tokenAddress: this.props.fromNct ? nctAddress : '',
    tokenAmount: 1,
    tokenName: '',
    tokenSymbol: '',
    approvedAmount: null,
    transacting: false,
    errorMessage: null,
    showSuccessMessage: false,
  };

  async componentDidMount() {
    await this.updateERC20Name();
    await this.updateApprovedAmount();
  }

  async componentDidUpdate(prevProps, prevState) {
    if (prevProps.fromNct !== this.props.fromNct) {
      this.setState({ tokenAddress: this.props.fromNct ? nctAddress : '' });
    }

    if (prevProps.rewardRecipient !== this.props.rewardRecipient) {
      await this.updateApprovedAmount();
    }

    if (prevState.tokenAddress !== this.state.tokenAddress) {
      await this.updateERC20Name();
      await this.updateApprovedAmount();
    }
  }

  updateERC20Name = async () => {
    const { tokenAddress } = this.state;
    if (!tokenAddress || tokenAddress.length !== 42) {
      this.setState({ tokenName: '', tokenSymbol: '' });
      return;
    }

    try {
      const erc20 = getERC20(tokenAddress);
      const name = await erc20.methods.name().call();
      const symbol = await erc20.methods.symbol().call();
      this.setState({ tokenName: name, tokenSymbol: symbol });
    } catch (e) {

    }
  };

  updateApprovedAmount = async () => {
    const { tokenAddress } = this.state;
    const { rewardRecipient } = this.props;
    if (!tokenAddress || !rewardRecipient || tokenAddress.length !== 42 || rewardRecipient.length !== 42) {
      this.setState({ approvedAmount: null });
      return;
    }

    try {
      const erc20 = getERC20(tokenAddress);
      const account = (await web3.eth.getAccounts())[0];
      const approvedAmount = await erc20.methods
        .allowance(account, rewardRecipient)
        .call();
      this.setState({ approvedAmount });
    } catch (e) {

    }
  };

  confirmTransfer = async () => {
    const article = getArticle(this.props.address);
    const account = (await web3.eth.getAccounts())[0];
    await article.methods
      .rewardToken(this.state.tokenAddress, this.state.tokenAmount)
      .send({ from: account });
  };

  onSubmit = async event => {
    event.preventDefault();
    this.setState({ transacting: true, errorMessage: null });
    try {
      await this.confirmTransfer();
      this.setState({ approvedAmount: this.state.approvedAmount - this.state.tokenAmount });
      if (process.browser) {
        this.setState({ showSuccessMessage: true }, () => {
          setTimeout(() => this.setState({ showSuccessMessage: false }), 3000);
        });
      }
    } catch (e) {
      console.error(e);
      this.setState({ errorMessage: e.message });
    }
    await Router.replaceRoute(`/articles/${this.props.address}`);
    this.setState({ transacting: false });
  };

  render() {
    const { tokenAddress, tokenAmount, transacting, errorMessage, showSuccessMessage } = this.state;

    return (
      <Form error={!!errorMessage} onSubmit={this.onSubmit}>
        <Form.Field>
          <label>Token address</label>
          <Input
            disabled={this.props.fromNct}
            value={tokenAddress}
            onChange={event => this.setState({ tokenAddress: event.target.value })}
          />
          <Label color={!this.state.tokenName && !this.state.tokenSymbol ? 'red' : 'blue'} basic style={{ marginTop: 10 }}>
            {!this.state.tokenName && !this.state.tokenSymbol &&
            <span>Unrecognized token</span>
            }
            {this.state.tokenName && <span>{this.state.tokenName}</span>}
            {this.state.tokenSymbol && <Label.Detail>{this.state.tokenSymbol}</Label.Detail>}
          </Label>
        </Form.Field>
        <Form.Field>
          <label>Amount to reward</label>
          <Input
            label='token(s)'
            labelPosition='right'
            value={tokenAmount}
            onChange={event => this.setState({ tokenAmount: event.target.value })}
          />
        </Form.Field>
        <Button
          primary
          loading={transacting}
          disabled={!this.props.rewardRecipient || transacting}
          content='Reward'
        />
        <Message hidden={transacting} color='blue'>
          <Message.Header>Reminder: ERC20 Standard</Message.Header>
          <p>Please approve your transfer first according to the standard procedure</p>
          {!isNaN(parseFloat(this.state.approvedAmount)) &&
          <div>
            <p style={{ color: this.state.approvedAmount >= this.state.tokenAmount ? 'inherit' : '#db2828' }}>
              Approved amount: {this.state.approvedAmount}
            </p>
            {this.state.approvedAmount < this.state.tokenAmount &&
            <Link route={`/tokens/${tokenAddress}/approve?article=${this.props.address}`}>
              <Button secondary content='Go approve' />
            </Link>
            }
          </div>
          }
        </Message>
        <Message hidden={!transacting}>
          <Message.Header>
            Your are donating {this.state.tokenAmount} token(s)
          </Message.Header>
          <p style={{ fontFamily: 'monospace' }}>Token address: {this.state.tokenAddress}</p>
          <p style={{ fontFamily: 'monospace' }}>Final recipient: {this.props.rewardRecipient}</p>
        </Message>
        <Message error header='Oops...' content={errorMessage} />
        <Message positive hidden={!showSuccessMessage} header='Successful' content='Thank you for your support' />
      </Form>
    );
  }
}