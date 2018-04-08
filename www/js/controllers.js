app

.controller('DashCtrl', function($scope) {})

.controller("LoginCtrl", function($scope, sessionService, accountService, $state,loginUser) {
    
    $scope.login = function(account) {
        sessionService.login(account,
        function(data) {
            accountService.getCurrLogin(
              function(data) {
                    $scope.account = data;
                    loginUser.encryption = data.encryption;
                    $state.go("tab.production");
                  },
              function() {
                  alert("Error getting current user");
              });
            
        },
        function() {
            alert("error logging in - LoginCtrl");
        });
    };
})
.controller("RegisterCtrl", function($scope, sessionService, $state, accountService,loginUser) {
  $scope.$on('$ionicView.beforeEnter', function(e) {
    var account={};
    account.role = "Worker";
    account.department = "Production"
    $scope.account = account;

  });

    $scope.register = function(account) {
        accountService.register(account,
        function(webData, piData) {
            alert("User Registered Sucessfully");
            sessionService.login(account,
                function(webAcc, piAcc) {
                    alert("User Login Sucessfull");

                    accountService.updateKey(
                      function(webAccKey, piAccKey) {
                          alert("Key update sucessfull");
                          
                          accountService.updateRemoteKey(webAccKey,piAccKey,
                            function(data) {
                                alert("Remote Key update sucessfull");

                                accountService.getCurrLogin(
                                  function(data) {
                                        $scope.account = data;
                                        loginUser.encryption = data.encryption;
                                        $state.go("tab.production");
                                      },
                                  function() {
                                      alert("Error getting current user");
                                  });
                                
                            },
                            function() {
                                alert("error logging in - updateKey");
                            });

                      },
                      function() {
                          alert("error logging in - updateKey");
                      });

                    
                },
                function() {
                    alert("error logging in - RegisterCtrl");
                });
            },
        function() {
            alert("Error registering user");
        });
    };
})
.controller("ProfileCtrl", function($scope, $state, accountService,loginUser,sessionService) {
  $scope.$on('$ionicView.beforeEnter', function(e) {
    accountService.getCurrLogin(
          function(data) {
                $scope.account = data;
              },
          function() {
              alert("Error getting current user");
          });
  });

  $scope.genkey = function(account) {  
    accountService.updateKey(
      function(webAccKey, piAccKey) {
          alert("Key update sucessfull");
          accountService.updateRemoteKey(webAccKey,piAccKey,
            function(data) {
                alert("Remote Key update sucessfull");
            },
            function() {
                alert("error logging in - updateKey");
            });

      },
      function() {
          alert("error logging in - updateKey");
      });
    };
    $scope.update = function(account) {   
          alert("To Be Implemented");
    };
    $scope.signout = function(account) {   
          sessionService.logout();
          $state.go("signin");
    };
})
.controller("LogCtrl", function($scope, $state, $localStorage) {
  $scope.$on('$ionicView.beforeEnter', function(e) {
    $scope.data = $localStorage.message;
  });
  $scope.clear = function() {
    $localStorage.message = "";
    $scope.data = $localStorage.message;
  };
})
.controller('ProductionCtrl', function($scope, productionService,$state, $localStorage) {
  
  $scope.$on('$ionicView.beforeEnter', function(e) {
    //$localStorage.message = $localStorage.message + "Entering ProductionList";
    productionService.getAllProds(
          function(prods) {
                $scope.prods = prods.productions;
                //$state.go("tab.production");
              },
          function() {
              alert("Error saving prod");
          });
  });
  
  $scope.remove = function(prod) {
    productionService.deleteProd(prod.rid,
          function(prod) {
                //$scope.prods.splice($scope.prods.indexOf(chat), 1);
                alert("Prod Removed");
                
              },
          function() {
              alert("Error removing prod");
          });
          $state.go($state.current, {}, {reload: true});
  };
})

