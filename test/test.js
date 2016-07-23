var expect = require('chai').expect;
var mockMicroservice = require('./ms/MockMicroservice').MockMicroservice;
var mockFunctions = require('./ms/mockFunctions') ;

describe("basic test", function () {
  it("message passing", function (done) {
    var snd = new mockMicroservice('snd', 3334);
    var rcv = new mockMicroservice('rcv', 3333);

    rcv.registerFn('mul', mockFunctions.mul);

    snd.call('mul', {x: 2, y:3}, (err, response) => {
      expect(response.body).to.equal(6);
      done()
    })

  });

  it('data types', function (done) {
    var snd = new mockMicroservice('snd', 3334);
    var rcv = new mockMicroservice('rcv', 3333);

    
    done();
  })


});