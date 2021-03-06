//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    morgan  = require('morgan');
    
Object.assign=require('object-assign')


// ////////////////////////////
app.use(express.static('scripts'));
app.use(express.static('images'));
// var DB_API;
// //app.get('/dbInit', function(req, res) {
// DB_API=require("dbApiService.js");
// DB_API.init();
// //});
///////////////////////////


app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};


//////////////////////////////////////


app.get('/showProducts.html', function(req, res) {
    //res.sendfile('test1.html');
    res.sendfile('showProducts.html');
});

app.get('/home.html', function(req, res) {
    //res.sendfile('test1.html');
    res.sendfile('showProducts.html');
});
// .state('skiBoots', {
//     url: "/skiBoots",
//     templateUrl: "showProducts.html",
//     controller: 'showProductsController'
// })
//     .state('skiCloths', {
//         url: "/skiCloths",
//         templateUrl: "showProducts.html",
//         controller: 'showProductsController'
//     })
//     .state('backToLast', {
//         url: "/backToLast",
//         templateUrl: "showProducts.html",
//         controller: 'showProductsController'
//     })
//     .state('compareProducts', {
//         url: "/compareProducts",
//         templateUrl: "compareProducts.html",
//         controller: "compareProductsController"
//     })
//     .state('cartProcess', {
//         url: "/cartProcess",
//         templateUrl: "cartProcess.html",
//         controller: "cartProcessController"
//     })
//     .state('signin', {
//         url: "/signin",
//         templateUrl: "signin.html",
//         controller: "signinController"
//     })
//     .state('register', {
//         url: "/register",
//         templateUrl: "register.html",
//         controller: "registerController"
//     })
//     .state('oneProduct', {
//         url: "/oneProduct/:id",
//         templateUrl: "oneProductShown.html",


//////////////////////////////////////////
app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
    col.count(function(err, count){
      if (err) {
        console.log('Error running count. Message:\n'+err);
      }
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
    });
  } else {
    res.render('index.html', { pageCountMessage : null});
  }
});



// ///////////////////////////
// app.get('/data', function(req, res) {
//
//     //res.sendfile('t1Front.html');
//     //console.log(req);
//     DB_API.query(req.query.SQL,function(data) {
//         //res.json(DB_API.query.results);
//         res.send(DB_API.query.results);
//         //    res.json(data);
//     });
// });

// ////////////////////////////




app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
