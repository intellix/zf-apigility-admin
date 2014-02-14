(function(_, $) {
    'use strict';

    angular.module('ag-admin').controller(
        'DoctrineAdapterController',
        function($scope, $location, flash, DoctrineAdapterResource) {
            $scope.doctrineAdapters = [];
            $scope.showNewDoctrineoctrinedapterForm = false;

            $scope.ui = {
                ormAdapters: {
                    'Doctrine\\DBAL\\Driver\\DrizzlePDOMySql\\Driver': 'DrizzlePDOMySql',
                    'Doctrine\\DBAL\\Driver\\IbmDb2\\DB2Driver': 'IbmDb2',
                    'Doctrine\\DBAL\\Driver\\Mysqli\\Driver': 'Mysqli',
                    'Doctrine\\DBAL\\Driver\\OCI8\\Driver': 'Oci8',
                    'Doctrine\\DBAL\\Driver\\PDOIbm\\Driver': 'Pdo_IBM',
                    'Doctrine\\DBAL\\Driver\\PDOMySql\\Driver': 'Pdo_Mysql',
                    'Doctrine\\DBAL\\Driver\\PDOOracle\\Driver': 'Pdo_Oracle',
                    'Doctrine\\DBAL\\Driver\\PDOPgSql\\Driver': 'Pdo_Pgsql',
                    'Doctrine\\DBAL\\Driver\\PDOSqlite\\Driver': 'Pdo_Sqlite',
                    'Doctrine\\DBAL\\Driver\\PDOSqlsrv\\Driver': 'Pdo_Sqlsrv',
                    'Doctrine\\DBAL\\Driver\\Sqlsrv\\Driver': 'Sqlsrv'
                }  
            };

            $scope.resetForm = function() {
                $scope.showNewDoctrineAdapterForm = false;
                $scope.adapterName = '';
                $scope.driverClass = '';
                $scope.database = '';
                $scope.username = '';
                $scope.password = '';
                $scope.hostname = 'localhost';
                $scope.port = '';
            };

            function updateDoctrineAdapters(force) {
                $scope.doctrineAdapters = [];
                DoctrineAdapterResource.getList(force).then(function(updatedAdapters) {
                    $scope.doctrineAdapters = updatedAdapters;
                });
            }
            updateDoctrineAdapters(false);

            $scope.saveDoctrineAdapter = function(index) {
                var doctrineAdapter = $scope.doctrineAdapters[index];

                var options;
                if (doctrineAdapter.adapter_name != 'odm_default') {
                    options = {
                        driverClass: doctrineAdapter.driverClass,
                        params: {
                            path: doctrineAdapter.params.path,
                            dbname: doctrineAdapter.params.dbname,
                            user: doctrineAdapter.params.user,
                            password: doctrineAdapter.params.password,
                            host: doctrineAdapter.params.host,
                            port: doctrineAdapter.params.port
                        }
                    };
                } else {
                    options = {
                        dbname: doctrineAdapter.dbname,
                        connectionString: doctrineAdapter.connectionString,
                        user: doctrineAdapter.user,
                        password: doctrineAdapter.password,
                        port: doctrineAdapter.port,
                        server: doctrineAdapter.server
                    };
                }
                DoctrineAdapterResource.saveAdapter(doctrineAdapter.adapter_name, options).then(function(doctrineAdapter) {
                    flash.success = 'Doctrine adapter ' + doctrineAdapter.adapter_name + ' updated';
                    updateDoctrineAdapters(true);
                });
            };

            $scope.removeDoctrineAdapter = function(adapter_name) {
                DoctrineAdapterResource.removeAdapter(adapter_name).then(function() {
                    flash.success = 'Doctrine adapter ' + adapter_name + ' reset';
                    updateDoctrineAdapters(true);
                    $scope.deleteDoctrineAdapter = false;
                });
            };
        }
    );

})(_, $);