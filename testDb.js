/**
 * Created by CWang on 26/02/15.
 */
/**
 * Created by CWang on 24/01/15.
 */
var mysql=require('mysql');

var connection=mysql.createConnection({
    host:"127.0.0.1",
    user:"root",
    password:"wangbo",
    database:"ski",
    insecureAuth : true
});

//connection.query("use IntegerArithmetic");
connection.connect();

connection.query("select * from ski.skiBoots", function (err, rows, fields) {
    if (err) {
        console.log(err);
        //exports.qErr= err;
    } else {
        //json.parse(rows);
        console.log(rows);
        //console.log(rows);
        //exports.response= rows;
        //var i;
        //for(var i=0;i<rows.length;i++) {
        //    for (var x in rows[i])
        //        console.log(x + "->" + (rows[i])[x]);
        //    console.log("\n\n");
        //}

    }

});

connection.end(function(err){
    if(err){
        //exports.endErr=err;
    }else{
        console.log("the end");
    }
});

