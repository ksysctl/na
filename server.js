// Deps
var express = require('express');
var server = express();
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

// Config
server.use(express.static(__dirname + '/public'));                 // Set the static files location /public/img will be /img for users
server.use(morgan('dev'));                                         // Log every request to the console
server.use(bodyParser.urlencoded({'extended':'true'}));            // Parse application/x-www-form-urlencoded
server.use(bodyParser.json());                                     // Parse application/json
server.use(bodyParser.json({ type: 'application/vnd.api+json' })); // Parse application/vnd.api+json as json
server.use(methodOverride());

var config = {
    port: process.env.OPENSHIFT_NODEJS_PORT || 8080,
    address: process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
    mongo: {
        conn: 'mongodb://localhost/',
        name: 'na'
    }
};

// Database
if (process.env.OPENSHIFT_MONGODB_DB_URL) {
    config.mongo.conn = process.env.OPENSHIFT_MONGODB_DB_URL + config.mongo.name;
} else {
    config.mongo.conn = config.mongo.conn + config.mongo.name;
}
mongoose.connect(config.mongo.conn);

// Model
var Todo = mongoose.model('Todo', {
    text : String
});

// Get all todos
server.get('/api/todos', function(req, res) {
    // Use mongoose to get all todos in the database
    Todo.find(function(err, todos) {
        // If there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err)
        res.json(todos); // Return all todos in JSON format
    });
});

// Create todo and send back all todos after creation
server.post('/api/todos', function(req, res) {
    // Create a todo, information comes from AJAX request from Angular
    Todo.create({
        text : req.body.text,
        done : false
    }, function(err, todo) {
        if (err)
            res.send(err);
        // Get and return all the todos after you create another
        Todo.find(function(err, todos) {
            if (err)
                res.send(err)
            res.json(todos);
        });
    });
});

// Delete a todo
server.delete('/api/todos/:todo_id', function(req, res) {
    Todo.remove({
        _id : req.params.todo_id
    }, function(err, todo) {
        if (err)
            res.send(err);
        // Get and return all the todos after you create another
        Todo.find(function(err, todos) {
            if (err)
                res.send(err)
            res.json(todos);
        });
    });
});

// Frontend
server.get('*', function(req, res) {
    res.sendfile('./public/index.html'); // Load the single view file (angular will handle the page changes on the front-end)
});

// Run
server.listen(config.port, config.address, function() {
    console.log("Listening on " + config.address + ":" + config.port)
});
