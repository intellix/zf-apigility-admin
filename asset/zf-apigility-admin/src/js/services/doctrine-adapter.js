(function(_) {
    'use strict';

angular.module('ag-admin').factory('DoctrineAdapterResource', function ($http, apiBasePath, Hal) {

    var doctrineAdapterApiPath = apiBasePath + '/doctrine-adapter';

    return {
        getList: function (force) {
            force = !!force;
            var config = {
                method: 'GET',
                url: doctrineAdapterApiPath,
                cache: !force
            };
            return $http(config).then(
                function success(response) {
                    var doctrineAdapters = Hal.pluckCollection('doctrine_adapter', response.data);
                    return Hal.props(doctrineAdapters);
                }
            );
        },

        createNewAdapter: function (options) {
            return $http.post(doctrineAdapterApiPath, options)
                .then(function (response) {
                    return Hal.props(response.data);
                });
        },

        saveAdapter: function (name, data) {
            return $http({method: 'patch', url: doctrineAdapterApiPath + '/' + encodeURIComponent(name), data: data})
                .then(function (response) {
                    return Hal.props(response.data);
                });
        },

        removeAdapter: function (name) {
            return $http.delete(doctrineAdapterApiPath + '/' + encodeURIComponent(name))
                .then(function (response) {
                    return true;
                });
        }
    };
});

})(_);
