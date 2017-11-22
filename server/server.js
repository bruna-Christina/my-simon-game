var express = require("express");
var app = express();
var cfenv = require("cfenv");
var bodyParser = require('body-parser');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

var mydb;

app.post("/api/scores", function (request, response) {
  if(!mydb) {
    var msg = "No database.";
    console.log('Error: ', msg);
    response.json({msg:msg});
    return;
  }
  var userName = request.body.name;
  var score = request.body.score;
  // insert the username as a document
  mydb.insert({ "name" : userName, "score":score }, function(err, body, header) {
    var msg = 'Score added.';
    if (err) {
      msg = '['+mydb+'.insert] '+ err.message;
      console.log('Error: ', msg);
    }
    response.json({msg:msg});
  });
});

app.get("/api/scores", function (request, response) {
  var scores = [];
  if(!mydb) {
    response.json(scores);
    return;
  }

  mydb.list({ include_docs: true }, function(err, body) {
    if (!err) {
      body.rows.forEach(function(row) {
        if(row.doc.name && row.doc.score)
          scores.push({
            _id:row.doc._id,
            name:row.doc.name,
            score:row.doc.score
          });
      });
      response.json(scores);
    }
  });
});

// load local VCAP configuration  and service credentials
var vcapLocal;
try {
  vcapLocal = require('./vcap-local.json');
  console.log("Loaded local VCAP", vcapLocal);
  vcapLocal = {'services':vcapLocal};
} catch (e) { }

const appEnvOpts = vcapLocal ? { vcap: vcapLocal} : {}
const appEnv = cfenv.getAppEnv(appEnvOpts);
if (appEnv.services['cloudantNoSQLDB'] || appEnv.getService(/cloudant/)) {
  // Load the Cloudant library.
  var Cloudant = require('cloudant');

  // Initialize database with credentials
  if (appEnv.services['cloudantNoSQLDB']) {
     // CF service named 'cloudantNoSQLDB'
     var cloudant = Cloudant(appEnv.services['cloudantNoSQLDB'][0].credentials);
  } else {
     // user-provided service with 'cloudant' in its name
     var cloudant = Cloudant(appEnv.getService(/cloudant/).credentials);
  }
  //database name
  var dbName = 'simon-game-db';

  // Create a new database.
  cloudant.db.create(dbName, function(err, data) {
    if(!err) //err if database doesn't already exists
      console.log("Created database: " + dbName);
  });

  // Specify the database we are going to use (mydb)...
  mydb = cloudant.db.use(dbName);
}
//serve static file (index.html, images, css)
app.use(express.static(__dirname));

var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});
