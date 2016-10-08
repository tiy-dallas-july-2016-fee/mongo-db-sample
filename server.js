var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');

var app = express();

app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));




var mongoConnectionUrl = 'mongodb://localhost:27017/myproject';



// ==================================================
// GET ALL
// ==================================================

app.get('/api/stuff', function(req, res) {

  MongoClient.connect(mongoConnectionUrl, function(err, db) {
    //assert.equal(null, err);
    console.log("Connected correctly to server");

    var callbackForFindComplete = function(docs) {
      db.close();
      res.send(docs);
    };

    findDocuments({}, db, callbackForFindComplete);

  });


});





// ==================================================
// GET
// ==================================================

app.get('/api/stuff/:id', function(req, res) {

  //step 1: get user id from parameters
  var userId = req.params.id;

  //step 2: connect to mongo
  MongoClient.connect(mongoConnectionUrl, function(err, db) {
    //step 3: mongo connection successful!
    console.log("Connected correctly to server");

    //step 4: now build parameters for the search
    var searchParameters = {
      userId: userId
    };

    //step 5: execute search
    findDocuments(searchParameters, db, function(docs) {
      //step 8: data is in docs, so we no longer need to keep the db connection open
      db.close();
      //step 9: send stats back from api. It is at this point that your done function on the client side will get its data.
      res.send(docs);
    });

  });


});

var findDocuments = function(searchParameters, db, callback) {
  var collection = db.collection('documents');
  // Step 6: query the database
  collection.find(searchParameters).toArray(function(err, docs) {
    //step 7: callback is fired, data is in the "docs" parameter
    console.log("Found the following records");
    console.dir(docs);
    callback(docs);
  });
}


// ==================================================
// POST
// ==================================================


app.post('/api/stuff/:id', function(req, res) {

  var userId = req.params.id;

  console.log('what did I get?', userId, req.body);

  var query = {
    userId: userId
  };

  var fullDataset = {
    wins: Number(req.body.wins),
    losses: Number(req.body.losses),
    difficultyChosen: req.body.difficultyChosen,
    userId: userId
  }

  // Use connect method to connect to the Server
  MongoClient.connect(mongoConnectionUrl, function(err, db) {
    //assert.equal(null, err);
    console.log("Connected correctly to server");

    updateDocuments(query, fullDataset, db, function() {
        db.close();
        res.sendStatus(204);
    });
  });
});

var insertDocuments = function(dataToInsert, db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');

  // Insert some documents
  collection.insert(dataToInsert, function(err, result) {
    console.log("Added something");
    callback(result);
  });
}

var updateDocuments = function(query, fullDataset, db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');


  var dataToIncrement = {
    $inc: {
      wins: fullDataset.wins,
      losses: fullDataset.losses
    }
  }



  // Insert some documents
  collection.update(query, fullDataset, function(err, result) {
    console.log("Added something. Error: ", err, ' Result: ', result);

    if (result !== undefined) {
      if (result.result.nModified === 0) {
        insertDocuments(fullDataset, db, callback);
      }
      else {
        callback(result);
      }
    }


  });
}





app.listen(3000, function() {
  console.log('listening on port 3000');
});
