(function () {
    'use strict'
    angular.module('EmpApp')
        .controller('genericDirectiveController', ['$scope', '$attrs', '$injector', function ($scope, $attrs, $injector) {
            var configAttr = $attrs.config,
                config = $injector.get(configAttr),
                service = $injector.get(config.serviceName);
            service[config.methodName]()
                .then(function (data) {
                    var fieldMap = config.getFieldMap(data,$attrs);
                    angular.extend($scope,fieldMap);
                });
        }]);
})();