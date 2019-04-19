import { articles as fake } from './fixtures';
import factory from '../../ethereum/instances/factory';
import { loadArticleSummary } from '../utils/loadArticleDetail';

function loadFake() {
  return fake;
}

async function loadReal() {
  const articleAddresses = await factory.methods.getArticles().call();
  const promises = articleAddresses.map(address => loadArticleSummary(address).then(summary => ({ address, ...summary })));
  return await Promise.all(promises);
}

export function recompute(inputArticles) {
  const inputAddresses = inputArticles.map(a => a.address);
  const hasCommon = (array) => array.filter(addr => inputAddresses.includes(addr)).length > 0;
  const isolated = inputArticles.filter(a => !hasCommon(a.citedBy) && !hasCommon(a.citations));
  const articles = inputArticles.filter(a => hasCommon(a.citedBy) || hasCommon(a.citations));
  const articleMap = {};
  articles.forEach(a => {
    const { address } = a;
    articleMap[address] = { ...a, displayName: address.substr(2, 8) };
  });

  const nodes = Object.keys(articleMap).map(address => {
    return { name: address.substr(2, 8), address };
  });

  const links = [];

  Object.keys(articleMap).forEach((address, i) => {
    articleMap[address].citedBy.forEach(other => {
      if (articleMap[other]) {
        links.push({
          source: i,
          target: articles.map(a => a.address).indexOf(other),
          value: 10,
        });
      }
    });
  });

  return { nodes, links, articleMap, isolated };
}

export default async function loadData() {
  const articles = await loadFake();
  return recompute(articles);
}
