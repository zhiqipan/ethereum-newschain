import React, { Component } from 'react';
import Layout from '../../client/components/Layout';
import web3 from '../../ethereum/utils/web3';
import { tokenAddress as nctAddress } from '../../ethereum/instances/token';
import getERC20 from '../../ethereum/instances/erc20';
import { Button, Card, Form, Grid, Menu, Message, Statistic } from 'semantic-ui-react';
import TokenLabel from '../../client/components/TokenLabel';
import AddressLabel from '../../client/components/AddressLabel';
import { isValidAddress, isValidAmount } from '../../client/utils/validate';

export default class TokensIndexPage extends Component {

  state = {
    account: '',
    tokenAddress: '',
    balance: '',
    name: '',
    symbol: '',
    menuActive: 'transfer',
    transferFormRecipient: '',
    transferFormAmount: '',
    approveFormSpender: '',
    approveFormAmount: '',
    spendFormFrom: '',
    spendFormTo: '',
    spendFormAmount: '',
    transacting: false,
    warningMessage: '',
    errorMessage: '',
    showSuccessMessage: false,
  };

  reload = async () => {
    const { tokenAddress: addr } = this.state;
    if (!isValidAddress(addr)) {
      return null;
    }

    const account = (await web3.eth.getAccounts())[0];
    const balance = await getERC20(addr).methods.balanceOf(account).call();
    const name = await getERC20(addr).methods.name().call();
    const symbol = await getERC20(addr).methods.symbol().call();
    this.setState({ account, balance, name, symbol });
  };

  async componentDidMount() {
    const account = (await web3.eth.getAccounts())[0];
    const balance = await getERC20(nctAddress).methods.balanceOf(account).call();
    this.setState({ account, balance, tokenAddress: nctAddress, name: 'NewsChain Token', symbol: 'NCT' });
  }

  transfer = async () => {
    const { transferFormRecipient: to, tokenAddress, account } = this.state;
    const amount = parseInt(this.state.transferFormAmount);
    if (!isValidAmount(amount) || !isValidAddress(to) || !isValidAddress(tokenAddress)) {
      return null;
    }

    const balance = parseInt(await getERC20(tokenAddress).methods.balanceOf(account).call());
    console.log({ balance, amount }, typeof balance, typeof amount);
    if (balance < amount) {
      this.setState({ warningMessage: `Insufficient balance: ${balance} only, while you're transferring ${amount}` });
    }

    this.setState({ transacting: true, errorMessage: '', warningMessage: '' });
    try {
      await getERC20(tokenAddress).methods.transfer(to, amount).send({ from: account });
      this.setState({ transferFormRecipient: '', transferFormAmount: '' });
      if (process.browser) {
        this.setState({ showSuccessMessage: true }, () => {
          setTimeout(() => this.setState({ showSuccessMessage: false }), 3000);
        });
      }
    } catch (e) {
      console.error(e);
      this.setState({ errorMessage: e.message });
    }
    this.setState({ transacting: false });
    await this.reload();
  };

  approve = async () => {
    const { approveFormSpender: spender, tokenAddress, account } = this.state;
    const amount = parseInt(this.state.approveFormAmount);
    if (!isValidAmount(amount) || !isValidAddress(spender) || !isValidAddress(tokenAddress)) {
      return null;
    }

    const balance = parseInt(await getERC20(tokenAddress).methods.balanceOf(account).call());
    if (balance < amount) {
      this.setState({ warningMessage: `Insufficient balance: ${balance} only, while you're approving ${amount}` });
    }

    this.setState({ transacting: true, errorMessage: '', warningMessage: '' });
    try {
      await getERC20(tokenAddress).methods.approve(spender, amount).send({ from: account });
      this.setState({ approveFormSpender: '', approveFormAmount: '' });
      if (process.browser) {
        this.setState({ showSuccessMessage: true }, () => {
          setTimeout(() => this.setState({ showSuccessMessage: false }), 3000);
        });
      }
    } catch (e) {
      console.error(e);
      this.setState({ errorMessage: e.message });
    }
    this.setState({ transacting: false });
    await this.reload();
  };

  spend = async () => {
    const { spendFormFrom: from, spendFormTo: to, tokenAddress, account } = this.state;
    const amount = parseInt(this.state.spendFormAmount);
    if (!isValidAmount(amount) || !isValidAddress(from) || !isValidAddress(to) || !isValidAddress(tokenAddress)) {
      return null;
    }

    const allowance = parseInt(await getERC20(tokenAddress).methods.allowance(from, to).call());
    if (allowance < amount) {
      this.setState({ warningMessage: `Insufficient allowance: ${allowance} only, while you're spending ${amount}` });
    }

    this.setState({ transacting: true, errorMessage: '', warningMessage: '' });
    try {
      await getERC20(tokenAddress).methods.transferFrom(from, to, amount).send({ from: account });
      this.setState({ spendFormFrom: '', spendFormTo: '', spendFormAmount: '' });
      if (process.browser) {
        this.setState({ showSuccessMessage: true }, () => {
          setTimeout(() => this.setState({ showSuccessMessage: false }), 3000);
        });
      }
    } catch (e) {
      console.error(e);
      this.setState({ errorMessage: e.message });
    }
    this.setState({ transacting: false });
    await this.reload();
  };

