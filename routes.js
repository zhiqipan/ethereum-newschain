const routes = require('next-routes')();

routes
  .add('/articles', '/index')
  .add('/articles/new', '/articles/new')
  .add('/articles/:address', '/articles/article')
  .add('/articles/:address/modify', '/articles/modify')
  .add('/articles/:address/history', '/articles/history')
  .add('/tokens/:token/approve/:article', '/tokens/approve');

module.exports = routes;
