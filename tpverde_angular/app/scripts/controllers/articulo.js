/**
 * Created by negrero on 01/05/2016.
 */
angular.module('tpverdeAngularApp')
  .controller('ArticuloCtrl',articulo_Controller);


function articulo_Controller($scope,$http) {
  // Simple GET request example:
  $http({
    method: 'GET',
    url: 'http://localhost:3000/api/articulos'
  }).then(function successCallback(response) {
    $scope.list = response.data;
  }, function errorCallback(response) {
    console.error(response)
  });
}
