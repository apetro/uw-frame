define(['angular', 'jquery', 'portal', 'portal/main/routes', 'portal/settings/routes', 'portal/notifications/route', 'portal/features/route', 'portal/about/route'], function(angular, $, portal, main, settings, notifications, features, about) {
    /*
     This module intentionally left empty. This file is intended to serve as an extension point
     for My UW Madison 'App' developers that overlay angularjs-portal-frame.

     For more information, see: https://github.com/UW-Madison-DoIT/my-app-seed
     */
    var app = angular.module('my-app', ['portal']);

    // Example route configuration
    // TODO: Think of a more extensible approach such that frame and app can each manage their own routing without conflict
    app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
      console.log(main);
        $routeProvider.
            when('/settings', settings.betaSettings).
            when('/user-settings', settings.userSettings).
            when('/notifications', notifications).
            when('/features', features).
            when('/about', about).
            when('/access-denied', main.accessDenied).
            when('/server-error', main.serverError).
            when('/sorry-safari', main.storageError).
            when('/', main.main).
            otherwise(main.fileNotFound); //default to 404
    }]);

    return app;
});
