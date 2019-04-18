import factory from '../../ethereum/instances/factory';

function translateSummary(original) {
  const summaryMap = [
    'admin',
    'articleCount',
    'enableAutoTokenReward',
    'autoTokenRewardCitationCap',
    'autoTokenRewardAmount',
    'autoTokenRewardFrom',
  ];
  const result = {};
  summaryMap.forEach((name, index) => {
    result[name] = original[index];
  });
  return result;
}

export default async function loadFactorySummary() {
  return translateSummary(await factory.methods.getSummary().call());
}
