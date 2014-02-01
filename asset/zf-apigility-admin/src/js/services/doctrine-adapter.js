(function(_, Hyperagent) {'use strict';

angular.module('ag-admin').factory(
    'DoctrineAdapterResource', 
    ['$http', '$q', '$location', 'apiBasePath', function ($http, $q, $location, apiBasePath) {

    var doctrineAdapterApiPath = apiBasePath + '/doctrine-adapter';

    var resource =  new Hyperagent.Resource(doctrineAdapterApiPath);
    
    resource.getList = function () {
        var deferred = $q.defer();

        this.fetch().then(function (adapters) {
            var doctrineAdapters = _.pluck(adapters.embedded.doctrine_adapter, 'props');
            deferred.resolve(doctrineAdapters);
        });

        return deferred.promise;
    };

    resource.saveAdapter = function (name, data) {
        return $http({method: 'patch', url: doctrineAdapterApiPath + '/' + encodeURIComponent(name), data: data})
            .then(function (response) {
                return response.data;
            });
    };

    resource.removeAdapter = function (name) {
        return $http.delete(doctrineAdapterApiPath + '/' + encodeURIComponent(name))
            .then(function (response) {
                return true;
            });
    };

    return resource;
}]);

})(_, Hyperagent);
