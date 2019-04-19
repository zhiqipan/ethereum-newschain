import { article as fakeArticle, articles as fakeArticles } from './fixtures';
import factory from '../../ethereum/instances/factory';
import { loadArticleSummary } from '../utils/loadArticleDetail';
import config from '../client.config';

const { MOCK } = config;

function __loadFakeGlobal() {
  return fakeArticles;
}

function __loadFakeSingle() {
  return fakeArticle;
}

async function loadGlobal() {
  const articleAddresses = await factory.methods.getArticles().call();
  const promises = articleAddresses.map(address => loadArticleSummary(address).then(summary => ({ address, ...summary })));
  return await Promise.all(promises);
}

async function loadSingle(address) {
  return await loadArticleSummary(address);
}

export function recomputeGlobal(inputArticles) {
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

export async function loadDataGlobal() {
  const articles = await (MOCK ? __loadFakeGlobal() : loadGlobal());
  return recomputeGlobal(articles);
}

export async function loadDataSingle(address, { hasCitations = true, hasCitedBy = true } = {}) {
  const { citations, citedBy } = await (MOCK ? __loadFakeSingle() : loadSingle(address));
  const nodes = [];
  nodes.push({ name: address.substr(2, 8), address, position: 'middle' });
  if (hasCitations) {
    citations.forEach(addr => {
      nodes.push({ name: addr.substr(2, 8), address: addr, position: 'left' });
    });
  }
  if (hasCitedBy) {
    citedBy.forEach(addr => {
      nodes.push({ name: addr.substr(2, 8), address: addr, position: 'right' });
    });
  }

  const links = [];

  if (hasCitations) {
    citations.forEach(addr => {
      links.push({
        source: nodes.map(n => n.address).indexOf(addr),
        target: 0,
        value: 10,
      });
    });
  }

  if (hasCitedBy) {
    citedBy.forEach(addr => {
      links.push({
        source: 0,
        target: nodes.map(n => n.address).indexOf(addr),
        value: 10,
      });
    });
  }

  return { nodes, links };
}
