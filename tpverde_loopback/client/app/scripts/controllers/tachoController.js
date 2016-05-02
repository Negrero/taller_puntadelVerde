/**
 * Created by negrero on 02/05/2016.
 */
/*
angular.module('sbAdminApp')
  .controller('TachoCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
// DOM element where the Timeline will be attached
    var container = document.getElementById('visualization');

    // Create a DataSet (allows two way data-binding)
    var items = new vis.DataSet([
      {id: 1, content: 'item 1', start: '2013-04-20'},
      {id: 2, content: 'item 2', start: '2013-04-14'},
      {id: 3, content: 'item 3', start: '2013-04-18'},
      {id: 4, content: 'item 4', start: '2013-04-16', end: '2013-04-19'},
      {id: 5, content: 'item 5', start: '2013-04-25'},
      {id: 6, content: 'item 6', start: '2013-04-27'}
    ]);

    // Configuration for the Timeline
    var options = {};

    // Create a Timeline
    if (!$scope.timeline)
         $scope.timeline = new vis.Timeline(container, items, options);
  }]);
  */

angular.module('sbAdminApp')
  .controller('TachoCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
// DOM element where the Timeline will be attached
    var container = document.getElementById('visualization');

    // Create a DataSet (allows two way data-binding)
    var items = new vis.DataSet([
      {id: 1, content: 'item 1', start: '2013-04-20'},
      {id: 2, content: 'item 2', start: '2013-04-14'},
      {id: 3, content: 'item 3', start: '2013-04-18'},
      {id: 4, content: 'item 4', start: '2013-04-16', end: '2013-04-19'},
      {id: 5, content: 'item 5', start: '2013-04-25'},
      {id: 6, content: 'item 6', start: '2013-04-27'}
    ]);

    // Configuration for the Timeline
    var options = {};

    // Create a Timeline
    if (!$scope.timeline)
      $scope.timeline = new vis.Timeline(container, items, options);
  }]);
