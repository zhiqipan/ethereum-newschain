import React, { Component } from 'react';
import { Router } from '../../routes';
import web3 from '../../ethereum/utils/web3';
import getArticle from '../../ethereum/instances/article';
import TxForm from './TxForm';

export default class RewardEtherForm extends Component {
  static defaultProps = {
    address: null,
    rewardRecipient: null,
  };

  sendReward = async ({ etherAmount }) => {
    const article = getArticle(this.props.address);
    const value = web3.utils.toWei(etherAmount.toString());
    const account = (await web3.eth.getAccounts())[0];
    await article.methods.reward().send({ from: account, value });
  };

  render() {
    const fields = [
      { name: 'etherAmount', label: 'Amount to reward', inputLabel: 'ether', labelPosition: 'right' },
    ];
    return (
      <TxForm
        width={16}
        submitButtonOptions={{ primary: true, content: 'Reward' }}
        fields={fields}
        getSuccessMessage={() => 'Thank you for your support!'}
        getTransactingMessage={() => () => (
          <div>
            <p>Your donation is sending to</p>
            <p style={{ fontFamily: 'monospace' }}>{this.props.rewardRecipient}</p>
          </div>
        )}
        transaction={this.sendReward}
        afterTransaction={() => Router.replaceRoute(`/articles/${this.props.address}`)}
      />
    );
  }
}
