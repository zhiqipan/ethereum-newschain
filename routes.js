const routes = require('next-routes')();

routes
  .add('/articles/:address', '/articles/article')
  .add('/articles/:address/modify', '/articles/modify')
  .add('/articles/:address/history', '/articles/history')
  .add('/tokens/:token/approve/:article', '/tokens/approve');

module.exports = routes;
