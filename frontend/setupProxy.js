const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/',
    createProxyMiddleware({
      target: 'https://ramsays-detailing.onrender.com',
      changeOrigin: true,
    })
  );
};
