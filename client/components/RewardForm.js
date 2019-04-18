import React, { Component } from 'react';
import { Menu } from 'semantic-ui-react';
import RewardEtherForm from './RewardEtherForm';
import RewardTokenForm from './RewardTokenForm';

export default class RewardForm extends Component {
  static defaultProps = {
    address: null,
    rewardRecipient: null,
  };

  state = {
    activeItem: 'ether',
  };

  render() {
    const { activeItem } = this.state;
    const { address, rewardRecipient } = this.props;

    return (
      <div>
        <Menu tabular>
          <Menu.Item name='Ether' active={activeItem === 'ether'} onClick={() => this.setState({ activeItem: 'ether' })} />
          <Menu.Item name='NCT' active={activeItem === 'nct'} onClick={() => this.setState({ activeItem: 'nct' })} />
          <Menu.Item name='Other tokens' active={activeItem === 'other-tokens'} onClick={() => this.setState({ activeItem: 'other-tokens' })} />
        </Menu>
        {activeItem === 'ether' &&
        <RewardEtherForm address={address} rewardRecipient={rewardRecipient} />
        }
        {activeItem !== 'ether' &&
        <RewardTokenForm address={address} rewardRecipient={rewardRecipient} fromNct={activeItem === 'nct'} />
        }
      </div>
    );
  }
}
