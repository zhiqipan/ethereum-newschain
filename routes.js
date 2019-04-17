const routes = require('next-routes')();

routes
  .add('/articles', '/index')
  .add('/articles/new', '/articles/new')
  .add('/articles/:address/modify', '/articles/modify')
  .add('/articles/:address', '/articles/article');

module.exports = routes;
