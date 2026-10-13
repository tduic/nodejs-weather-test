// Route tests for server.js. The `request` module is replaced with a stub
// before the app loads, so no network calls are made and no API key is needed.
const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const calls = [];
let reply = () => [null, {}, '{}'];
const requestStub = (url, cb) => {
  calls.push(url);
  const [err, response, body] = reply(url);
  setImmediate(() => cb(err, response, body));
};
require.cache[require.resolve('request')] = {
  id: require.resolve('request'),
  filename: require.resolve('request'),
  loaded: true,
  exports: requestStub,
};

process.env.OPENWEATHER_API_KEY = 'test-key';
process.chdir(path.join(__dirname, '..')); // views/ and public/ are cwd-relative
const app = require('../server');

let server;
let base;
before(async () => {
  server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());
beforeEach(() => {
  calls.length = 0;
});

const postCity = (city) =>
  fetch(`${base}/`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ city }).toString(),
  });

test('GET / renders the empty form without calling the API', async () => {
  const res = await fetch(`${base}/`);
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /<form action="\/" method="post">/);
  assert.match(html, /name="city"/);
  assert.doesNotMatch(html, /<p>/);
  assert.equal(calls.length, 0);
});

test('GET /css/style.css serves static assets', async () => {
  const res = await fetch(`${base}/css/style.css`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /text\/css/);
});

test('POST / builds an encoded imperial-units URL with the env API key', async () => {
  reply = () => [null, {}, JSON.stringify({ main: { temp: 70 }, name: 'x' })];
  await (await postCity('São Paulo & Co')).text();
  assert.equal(calls.length, 1);
  const url = new URL(calls[0]);
  assert.equal(url.origin + url.pathname, 'https://api.openweathermap.org/data/2.5/weather');
  assert.equal(url.searchParams.get('q'), 'São Paulo & Co');
  assert.equal(url.searchParams.get('units'), 'imperial');
  assert.equal(url.searchParams.get('appid'), 'test-key');
  assert.match(calls[0], /q=S%C3%A3o%20Paulo%20%26%20Co&/);
});

test('POST / renders the temperature sentence on success', async () => {
  reply = () => [null, { statusCode: 200 }, JSON.stringify({ main: { temp: 72.5 }, name: 'Boston' })];
  const res = await postCity('Boston');
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /<p>It&#39;s 72.5 degrees in Boston!<\/p>/);
  assert.doesNotMatch(html, /Error, please try again/);
});

test('POST / shows an error when the API reports an unknown city', async () => {
  reply = () => [null, { statusCode: 404 }, JSON.stringify({ cod: '404', message: 'city not found' })];
  const html = await (await postCity('Nowhereville')).text();
  assert.match(html, /<p>Error, please try again<\/p>/);
  assert.doesNotMatch(html, /degrees in/);
});

test('POST / shows an error when the request itself fails', async () => {
  reply = () => [new Error('ECONNRESET'), undefined, undefined];
  const html = await (await postCity('Boston')).text();
  assert.match(html, /<p>Error, please try again<\/p>/);
});

test('POST / escapes the city name returned by the API', async () => {
  reply = () => [null, {}, JSON.stringify({ main: { temp: 1 }, name: '<script>x</script>' })];
  const html = await (await postCity('x')).text();
  assert.doesNotMatch(html, /<script>x<\/script>/);
  assert.match(html, /&lt;script&gt;x&lt;\/script&gt;/);
});
