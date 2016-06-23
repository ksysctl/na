var express = require('express');
var app = express();

// Deps
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

// Database
mongoose.connect('mongodb://localhost/na');

// Config
app.use(express.static(__dirname + '/public'));                 // Set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // Log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // Parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // Parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // Parse application/vnd.api+json as json
app.use(methodOverride());

// Model
var Todo = mongoose.model('Todo', {
    text : String
});

// Get all todos
app.get('/api/todos', function(req, res) {
    // Use mongoose to get all todos in the database
    Todo.find(function(err, todos) {
        // If there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err)
        res.json(todos); // Return all todos in JSON format
    });
});

// Create todo and send back all todos after creation
app.post('/api/todos', function(req, res) {
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
app.delete('/api/todos/:todo_id', function(req, res) {
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
app.get('*', function(req, res) {
    res.sendfile('./public/index.html'); // Load the single view file (angular will handle the page changes on the front-end)
});

// Run
app.listen(8080);
console.log("App listening on port 8080");
