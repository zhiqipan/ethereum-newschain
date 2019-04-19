function fakeArticle(num) {
  return {
    address: '0xA' + num,
    citations: [],
    citedBy: [],
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

cite(a2, a1);
cite(a3, a1);
cite(a4, a1);
cite(a4, a2);
cite(a5, a3);
cite(a7, a6);
cite(a7, a1);
cite(a7, a5);

export default [a1, a2, a3, a4, a5, a6, a7];
