var expect = require('chai').expect;
var http = require('http');
var mockMicroservice = require('./ms/MockMicroservice').MockMicroservice;
var mockFunctions = require('./ms/mockFunctions') ;

describe("basic", function () {
  var snd;
  var rcv;
  before(function () {
    snd = new mockMicroservice('snd', 4334);
    rcv = new mockMicroservice('rcv', 4333);
    rcv.registerFn('mul', mockFunctions.mul);
    rcv.registerFn('up', mockFunctions.up);
  });

  it("hello world", function (done) {
    snd.call('mul', {x: 2, y:3}, (err, response) => {
      expect(response).to.equal(6);
      snd.call('up', 'hello', (err, response) => {
        expect(response).to.equal('HELLO');
        done();
      });
    })

  });

  it("not found", function (done) {
    snd.call('mullll', {x: 2, y:3}, (err, response) => {
      expect(response).to.equal(http.STATUS_CODES[404]);
      done()
    })
  });

  after(function () {
    snd.stop();
    rcv.stop();
  });

});

// describe('data Types', function () {
//   var snd;
//   var rcv;
//   before(function () {
//     snd = new mockMicroservice('snd', 3334);
//     rcv = new mockMicroservice('rcv', 3333);
//     rcv.registerFn('rev', mockFunctions.rev);
//     rcv.registerFn('neg', mockFunctions.neg);
//     rcv.registerFn('finger', mockFunctions.finger);
//   });
//   it('bool', function (done) {
//     snd.call('neg', false, (err, response) => {
//       expect(response).to.equal(true);
//       done()
//     });
//   });
//   it('obj', function (done) {
//     snd.call('finger', {data: 'data'} , (err, response) => {
//       expect(response['test']).to.equal('test');
//       done()
//     })
//   });
//   it('arr', function (done) {
//     snd.call('rev', [1,2,3] ,  (err, response) => {
//       expect(response).to.equal([3,2,1]);
//       done()
//     }) ;
//   });
// });