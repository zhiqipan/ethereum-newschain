function fakeArticle(num) {
  return {
    address: '0xA' + num,
    citations: [],
    citedBy: [],
    contentHash: '7378f4d2919c27f0a49eb691f712bd14ebddcda3518e5372392078e6db6d343d',
  };
}

function cite(a1, a2) {
  a1.citations.push(a2.address);
  a2.citedBy.push(a1.address);
}

const a1 = fakeArticle(1);
const a2 = fakeArticle(2);
const a3 = fakeArticle(3);
const a4 = fakeArticle(4);
const a5 = fakeArticle(5);
const a6 = fakeArticle(6);
const a7 = fakeArticle(7);
const a8 = fakeArticle(8);
const a9 = fakeArticle(9);

cite(a2, a1);
cite(a3, a1);
cite(a4, a1);
cite(a4, a2);
cite(a5, a3);
cite(a7, a6);
cite(a7, a1);
cite(a7, a5);
cite(a9, a3);

const articles = [a1, a2, a3, a4, a5, a6, a7, a8, a9];

function loadArticleDetail(address) {
  return {
    contentHash: '7378f4d2919c27f0a49eb691f712bd14ebddcda3518e5372392078e6db6d343d',
    version: 0,
    creator: '0x30010ba49019D79869be3518Ce3f9F2a6a866BC3',
    rewardRecipient: '0x30010ba49019D79869be3518Ce3f9F2a6a866BC3',
    rewardValueEther: 0.132,
    rewardTimes: 2,
    tokenTypes: 1,
    autoTokenRewarded: false,
    title: 'recusandae reiciendis ut',
    body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. A debitis delectus ducimus laboriosam laborum recusandae reiciendis sapiente totam ut. Distinctio dolorum et maxime molestiae, non nulla quibusdam tempora veniam vitae.',
    ncTokenReward: 3,
  };
}

export { articles, loadArticleDetail };