.controller('ProductionDetailCtrl', function($scope, $stateParams,productionService,$state, $localStorage) {
  if($stateParams.prodId){
                     
    productionService.getProd($stateParams.prodId,
          function(prod) {
                $scope.prod = prod;
              },
          function() {
              alert("Error getting prod");
          });
  }
  $scope.saveOrUpdate = function(prod) {
    $localStorage.message = $localStorage.message + "Saving Production";
        if(prod.rid==null) {
          productionService.createProduction(prod,
          function(prodData) {
                $state.go("tab.production");
              },
          function() {
              alert("No Access");
          });

        }
        else{
          productionService.updateProduction(prod,
          function(prodData) {
                $state.go("tab.production");
              },
          function() {
              alert("No Access");
          });
        }
    };
})
.controller('SalesCtrl', function($scope, salesService,$state, $localStorage) {
  
  $scope.$on('$ionicView.beforeEnter', function(e) {
    //$localStorage.message = $localStorage.message + "Entering SalesList";
    salesService.getAllSaless(
          function(saless) {
                $scope.saless = saless.saless;
                //$state.go("tab.sales");
              },
          function() {
              alert("No Access");
          });
  });
  
  $scope.remove = function(sales) {
    salesService.deleteSales(sales.rid,
          function(sales) {
                //$scope.saless.splice($scope.saless.indexOf(chat), 1);
                alert("Sales Removed");
                
              },
          function() {
              alert("No Access");
          });
          $state.go($state.current, {}, {reload: true});
  };
})

.controller('SalesDetailCtrl', function($scope, $stateParams,salesService,$state, $localStorage) {
  if($stateParams.salesId){
                     
    salesService.getSales($stateParams.salesId,
          function(sales) {
                $scope.sales = sales;
              },
          function() {
              alert("No Access");
          });
  }
  $scope.saveOrUpdate = function(sales) {
    $localStorage.message = $localStorage.message + "Saving Sales";
        if(sales.rid==null) {
          salesService.createSales(sales,
          function(salesData) {
                $state.go("tab.sales");
              },
          function() {
              alert("No Access");
          });

        }
        else{
          salesService.updateSales(sales,
          function(salesData) {
                $state.go("tab.sales");
              },
          function() {
              alert("No Access");
          });
        }
    };
})

.controller('FinanceCtrl', function($scope, financeService,$state, $localStorage) {
  
  $scope.$on('$ionicView.beforeEnter', function(e) {
    //$localStorage.message = $localStorage.message + "Entering FinanceList";
    financeService.getAllFinances(
          function(finances) {
                $scope.finances = finances.finances;
                //$state.go("tab.finance");
              },
          function() {
              alert("No Access");
          });
  });
  
  $scope.remove = function(finance) {
    financeService.deleteFinance(finance.rid,
          function(finance) {
                //$scope.finances.splice($scope.finances.indexOf(chat), 1);
                alert("Finance Removed");
                
              },
          function() {
              alert("No Access");
          });
          $state.go($state.current, {}, {reload: true});
  };
})

.controller('FinanceDetailCtrl', function($scope, $stateParams,financeService,$state, $localStorage) {
  if($stateParams.financeId){
                     
    financeService.getFinance($stateParams.financeId,
          function(finance) {
                $scope.finance = finance;
              },
          function() {
              alert("No Access");
          });
  }
  $scope.saveOrUpdate = function(finance) {
    $localStorage.message = $localStorage.message + "Saving Finance";
        if(finance.rid==null) {
          financeService.createFinance(finance,
          function(financeData) {
                $state.go("tab.finance");
              },
          function() {
              alert("No Access");
          });

        }
        else{
          financeService.updateFinance(finance,
          function(financeData) {
                $state.go("tab.finance");
              },
          function() {
              alert("No Access");
          });
        }
    };
})
.controller('HRCtrl', function($scope, hrService,$state, $localStorage) {
  
  $scope.$on('$ionicView.beforeEnter', function(e) {
    //$localStorage.message = $localStorage.message + "Entering HRList";
    hrService.getAllHRs(
          function(hrs) {
                $scope.hrs = hrs.hrs;
                //$state.go("tab.hr");
              },
          function() {
              alert("No Access");
          });
  });
  
  $scope.remove = function(hr) {
    hrService.deleteHR(hr.rid,
          function(hr) {
                //$scope.hrs.splice($scope.hrs.indexOf(chat), 1);
                alert("HR Removed");
                
              },
          function() {
              alert("No Access");
          });
          $state.go($state.current, {}, {reload: true});
  };
})

.controller('HRDetailCtrl', function($scope, $stateParams,hrService,$state, $localStorage) {
  if($stateParams.hrId){
                     
    hrService.getHR($stateParams.hrId,
          function(hr) {
                $scope.hr = hr;
              },
          function() {
              alert("No Access");
          });
  }
  $scope.saveOrUpdate = function(hr) {
    $localStorage.message = $localStorage.message + "Saving HR";
        if(hr.rid==null) {
          hrService.createHR(hr,
          function(hrData) {
                $state.go("tab.hr");
              },
          function() {
              alert("No Access");
          });

        }
        else{
          hrService.updateHR(hr,
          function(hrData) {
                $state.go("tab.hr");
              },
          function() {
              alert("No Access");
          });
        }
    };
})
;
