 window.genericTemplateFunction = function($element, $attrs) {
        var configSvc = $attrs.config,
            elem = angular.element($element),
            injector = elem.injector(),
            config = injector.get(configSvc);
        return config.templateUrl;
    };