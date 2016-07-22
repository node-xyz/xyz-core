const http = require('http') ;
const request = require('request') ;

function CuteHTTP(port, app) {
    var server ;

    function handleRequest(request, response) {
        var body = [] ;

        request
        .on('data' , function handleData (chuck) {
            body.push(chuck) ;
        })
        .on('end' , function dataEnd () {
            console.log(body) ;
            app.emit('request' , { url : request.url , body : body.toString() }) ;
            response.end('It Works!! Path Hit: ' + request.url) ;
        }) ;
    }

    this.init = function() {
        server = http.createServer();
        server.addListener('request' , handleRequest) ;

        server.listen(port, function() {
            console.log("Server listening on: http://localhost:%s", port) ;
        });
    }
}

function CuteClient() {
    var address = "http://localhost";
    var port = 3000 ;

    url = address + ":" + port ;

    this.send = function (data) {
        request.post(url , JSON.stringify(data) ,function (err, response) {
            console.log(err , response)
        })
    }
}

module.exports = {
    CuteHTTP : CuteHTTP,
    CuteClient : CuteClient
} ;