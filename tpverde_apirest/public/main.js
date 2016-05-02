/**
 * Created by negrero on 01/05/2016.
 */
angular.module('angularTodo', [])
    .controller('mainCotroller',mainController)
    .directive('listar',detalle)


function mainController($scope, $http) {
    $scope.formData = {};

    // Cuando se cargue la página, pide del API todos los TODOs
    $http.get('/api/todos')
        .success(function(data) {
            $scope.todos = data;
            console.log(data)
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });

    // Cuando se añade un nuevo TODO, manda el texto a la API
    $scope.createTodo = function(){
        $http.post('/api/todos', $scope.formData)
            .success(function(data) {
                $scope.formData = {};
                $scope.todos = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error:' + data);
            });
    };

    // Borra un TODO despues de checkearlo como acabado
    $scope.deleteTodo = function(id) {
        $http.delete('/api/todos/' + id)
            .success(function(data) {
                $scope.todos = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error:' + data);
            });
    };
}

function detalle(){
    return{
        restrict:'E',
        replace:true,
        template:' <div class="checkbox" ng-repeat="todo in todos"><label><input type="checkbox" ng-click="deleteTodo(todo._id)"> {{ todo.text }}</label></div>',// templateUrl: path file 'mi-directiva.html',
        scope:true
    }
}