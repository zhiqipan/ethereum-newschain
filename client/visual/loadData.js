import fake from './fixtures';
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

export default async function loadData() {
  const articles = await loadFake();
  const articleMap = {};

  articles.forEach((a, index) => {
    articleMap[a.address] = { ...a, index };
  });

  const nodes = articles.map(a => {
    return { name: a.address };
  });

  const links = [];

  articles.forEach((a, i) => {
    a.citedBy.forEach(other => {
      links.push({
        source: i,
        target: articleMap[other].index,
        value: 10,
      });
    });
  });

  return { nodes, links };
}
