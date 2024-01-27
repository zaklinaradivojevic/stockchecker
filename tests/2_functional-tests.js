const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  
  test('Viewing one stock', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices/')
      .query({ stock: 'AAPL' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.isArray(res.body.stockData);
        assert.lengthOf(res.body.stockData, 1);
        assert.property(res.body.stockData[0], 'stock');
        assert.property(res.body.stockData[0], 'price');
        assert.property(res.body.stockData[0], 'likes');
        done();
      });
  }).timeout(5000);

  test('Viewing one stock and liking it', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices/')
      .query({ stock: 'AAPL', like: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.isArray(res.body.stockData);
        assert.lengthOf(res.body.stockData, 1);
        assert.property(res.body.stockData[0], 'stock');
        assert.property(res.body.stockData[0], 'price');
        assert.property(res.body.stockData[0], 'likes');
        assert.isAbove(res.body.stockData[0].likes, 0); // Assuming liking increases the likes count
        done();
      });
  }).timeout(5000);

  test('Viewing the same stock and liking it again', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices/')
      .query({ stock: 'AAPL', like: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.isArray(res.body.stockData);
        assert.lengthOf(res.body.stockData, 1);
        assert.property(res.body.stockData[0], 'stock');
        assert.property(res.body.stockData[0], 'price');
        assert.property(res.body.stockData[0], 'likes');
        assert.isAbove(res.body.stockData[0].likes, 0); // Assuming liking increases the likes count
        done();
      });
  }).timeout(5000);

  test('Viewing two stocks', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices/')
      .query({ stock: ['AAPL', 'GOOG'] })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.isArray(res.body.stockData);
        assert.lengthOf(res.body.stockData, 2);
        assert.property(res.body.stockData[0], 'stock');
        assert.property(res.body.stockData[0], 'price');
        assert.property(res.body.stockData[0], 'likes');
        assert.property(res.body.stockData[1], 'stock');
        assert.property(res.body.stockData[1], 'price');
        assert.property(res.body.stockData[1], 'likes');
        done();
      });
  }).timeout(5000);

  test('Viewing two stocks and liking them', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices/')
      .query({ stock: ['AAPL', 'GOOG'], like: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.isArray(res.body.stockData);
        assert.lengthOf(res.body.stockData, 2);
        assert.property(res.body.stockData[0], 'stock');
        assert.property(res.body.stockData[0], 'price');
        assert.property(res.body.stockData[0], 'likes');
        assert.isAbove(res.body.stockData[0].likes, 0); // Assuming liking increases the likes count
        assert.property(res.body.stockData[1], 'stock');
        assert.property(res.body.stockData[1], 'price');
        assert.property(res.body.stockData[1], 'likes');
        assert.isAbove(res.body.stockData[1].likes, 0); // Assuming liking increases the likes count
        done();
      });
  }).timeout(5000);
});
