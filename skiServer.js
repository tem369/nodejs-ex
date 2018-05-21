/**
 * Created by Jacky on 2016-03-28.
 */

var express = require('express');
var app = express();

//mysql   = require('mysql'),
var DB_API;
//app.get('/dbInit', function(req, res) {
    DB_API=require("./dbApiService.js");
    DB_API.init();
//});

app.get('/', function(req, res) {
    //res.sendfile('test1.html');
    res.sendfile('index.html');
});

app.get('/data', function(req, res) {

    //res.sendfile('t1Front.html');
    //console.log(req);
    DB_API.query(req.query.SQL,function(data) {
        //res.json(DB_API.query.results);
        res.send(DB_API.query.results);
    //    res.json(data);
    });
});
app.use(express.static('public'));
app.use(express.static('scripts'));
app.use(express.static('images'));



var server = app.listen(8080, function () {

    var host = server.address().address
    var port = server.address().port

    console.log('Example app listening at http://%s:%s', host, port)

})