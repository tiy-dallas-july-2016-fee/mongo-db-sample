
var express = require('express');
var app = express();

app.get('/api/stuff', function(req, res) {
  res.send('hi');
});

app.listen(3000, function() {
  console.log('listening on port 3000');
});
