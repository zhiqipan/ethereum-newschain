import React, { Component } from 'react';
import Layout from '../../client/components/Layout';
import web3 from '../../ethereum/utils/web3';
import { tokenAddress as nctAddress } from '../../ethereum/instances/token';
import getERC20 from '../../ethereum/instances/erc20';
import { Button, Card, Form, Grid, Menu, Message, Statistic } from 'semantic-ui-react';
import TokenLabel from '../../client/components/TokenLabel';
import AddressLabel from '../../client/components/AddressLabel';
import { isValidAddress, isValidAmount } from '../../client/utils/validate';
import TxForm from '../../client/components/TxForm';

export default class TokensIndexPage extends Component {

  state = {
    account: '',
    tokenAddress: '',
    balance: '',
    name: '',
    symbol: '',
    menuActive: 'transfer',
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

  transfer = async ({ to, amount }) => {
    const { tokenAddress, account } = this.state;
    return await getERC20(tokenAddress).methods.transfer(to, parseInt(amount)).send({ from: account });
  };

  approve = async ({ spender, amount }) => {
    const { tokenAddress, account } = this.state;
    return await getERC20(tokenAddress).methods.approve(spender, parseInt(amount)).send({ from: account });
  };

  spend = async ({ from, to, amount }) => {
    const { tokenAddress, account } = this.state;
    return await getERC20(tokenAddress).methods.transferFrom(from, to, amount).send({ from: account });
  };

  renderTransferForm() {
    const { tokenAddress, account } = this.state;
    const fields = [
      { name: 'to', label: 'Recipient address', validate: 'address' },
      { name: 'amount', label: 'Token amount', validate: 'token-amount', type: 'number', min: '0' },
    ];
    return (
      <TxForm
        submitButtonOptions={{ negative: true, content: 'Transfer' }}
        fields={fields}
        getWarningMessage={async ({ amount }) => {
          const balance = parseInt(await getERC20(tokenAddress).methods.balanceOf(account).call());
          if (balance < parseInt(amount)) {
            return `Insufficient balance: ${balance.toString()} only, while you're transferring ${amount.toString()}`;
          }
        }}
        getSuccessMessage={() => 'Tx completed: Token transferred'}
        transaction={this.transfer}
        afterTransaction={this.reload}
      />
    );
  }

  renderApproveForm() {
    const { tokenAddress, account } = this.state;
    const fields = [
      { name: 'spender', label: 'Spender address', validate: 'address' },
      { name: 'amount', label: 'Token amount', validate: 'token-amount', type: 'number', min: '0' },
    ];
    return (
      <TxForm
        submitButtonOptions={{ negative: true, content: 'Approve' }}
        fields={fields}
        getWarningMessage={async ({ amount }) => {
          const balance = parseInt(await getERC20(tokenAddress).methods.balanceOf(account).call());
          if (balance < parseInt(amount)) {
            return `Insufficient balance: ${balance.toString()} only, while you're approving ${amount.toString()}`;
          }
        }}
        getSuccessMessage={() => 'Tx completed: Spending approved'}
        transaction={this.approve}
        afterTransaction={this.reload}
      />
    );
  }

  renderSpendForm() {
    const { tokenAddress } = this.state;
    const fields = [
      { name: 'from', label: 'From address', validate: 'address' },
      { name: 'to', label: 'To address', validate: 'address' },
      { name: 'amount', label: 'Token amount', validate: 'token-amount', type: 'number', min: '0' },
    ];
    return (
      <TxForm
        submitButtonOptions={{ secondary: true, content: 'Spend' }}
        fields={fields}
        getWarningMessage={async ({ from, to, amount }) => {
          const allowance = parseInt(await getERC20(tokenAddress).methods.allowance(from, to).call());
          if (allowance < amount) {
            return `Insufficient allowance: ${allowance} only, while you're spending ${amount}`;
          }
        }}
        getSuccessMessage={() => 'Tx completed: Spending confirmed'}
        transaction={this.spend}
        afterTransaction={this.reload}
      />
    );
  }

  render() {
    const { account, name, symbol, tokenAddress, menuActive } = this.state;
    return (
      <Layout>
        <h1>ERC20 Token Management</h1>
        <Card fluid>
          <Card.Content>
            <AddressLabel basic color='blue' icon='gem' name='Token address' address={tokenAddress} style={{ marginBottom: 10 }} />
            <br />
            <TokenLabel symbol={symbol} name={name} style={{ marginBottom: 10 }} />
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
