const common = require('../common');
let expect = common.expect;
let mockMicroservice = common.mockMicroService;
let mockFunctions = common.mockFunctions;


var snd;
var rcv;
before(function () {
  snd = new mockMicroservice('snd', 3334);
  rcv = new mockMicroservice('rcv', 3333);
  rcv.registerFn('rev', mockFunctions.rev);
  rcv.registerFn('neg', mockFunctions.neg);
  rcv.registerFn('finger', mockFunctions.finger);
});
it('bool', function (done) {
  snd.call('neg', false, (err, response) => {
    expect(response).to.equal(true);
    done()
  });
});
it('obj', function (done) {
  snd.call('finger', {data: 'data'} , (err, response) => {
    expect(response['test']).to.equal('test');
    done()
  })
});
it('arr', function (done) {
  snd.call('rev', [1,2,3] ,  (err, response) => {
    expect(response).to.eql([3,2,1]);
    done()
  }) ;
});
