
var app = angular.module('starter', ['ionic', 'ngResource','ngStorage'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider,$httpProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
 $stateProvider
    .state('signin', {
      url: '/sign-in',
      templateUrl: 'templates/sign-in.html',
      controller: 'LoginCtrl'
    })
    .state('signup', {
      url: '/sign-up',
      templateUrl: 'templates/sign-up.html',
      controller: 'RegisterCtrl'
    })
  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.production', {
    url: '/production',
    views: {
      'tab-production': {
        templateUrl: 'templates/tab-production.html',
        controller: 'ProductionCtrl'
      }
    }
  })
    .state('tab.production-detail', {
      url: '/production/:prodId',
      views: {
        'tab-production': {
          templateUrl: 'templates/production-detail.html',
          controller: 'ProductionDetailCtrl'
        }
      },
      resolve: {
        
                
            }
    })


  .state('tab.sales', {
    url: '/sales',
    views: {
      'tab-sales': {
        templateUrl: 'templates/tab-sales.html',
        controller: 'SalesCtrl'
      }
    }
  })
    .state('tab.sales-detail', {
      url: '/sales/:salesId',
      views: {
        'tab-sales': {
          templateUrl: 'templates/sales-detail.html',
          controller: 'SalesDetailCtrl'
        }
      },
      resolve: {}
    })


  .state('tab.finance', {
    url: '/finance',
    views: {
      'tab-finance': {
        templateUrl: 'templates/tab-finance.html',
        controller: 'FinanceCtrl'
      }
    }
  })
    .state('tab.finance-detail', {
      url: '/finance/:financeId',
      views: {
        'tab-finance': {
          templateUrl: 'templates/finance-detail.html',
          controller: 'FinanceDetailCtrl'
        }
      },
      resolve: {}
    })
.state('tab.hr', {
    url: '/hr',
    views: {
      'tab-hr': {
        templateUrl: 'templates/tab-hr.html',
        controller: 'HRCtrl'
      }
    }
  })
    .state('tab.hr-detail', {
      url: '/hr/:hrId',
      views: {
        'tab-hr': {
          templateUrl: 'templates/hr-detail.html',
          controller: 'HRDetailCtrl'
        }
      },
      resolve: {}
    })

    .state('tab.profile', {
    url: '/profile',
    views: {
      'tab-profile': {
        templateUrl: 'templates/tab-profile.html',
        controller: 'ProfileCtrl'
      }
    }
  })
    .state('tab.log', {
    url: '/log',
    views: {
      'tab-log': {
        templateUrl: 'templates/tab-log.html',
        controller: 'LogCtrl'
      }
    }
  })
;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/sign-in');

  $httpProvider.interceptors.push('TokenAuthInterceptor');
  //$httpProvider.interceptors.push('CryptoInterceptor');

  
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];

  
});
