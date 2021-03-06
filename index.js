/**
 * Created by liaobonn on 27/03/17.
 */
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.PORT || 3000;

var pg = require('pg');

var client = new pg.Client(process.env.DATABASE_URL || 'postgres://liaobonn:300315201@depot:5432/liaobonn_jdbc');
client.connect();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.listen(port, function () {
    console.log('Listening on port ' + port);
});

app.get('/get_all_tasks', function (request, response) {
    var queryString = "select * from todo where done=" + request.query.done;
    var query = client.query(queryString);
    var taskHTML = '';
    console.log(queryString);

    query.on('row', function (row) {
        taskHTML += '<li id="' + row.id + '"><span class="done">%</span>';
        taskHTML += '<span class="edit">+</span>';
        taskHTML += '<span class="delete">x</span>';
        taskHTML += '<span class="task">' + row.task + '</span></li>';
    });

    query.on('error', function (err) {
        console.log(err);
        response.sendStatus(400);
    });

    query.on('end', function () {
        console.log("Retrieved all tasks");
        response.send(taskHTML);
    })
});

app.post('/add_task/:task', function (request, response) {
    if(request.params.task == undefined){
        response.sendStatus(400);
    }
    
    var queryString = "insert into todo (task, done) values ('" + request.params.task + "', false)";
    var query = client.query(queryString);

    query.on('end', function () {
        console.log("Task has been added");
        addTask(request.params.task, response);
    });

    query.on('error', function (err) {
        console.log(err);
        response.sendStatus(400);
    });
});

app.put('/complete_task/:id', function (request, response) {
    var queryString = "update todo set done = true where id = " + request.params.id;
    var query = client.query(queryString);

    query.on('end', function () {
        response.sendStatus(200);
    });

    query.on('error', function (err) {
        console.log(err);
        response.sendStatus(400);
    });
});

app.put('/edit_task/:task/:id', function (request, response) {
    if(request.params.task == undefined){
        response.sendStatus(400);
    }
    
    var queryString = "update todo set task='" + request.params.task + "' where id = " + request.params.id;
    var query = client.query(queryString);

    query.on('end', function () {
        console.log("Task has been editted");
        response.sendStatus(200);
    });

    query.on('error', function (err) {
        console.log(err);
        response.sendStatus(400);
    });
});

app.delete('/delete_task/:id', function (request, response) {
    var queryString = "delete from todo where id=" + request.params.id;
    var query = client.query(queryString);

    query.on('end', function () {
        console.log("Task has been deleted");
        response.sendStatus(200);
    });

    query.on('error', function (err) {
        console.log(err);
        response.sendStatus(400);
    });
});

app.put('/update_list', function (request, response) {
    var allTasks = request.body.allTasks;
    if(allTasks == undefined){
        response.sendStatus(400);
    }

    for(var i = 0; i < allTasks.length; i++){
        var task = allTasks[i];
        var queryString = "update todo set task='" + task.task + "', done='" + task.done + "' where id = " + task.id;
        var query = client.query(queryString);

        query.on('error', function (err) {
            console.log(err);
            response.sendStatus(400);
        });
    }

    response.sendStatus(200);
});

function addTask(task, response) {
    var queryString = "select lastval()";
    var query = client.query(queryString);

    query.on('row', function (id) {
        var taskHTML = '<li id="' + (id.lastval) + '"><span class="done">%</span>';
        taskHTML += '<span class="edit">+</span>';
        taskHTML += '<span class="delete">x</span>';
        taskHTML += '<span class="task">' + task + '</span></li>';

        response.send(taskHTML);
    });

    query.on('error', function (err) {
        console.log(err);
        response.sendStatus(400);
    });
}