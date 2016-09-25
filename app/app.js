var app = angular.module('buildDirectApp', ['ngRoute','angular-loading-bar','ngAnimate', 'ngDialog', 'chart.js']);

//This configures the routes and associates each route with a view and a controller
app.config(function ($routeProvider, $locationProvider, ChartJsProvider) {
    $routeProvider
        .when('/',
            {
                controller: 'MainController',
                // testing
                templateUrl: './app/partials/productresults.html'
            })
        //Define a route that has a route parameter in it (:categoryID)
        .when('/category/:categoryID',
            {
                controller: 'CategoryController',
                templateUrl: './app/partials/category.html'
            })
		//Define a route that has a route parameter in it (:brandID)
		.when('/brand/:brandID',
			{
				controller: 'BrandController',
				templateUrl: './app/partials/brand.html'
			})
        .otherwise({ redirectTo: '/' });

    ChartJsProvider.setOptions({
      colors: ['#97BBCD', '#DCDCDC', '#F7464A', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360']
    });

});




