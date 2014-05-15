var app = require('./server-config.js');

var port = process.env.PORT;

// environment = production

app.listen(port);

console.log('Server now listening on port ' + port);
