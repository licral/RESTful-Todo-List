/**
 * Created by liaobonn on 27/03/17.
 */
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.PORT || 3000;

var pg = require('pg');

var client = new pg.Client(process.env.DATABASE_URL);
client.connect();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.listen(port, function () {
    console.log('Listening on port 3000');
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

app.post('/add_task', function (request, response) {
    var queryString = "select * from todo order by id desc limit 1";
    var query = client.query(queryString);

    query.on('row', function (row) {
        var taskHTML = '<li id="' + (row.id + 1) + '"><span class="done">%</span>';
        taskHTML += '<span class="edit">+</span>';
        taskHTML += '<span class="delete">x</span>';
        taskHTML += '<span class="task">' + request.query.task + '</span></li>';

        addTask(request.query.task);

        response.send(taskHTML);
    });

    query.on('error', function (err) {
        console.log(err);
        response.sendStatus(400);
    });
});

app.post('/complete_task', function (request, response) {
    var queryString = "update todo set done = true where id = " + request.query.id;
    var query = client.query(queryString);

    query.on('end', function () {
        response.sendStatus(200);
    });

    query.on('error', function (err) {
        console.log(err);
        response.sendStatus(400);
    });
});

app.post('/edit_task', function (request, response) {
    var queryString = "update todo set task='" + request.query.task + "' where id = " + request.query.id;
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

app.post('/delete_task', function (request, response) {
    var queryString = "delete from todo where id=" + request.query.id;
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

app.post('/update_list', function (request, response) {
    var allTasks = request.body.allTasks;
    var queryString = "delete from todo";
    var query = client.query(queryString);

    query.on('end', function () {
        allTasks.forEach(function (task) {
            client.query("insert into todo (task, done) values ('" + task.task + "', " + task.done + ")");
        })
    });

    query.on('error', function (err) {
        console.log(err);
        response.sendStatus(400);
    });
});

function addTask(task) {
    var queryString = "insert into todo (task, done) values ('" + task + "', false)";
    var query = client.query(queryString);

    query.on('end', function () {
        console.log("Task has been added");
    });

    query.on('error', function (err) {
        console.log(err);
        response.sendStatus(400);
    });
}