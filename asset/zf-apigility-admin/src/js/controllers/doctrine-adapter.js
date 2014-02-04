(function(_, $) {'use strict';

angular.module('ag-admin').controller(
    'DoctrineAdapterController',
    ['$scope', '$location', 'flash', 'DoctrineAdapterResource', function ($scope, $location, flash, DoctrineAdapterResource) {
        $scope.doctrineAdapters = [];
        $scope.showNewDoctrineoctrinedapterForm = false;

        $scope.resetForm = function () {
            $scope.showNewDoctrineAdapterForm = false;
            $scope.adapterName = '';
            $scope.driver      = '';
            $scope.database    = '';
            $scope.username    = '';
            $scope.password    = '';
            $scope.hostname    = 'localhost';
            $scope.port        = '';
        };

        function updateDoctrineAdapters(force) {
            $scope.doctrineAdapters = [];
            DoctrineAdapterResource.fetch({force: force}).then(function (doctrineAdapters) {
                $scope.$apply(function () {
                    $scope.doctrineAdapters = _.pluck(doctrineAdapters.embedded.doctrine_adapter, 'props');
                });
            });
        }
        updateDoctrineAdapters(false);

        $scope.saveDoctrineAdapter = function (index) {
            var doctrineAdapter = $scope.doctrineAdapters[index];
            
            var options;
            if(doctrineAdapter.adapter_name != 'odm_default') {
                options = {
                    driverClass     :  doctrineAdapter.driver,
                    params: {
                        dbname      :  doctrineAdapter.params.dbname,
                        user        :  doctrineAdapter.params.user,
                        password    :  doctrineAdapter.params.password,
                        host        :  doctrineAdapter.params.host,
                        port        :  doctrineAdapter.params.port
                    } 
                };
            } else {
                options = {
                    dbname          : doctrineAdapter.dbname,
                    connectionString: doctrineAdapter.connectionString,
                    username        : doctrineAdapter.user,
                    password        : doctrineAdapter.password,
                    port            : doctrineAdapter.port,
                    server          : doctrineAdapter.server,
                    options         : doctrineAdapter.options
                };
            }
            DoctrineAdapterResource.saveAdapter(doctrineAdapter.adapter_name, options).then(function (doctrineAdapter) {
                flash.success = 'Doctrine adapter ' + doctrineAdapter.adapter_name + ' updated';
                updateDoctrineAdapters(true);
            });
        };

        $scope.removeDoctrineAdapter = function (adapter_name) {
            DoctrineAdapterResource.removeAdapter(adapter_name).then(function () {
                flash.success = 'Doctrine adapter ' + adapter_name + ' reset';
                updateDoctrineAdapters(true);
                $scope.deleteDoctrineAdapter = false;
            });
        };
    }]
);

})(_, $);