  renderTransferForm() {
    const { transacting, errorMessage, showSuccessMessage, warningMessage, transferFormRecipient, transferFormAmount } = this.state;
    return (
      <Grid>
        <Grid.Column width={6} textAlign='left'>
          <Form error={!!errorMessage} warning={!!warningMessage} onSubmit={this.transfer}>
            <Form.Field label='Recipient address' control='input' value={transferFormRecipient}
                        onChange={event => this.setState({ transferFormRecipient: event.target.value })} />
            <Form.Field label='Token amount' control='input' type='number' min='0' value={transferFormAmount}
                        onChange={event => this.setState({ transferFormAmount: event.target.value })} />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button negative floated='right' loading={transacting} disabled={transacting}>Transfer</Button>
            </div>
            <Message error header='Oops...' content={errorMessage} />
            <Message warning header='Warning' content={warningMessage} />
            <Message positive hidden={!showSuccessMessage} header='Successful' content='Tx completed: Token transferred' />
          </Form>
        </Grid.Column>
      </Grid>
    );
  }

  renderApproveForm() {
    const { transacting, errorMessage, warningMessage, showSuccessMessage, approveFormSpender, approveFormAmount } = this.state;
    return (
      <Grid>
        <Grid.Column width={6} textAlign='left'>
          <Form error={!!errorMessage} warning={!!warningMessage} onSubmit={this.approve}>
            <Form.Field label='Spender address' control='input' value={approveFormSpender}
                        onChange={event => this.setState({ approveFormSpender: event.target.value })} />
            <Form.Field label='Token amount' control='input' type='number' min='0' value={approveFormAmount}
                        onChange={event => this.setState({ approveFormAmount: event.target.value })} />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button negative floated='right' loading={transacting} disabled={transacting}>Approve</Button>
            </div>
            <Message error header='Oops...' content={errorMessage} />
            <Message warning header='Warning' content={warningMessage} />
            <Message positive hidden={!showSuccessMessage} header='Successful' content='Tx completed: Spending approved' />
          </Form>
        </Grid.Column>
      </Grid>
    );
  }

  renderSpendForm() {
    const { transacting, errorMessage, warningMessage, showSuccessMessage, spendFormFrom, spendFormTo, spendFormAmount } = this.state;
    return (
      <Grid>
        <Grid.Column width={6} textAlign='left'>
          <Form error={!!errorMessage} warning={!!warningMessage} onSubmit={this.spend}>
            <Form.Field label='From address' control='input' value={spendFormFrom}
                        onChange={event => this.setState({ spendFormFrom: event.target.value })} />
            <Form.Field label='To address' control='input' value={spendFormTo}
                        onChange={event => this.setState({ spendFormTo: event.target.value })} />
            <Form.Field label='Token amount' control='input' type='number' min='0' value={spendFormAmount}
                        onChange={event => this.setState({ spendFormAmount: event.target.value })} />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button secondary loading={transacting} disabled={transacting}>Spend</Button>
            </div>
            <Message error header='Oops...' content={errorMessage} />
            <Message warning header='Warning' content={warningMessage} />
            <Message positive hidden={!showSuccessMessage} header='Successful' content='Tx completed: Spending confirmed' />
          </Form>
        </Grid.Column>
      </Grid>
    );
  }

  render() {
    const { account, name, symbol, tokenAddress, menuActive } = this.state;
    const isRecognizable = !!(name || symbol);
    return (
      <Layout>
        <h1>ERC20 Token Management</h1>
        <Card fluid>
          <Card.Content>
            <AddressLabel basic color='blue' icon='gem' name='Token address' address={tokenAddress} style={{ marginBottom: 10 }} />
            <br />
            {isRecognizable &&
            <AddressLabel basic color='green' icon='check' name='Verified' address={symbol + ' | ' + name} style={{ marginBottom: 10 }} />
            }
            {!isRecognizable &&
            <TokenLabel style={{ marginBottom: 10 }} />
            }
            <Grid columns='equal' textAlign='center' style={{ height: 250 }}>
              <Grid.Column style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <Statistic label='Account Balance' value={this.state.balance || 0} size='huge' />
                <AddressLabel icon='ethereum' name='Account' address={account} style={{ marginBottom: 10 }} />
              </Grid.Column>
            </Grid>
          </Card.Content>
        </Card>
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Menu tabular>
            <Menu.Item name='Transfer' active={menuActive === 'transfer'} onClick={() => this.setState({ menuActive: 'transfer' })} />
            <Menu.Item name='Approve' active={menuActive === 'approve'} onClick={() => this.setState({ menuActive: 'approve' })} />
            <Menu.Item name='Spend' active={menuActive === 'spend'} onClick={() => this.setState({ menuActive: 'spend' })} />
          </Menu>
          {menuActive === 'transfer' && this.renderTransferForm()}
          {menuActive === 'approve' && this.renderApproveForm()}
          {menuActive === 'spend' && this.renderSpendForm()}
        </div>
      </Layout>
    );
  }
}
