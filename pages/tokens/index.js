import React, { Component } from 'react';
import Layout from '../../client/components/Layout';
import web3 from '../../ethereum/utils/web3';
import { tokenAddress as nctAddress } from '../../ethereum/instances/token';
import getERC20 from '../../ethereum/instances/erc20';
import { Button, Card, Form, Grid, Menu, Message, Statistic } from 'semantic-ui-react';
import TokenLabel from '../../client/components/TokenLabel';
import AddressLabel from '../../client/components/AddressLabel';

export default class TokensIndexPage extends Component {

  state = {
    account: '',
    tokenAddress: '',
    balance: '',
    name: '',
    symbol: '',
    menuActive: 'transfer',
    transferFormRecipient: '',
    transferFormAmount: 0,
    approveFormSpender: '',
    approveFormAmount: 0,
    spendFormFrom: '',
    spendFormTo: '',
    spendFormAmount: 0,
    transacting: false,
    errorMessage: '',
    showSuccessMessage: false,
  };

  reload = async () => {
    const account = (await web3.eth.getAccounts())[0];
    const balance = await getERC20(this.state.tokenAddress).methods.balanceOf(account).call();
    const name = await getERC20(this.state.tokenAddress).methods.name().call();
    const symbol = await getERC20(this.state.tokenAddress).methods.symbol().call();
    this.setState({ account, balance, name, symbol });
  };

  async componentDidMount() {
    const account = (await web3.eth.getAccounts())[0];
    const balance = await getERC20(nctAddress).methods.balanceOf(account).call();
    this.setState({ account, balance, tokenAddress: nctAddress, name: 'NewsChain Token', symbol: 'NCT' });
  }

  transfer = async () => {
    const { transferFormRecipient: to, transferFormAmount: amount, tokenAddress, account } = this.state;
    if (isNaN(parseInt(amount)) || amount <= 0) {
      return null;
    }
    this.setState({ transacting: true, errorMessage: '' });
    try {
      await getERC20(tokenAddress).methods.transfer(to, amount).send({ from: account });
      this.setState({ transferFormRecipient: '', transferFormAmount: 0 });
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
    const { approveFormSpender: spender, approveFormAmount: amount, tokenAddress, account } = this.state;
    if (isNaN(parseInt(amount)) || amount <= 0) {
      return null;
    }
    this.setState({ transacting: true, errorMessage: '' });
    try {
      await getERC20(tokenAddress).methods.approve(spender, amount).send({ from: account });
      this.setState({ approveFormSpender: '', approveFormAmount: 0 });
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
    const { spendFormFrom: from, spendFormTo: to, spendFormAmount: amount, tokenAddress, account } = this.state;
    if (isNaN(parseInt(amount)) || amount <= 0) {
      return null;
    }
    this.setState({ transacting: true, errorMessage: '' });
    try {
      await getERC20(tokenAddress).methods.transferFrom(from, to, amount).send({ from: account });
      this.setState({ spendFormFrom: '', spendFormTo: '', spendFormAmount: 0 });
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
    const { transacting, errorMessage, showSuccessMessage, transferFormRecipient, transferFormAmount } = this.state;
    return (
      <Grid>
        <Grid.Column width={6} textAlign='left'>
          <Form error={!!errorMessage} onSubmit={this.transfer}>
            <Form.Field label='Recipient address' control='input' value={transferFormRecipient}
                        onChange={event => this.setState({ transferFormRecipient: event.target.value })} />
            <Form.Field label='Token amount' control='input' type='number' min='0' value={transferFormAmount}
                        onChange={event => this.setState({ transferFormAmount: event.target.value })} />
            <Button negative floated='right' loading={transacting} disabled={transacting}>Transfer</Button>
            <Message error header='Oops...' content={errorMessage} />
            <Message positive hidden={!showSuccessMessage} header='Successful' content='Tx completed: Token transferred' />
          </Form>
        </Grid.Column>
      </Grid>
    );
  }

  renderApproveForm() {
    const { transacting, errorMessage, showSuccessMessage, approveFormSpender, approveFormAmount } = this.state;
    return (
      <Grid>
        <Grid.Column width={6} textAlign='left'>
          <Form error={!!errorMessage} onSubmit={this.approve}>
            <Form.Field label='Spender address' control='input' value={approveFormSpender}
                        onChange={event => this.setState({ approveFormSpender: event.target.value })} />
            <Form.Field label='Token amount' control='input' type='number' min='0' value={approveFormAmount}
                        onChange={event => this.setState({ approveFormAmount: event.target.value })} />
            <Button negative floated='right' loading={transacting} disabled={transacting}>Approve</Button>
            <Message error header='Oops...' content={errorMessage} />
            <Message positive hidden={!showSuccessMessage} header='Successful' content='Tx completed: Spending approved' />
          </Form>
        </Grid.Column>
      </Grid>
    );
  }

  renderSpendForm() {
    const { transacting, errorMessage, showSuccessMessage, spendFormFrom, spendFormTo, spendFormAmount } = this.state;
    return (
      <Grid>
        <Grid.Column width={6} textAlign='left'>
          <Form error={!!errorMessage} onSubmit={this.spend}>
            <Form.Field label='From address' control='input' value={spendFormFrom}
                        onChange={event => this.setState({ spendFormFrom: event.target.value })} />
            <Form.Field label='To address' control='input' value={spendFormTo}
                        onChange={event => this.setState({ spendFormTo: event.target.value })} />
            <Form.Field label='Token amount' control='input' type='number' min='0' value={spendFormAmount}
                        onChange={event => this.setState({ spendFormAmount: event.target.value })} />
            <Button secondary floated='right' loading={transacting} disabled={transacting}>Spend</Button>
            <Message error header='Oops...' content={errorMessage} />
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
