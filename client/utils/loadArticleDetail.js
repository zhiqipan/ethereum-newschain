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

export default async function loadArticleDetail(address, populate = false) {
  const summary = translateSummary(await getArticle(address).methods.getSummary().call());
  const ncTokenReward = await getArticle(address).methods.tokenRewardValue(tokenAddress).call();
  const { title, body } = JSON.parse(await getFromSwarm(summary.contentHash));

  const result = { ...summary, title, body, ncTokenReward };

  if (populate) {
    const citationsMap = {};
    const citedByMap = {};
    await Promise.all(summary.citations.map(address => {
      return loadArticleDetail(address).then(detail => citationsMap[address] = detail);
    }));
    await Promise.all(summary.citedBy.map(address => {
      return loadArticleDetail(address).then(detail => citedByMap[address] = detail);
    }));
    result.citationsMap = citationsMap;
    result.citedByMap = citedByMap;
  }

  return result;
}
