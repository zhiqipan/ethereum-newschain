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
  articles.forEach((a, index) => {
    articleMap[a.address] = { ...a, index };
  });

  const nodes = articles.map(a => {
    return { name: a.address, address: a.address };
  });

  const links = [];

  articles.forEach((a, i) => {
    a.citedBy.forEach(other => {
      if (articleMap[other]) {
        links.push({
          source: i,
          target: articleMap[other].index,
          value: 10,
        });
      }
    });
  });

  return { nodes, links, articles, articleMap, isolated };
}

export default async function loadData() {
  const articles = await loadFake();
  return recompute(articles);
}
