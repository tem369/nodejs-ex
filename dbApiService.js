/**
 * Created by Jacky on 2016-04-02.
 */

//var express = require('express'),
//    app     = express(),

connectionpool=null;

exports.init=function() {
    var  mysql = require('mysql');
    connectionpool = mysql.createPool({
        host:"localhost",
        user:"root",
        password:"wangbo",
        database:"ski"
    });
};
//app.get('/:table', function(req,res){

exports.query = function (params, callBack) {
    connectionpool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
        } else {
            console.log(params);

            connection.query(params, function (err, rows, fields) {
                if (err) {
                    console.error(err);
                    exports.query.reults = "";
                } else {
                    console.log(rows);

                    exports.query.results = rows;
                }
                ;
                connection.release();
                callBack();
            });


        }
        ;
    });
};

exports.close=function(){
    connectionpool.end();
};
