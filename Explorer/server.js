process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const compression = require('compression');
const path = require('path');

const app = express();

app.use(compression());

app.use(createProxyMiddleware({
  target: 'https://localhost:44333',
  pathFilter: '/api',
  changeOrigin: true,
  secure: false,
  logger: console
}));

app.use(express.static(path.join(__dirname, 'dist/explorer'), {
  maxAge: '1d',
  etag: true
}));

app.get('{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/explorer', 'index.html'));
});

app.listen(4200, () => {
  console.log('Server running on http://localhost:4200');
});
