import React, { Component } from 'react';
import { Button, Card, Form, Grid, Input, Menu, Message, Radio, Statistic } from 'semantic-ui-react';
import { Router } from '../../routes';
import Layout from '../../client/components/Layout';
import AddressLabel from '../../client/components/AddressLabel';
import web3 from '../../ethereum/utils/web3';
import factory, { factoryAddress } from '../../ethereum/instances/factory';
import loadFactorySummary from '../../client/utils/loadFactorySummary';
import { Context } from '../../client/context/context';
import { MenuItemEnum } from '../../client/context/menu';

export default class FactoryIndexPage extends Component {
  static contextType = Context;

  static async getInitialProps() {
    const summary = await loadFactorySummary();
    return { ...summary };
  }

  state = {
    menuActive: 'switch',
  };

  componentDidMount() {
    this.context.menu.select(MenuItemEnum.FACTORY);
  }

  renderBigStat(label, value, color) {
    return (
      <Grid.Column style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <Statistic color={color} label={label} value={value} size='huge' />
      </Grid.Column>
    );
  }

  render() {
    const { admin, articleCount, enableAutoTokenReward, autoTokenRewardCitationCap, autoTokenRewardAmount, autoTokenRewardFrom } = this.props;
    const { menuActive } = this.state;
    const rewardStatColor = enableAutoTokenReward ? 'green' : 'grey';

    return (
      <Layout>
        <h1>Factory</h1>
        <p>All the articles are constructed here! The manager has full control of how things work</p>
        <Card fluid>
          <Card.Content>
            <AddressLabel color='violet' icon='cogs' name='Factory address' address={factoryAddress} style={{ marginBottom: 10 }} />
            <br />
            <AddressLabel basic color='brown' icon='user secret' name='Managed by' address={admin} style={{ marginBottom: 10 }} />
            <br />
            <AddressLabel basic color={rewardStatColor} icon='gem' name='Reward token' address={autoTokenRewardFrom} style={{ marginBottom: 10 }} />
            <Grid columns='equal' textAlign='center' style={{ height: 250 }}>
              {this.renderBigStat('Articles constructed', articleCount, 'orange')}
              {this.renderBigStat('Citation reward', enableAutoTokenReward ? 'On' : 'Off', rewardStatColor)}
              {this.renderBigStat('Citation cap', autoTokenRewardCitationCap, rewardStatColor)}
              {this.renderBigStat('Reward amount (NCT)', autoTokenRewardAmount, rewardStatColor)}
            </Grid>
          </Card.Content>
        </Card>
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Menu tabular>
            <Menu.Item name='Reward switch' active={menuActive === 'switch'} onClick={() => this.setState({ menuActive: 'switch' })} />
            <Menu.Item name='Citation cap' active={menuActive === 'cap'} onClick={() => this.setState({ menuActive: 'cap' })} />
            <Menu.Item name='Reward amount' active={menuActive === 'amount'} onClick={() => this.setState({ menuActive: 'amount' })} />
          </Menu>
          {menuActive === 'switch' &&
          <FactoryChangeForm
            isRadio admin={admin} label='Citation reward' method='setEnableAutoTokenReward' initialValue={enableAutoTokenReward}
            description='Reward automatically grants to those whose articles are cited by others significantly.'
          />}
          {menuActive === 'cap' &&
          <FactoryChangeForm
            admin={admin} label='Citation cap' method='setAutoTokenRewardCitationCap' initialValue={autoTokenRewardCitationCap} type='number' min='0'
            description='Reward only grants to those articles meet the cap! Gain more influence and citations to claim the reward!'
          />}
          {menuActive === 'amount' &&
          <FactoryChangeForm
            admin={admin} label='Reward amount (NCT)' method='setAutoTokenRewardAmount' initialValue={autoTokenRewardAmount} type='number' min='0'
            description='The amount of tokens rewarded to each article. Note that each article can only be rewarded once.'
          />}
        </div>
      </Layout>
    );
  }
}

class FactoryChangeForm extends Component {
  state = {
    value: this.props.initialValue,
    transacting: false,
    success: '',
    warning: '',
    error: '',
  };

  render() {
    const { admin, label, description, isRadio, method, initialValue: _, ...restProps } = this.props;
    const { transacting, error, warning, success, value } = this.state;

    return (
      <Grid>
        <Grid.Column width={6} textAlign='left'>
          <Form onSubmit={async () => {
            this.setState({ transacting: true });
            try {
              const account = (await web3.eth.getAccounts())[0];
              if (account !== admin) {
                this.setState(({ warning: 'You\'re not admin, transaction might fail' }));
              }
              await factory.methods[method](value).send({ from: account });
              if (process.browser) {
                const success = true;
                this.setState({ success }, () => {
                  setTimeout(() => this.setState({ success: false }), 3000);
                });
              }
              await Router.replaceRoute('/factory');
            } catch (e) {
              console.error(e);
              this.setState(({ error: e.message }));
            }
            this.setState({ transacting: false });
          }}>
            <Form.Field>
              <label>{label}</label>
              {isRadio ?
                <Radio toggle disabled={transacting} checked={value} onChange={() => this.setState({ value: !value })} /> :
                <Input {...restProps} disabled={transacting} value={value} onChange={e => this.setState({ value: e.target.value })} />
              }
              <p>{description}</p>
            </Form.Field>
            <Button secondary disabled={transacting} loading={transacting}>Change</Button>
            <Message error header='Oops...' content={error} />
            <Message warning header='Warning' content={warning} />
            <Message positive hidden={!success} header='Change confirmed' />
          </Form>
        </Grid.Column>
      </Grid>
    );
  }
}
