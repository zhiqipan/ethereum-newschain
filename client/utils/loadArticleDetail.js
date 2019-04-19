import tokenAddress from '../../ethereum/config/token.address';
import getArticle from '../../ethereum/instances/article';
import { getFromSwarm } from './swarm';

function translateSummary(original) {
  const summaryMap = [
    'contentHash',
    'version',
    'creator',
    'rewardRecipient',
    'citations',
    'citedBy',
    'rewardValue',
    'rewardTimes',
    'tokenTypes',
    'autoTokenRewarded',
  ];
  const result = {};
  summaryMap.forEach((name, index) => {
    result[name] = original[index];
  });
  result.contentHash = result.contentHash.replace('0x', '');
  return result;
}

export async function loadArticleSummary(address) {
  return translateSummary(await getArticle(address).methods.getSummary().call());
}

export default async function loadArticleDetail(address) {
  const summary = translateSummary(await getArticle(address).methods.getSummary().call());
  const ncTokenReward = await getArticle(address).methods.tokenRewardValue(tokenAddress).call();
  const { title, body } = JSON.parse(await getFromSwarm(summary.contentHash));

  return { ...summary, title, body, ncTokenReward };
}
