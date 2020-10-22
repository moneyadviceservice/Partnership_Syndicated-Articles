// contentpage.js is to be referenced across any admin (currently) page that utilises the shared view for add/edit content-templates...

torusApp.config(['$httpProvider', function ($httpProvider) {
    // remove response interceptors.  Not needed on login page
    $httpProvider.interceptors.pop('torusUnauthorisedInterceptor');
}]);

torusApp.factory('contentPageService', ['$rootScope', '$http', '$location', 'gritterService', '$q', function ($rootScope, $http, $location, gritterService, $q) {

    // factory API calls
    return {

        getPageTemplate: function (name) {

            var deferred = $q.defer();

            $http.get('/api/cm/pagecontent/get/' + currentUser.tenantId + '/' + name, null).
                 success(function (data, status, headers, config) {
                     deferred.resolve(data);
                 }).
                 error(function (data, status, headers, config) {
                     if (status === 403) {
                         window.location = '/account?ReturnUrl=' + settings.pagesPath + '/' + name;
                     }
                     if (status === 404) {
                         window.location = '/error/pagenotfound';
                     }
                     deferred.reject();
                 });
            return deferred.promise;
        },

    };
}]);

torusApp.controller('MainController', ['$scope', '$rootScope', '$location', '$timeout', '$anchorScroll', 'torusPageTitleService', 'contentPageService', function MainController($scope, $rootScope, $location, $timeout, $anchorScroll, torusPageTitleService, contentPageService) {

    // start up
    $rootScope.loadComplete = false;
    $rootScope.working = 'working';

	// arrive at required "anchor" destination...
	$scope.anchScrl = function () {
		if (!isNullOrUndefined($location.$$path)) {
			var lh = $location.hash();
			var p = $location.$$path.replace("/", "");
			if (p !== "") {
				$anchorScroll(p);
			}
		}
	};

    // get page data
    contentPageService.getPageTemplate(pageData.pageName).then(function (pageContent) {
        $scope.pageContent = pageContent;
        torusPageTitleService.changeTitle(!isNullOrUndefined(pageContent.content) ? pageContent.name : pageData.noPageContentTitle);
        $rootScope.loadComplete = true;
		$rootScope.working = '';
		$timeout(function () { $scope.anchScrl(); }, 100);
    });

}]);

