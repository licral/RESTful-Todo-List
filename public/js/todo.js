$(document).ready(function (e) {
    
    loadTodoTasks();
    loadCompletedTasks();
    
    $('#add-todo').button({
        icons: {
            primary: "ui-icon-circle-plus"
        }
    }).click(function () {
        $('#new-todo').dialog('open');
    });

    $('#new-todo').dialog({
        modal: true,
        autoOpen: false,
        buttons: {
            "Add task": function () {
                $.ajax({
                    type: 'POST',
                    url: 'https://vast-cove-47966.herokuapp.com/add_task/' + $('#task').val(),
                    dataType: 'html',
                    contentType: 'application/json',
                    success: function(data){
                        addTask(data, '#new-todo');
                        updateList();
                    }
                });
            },
            "Cancel": function () {
                $(this).dialog('close');
            }
        }
    });

    $('#todo-list').on('click', '.done', function () {
        var $taskItem = $(this).parent('li');
        var task = $taskItem.attr('id');

        $.ajax({
            type: 'PUT',
            url: 'https://vast-cove-47966.herokuapp.com/complete_task/' + task,
            contentType: 'application/json',
            success: function(){
                $taskItem.slideUp(250, function () {
                    var $this = $(this);
                    $this.detach();
                    $('#completed-list').prepend($this);
                    $this.slideDown();
                });
            }
        });

    });

    $('#todo-list').on('click', '.edit', function(){
        var taskEdit = $(this).siblings('.task');
        var taskId = $(this).parent('li').attr('id');
        $('#task-edit').val(taskEdit.text());
        $('#edit-todo').data({
            taskEdit: taskEdit,
            taskId: taskId
        }).dialog('open');
    });

    $('#edit-todo').dialog({
        modal: true,
        autoOpen: false,
        buttons:{
            "Save": function(){
                var newItem = $('#task-edit').val();
                var taskItem = $(this).data('taskEdit');
                var taskId = $(this).data('taskId');
                
                $.ajax({
                    type: 'PUT',
                    url: 'https://vast-cove-47966.herokuapp.com/edit_task/' + newItem + '/' + taskId,
                    contentType: 'application/json',
                    success: function(){
                        editTask(taskItem, newItem, '#edit-todo');
                        updateList();
                    }
                });
            },
            "Cancel": function () {
                $(this).dialog('close');
            }
        }
    });

    $('.sortlist').sortable({
        connectWith: '.sortlist',
        cursor: 'pointer',
        placeholder: 'ui-state-highlight',
        cancel: '.delete, .done',
        stop: function(){
            updateList();
        }
    });

    $('.sortlist').on('click', '.delete', function () {
        var taskDelete = this;
        var taskId = $(this).parent('li').attr('id');
        $('#confirm-delete').data({
            taskItem: taskDelete,
            taskId: taskId
        }).dialog('open');
    });

    $('#confirm-delete').dialog({
        modal: true,
        autoOpen: false,
        buttons: {
            "Yes": function () {
                var taskItem = $(this).data('taskItem');
                var taskId = $(this).data('taskId');
                $.ajax({
                    type: 'DELETE',
                    url: 'https://vast-cove-47966.herokuapp.com/delete_task/' + taskId,
                    contentType: 'application/json',
                    success: function(){
                        deleteTask(taskItem, '#confirm-delete');
                    }
                });
            },
            "No": function () {
                $(this).dialog('close');
            }
        }
    });

    function addTask(data, id){
        $newTask = $(data);
        $newTask.hide();
        $('#todo-list').prepend($newTask);
        $newTask.show('clip', 250).effect('highlight', 1000);
        $('#task').val("");
        $(id).dialog('close');
    }

    function editTask(taskItem, newItem, id){
        taskItem.text(newItem);
        $(id).dialog('close');
    }

    function deleteTask(taskItem, id){
        $(taskItem).parent('li').effect('puff', function () {
            $(taskItem).parent('li').remove();
        });
        $(id).dialog('close');
    }
    
    function loadTodoTasks(){
        $.ajax({
            type: 'GET',
            url: 'https://vast-cove-47966.herokuapp.com/get_all_tasks?done=false',
            dataType: 'html',
            success: function(data){
                $('#todo-list').html(data);
            }
        });
    }

    function loadCompletedTasks(){
        $.ajax({
            type: 'GET',
            url: 'https://vast-cove-47966.herokuapp.com/get_all_tasks?done=true',
            dataType: 'html',
            success: function(data){
                $('#completed-list').html(data);
            }
        });
    }

    function updateList(){
        var allTasks = [];
        var $todoList = $('.sortlist li');
        $todoList.each(function(){
            var task = $(this).children('.task').text();
            var id = $(this).attr('id');
            var done = false;
            if($(this).parent('ul').attr('id') == "completed-list"){
                done = true;
            }
            allTasks.push({
                id: id,
                task: task,
                done: done
            });
        });
        $.ajax({
            type: 'PUT',
            url: 'https://vast-cove-47966.herokuapp.com/update_list',
            contentType: 'application/json',
            data: JSON.stringify({
                allTasks: allTasks
            })
        });
    }
    
}); // end ready