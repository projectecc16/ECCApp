app
.value('eccConstants', {
    webUrlBase: 'https://eccweb.herokuapp.com/',
    //webUrlBase: 'http://eccweb-ksquareapps.rhcloud.com',
    piUrlBase: 'https://eccpi.herokuapp.com/'
  })
.value('loginUser', {
    encryption: false
  })
.factory('TokenStorage', function() {
    var storageKey = 'auth_token';
    var storageKeyPi = 'auth_token_pi';

    return {        
        store : function(token) {
            return localStorage.setItem(storageKey, token);
        },
        storePi : function(token) {
            return localStorage.setItem(storageKeyPi, token);
        },
        retrieve : function() {
            return localStorage.getItem(storageKey);
        },
        retrievePi : function() {
            return localStorage.getItem(storageKeyPi);
        },
        clear : function() {
            return localStorage.removeItem(storageKey);
        },
        clearPi : function() {
            return localStorage.removeItem(storageKeyPi);
        }
    };
}).factory('TokenAuthInterceptor', function($q, TokenStorage,eccConstants,$localStorage,$filter) {
    return {
        request: function(config) {
            var authToken;
            var app;
            if(config.url.indexOf(eccConstants.webUrlBase)!=-1){
                authToken = TokenStorage.retrieve();   
            }
            else if(config.url.indexOf(eccConstants.piUrlBase)!=-1){
                authToken = TokenStorage.retrievePi(); 
            }
            if(config.url.indexOf("rest")!=-1){
                var dtVal = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:sss' ) 
                var configData;
                if(config.data){
                    configData = angular.toJson(config.data);
                }
                if(angular.isUndefined($localStorage.message)){
                    $localStorage.message="";
                }
                $localStorage.message = $localStorage.message +"<b>["+dtVal+"]</b> <br/>";
                $localStorage.message = $localStorage.message +"Request URL: "+ config.url + " <BR/>";
                $localStorage.message = $localStorage.message +"Request Data: "+ configData + " <BR/>";;
            }
            if (authToken) {
                config.headers['X-AUTH-TOKEN'] = authToken;
            }
            return config;
        },
        response: function(response) {
            var config = response.config;
            if(config.url.indexOf("rest")!=-1){
                var dtVal = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:sss' ) 
                var responseData;
                if(response.data){
                    responseData = angular.toJson(response.data);
                }
                if(angular.isUndefined($localStorage.message)){
                    $localStorage.message="";
                }
                $localStorage.message = $localStorage.message +"<b>["+dtVal+"]</b> <br/>";
                $localStorage.message = $localStorage.message +"Response URL: "+ config.url + " <BR/>";
                $localStorage.message = $localStorage.message +"Response Data: "+ responseData + " <BR/>";;
            }
          return response;
        },
        responseError: function(error) {
            // if (error.status === 401 || error.status === 403) {
            //     TokenStorage.clear();
            //     TokenStorage.clearPi();
            // }
            return $q.reject(error);
        }
    };
})
.factory('sessionService', function($http,eccConstants,TokenStorage,$localStorage,loginUser) {
    var session = {};

    session.login = function (data, success, failure) {
         TokenStorage.clear();   
        $localStorage.message = "";
        loginUser.encryption=false;
         $http.post(eccConstants.webUrlBase +"/rest/login"
            , "name=" + data.name + "&password=" + data.password, 
            {headers: {'Content-Type': 'application/x-www-form-urlencoded'}} 
         ).
            success(function (result, status, headers) {
                // alert("Sucess-Login");
                $http.post(eccConstants.piUrlBase +"/rest/login"
                    , "name=" + data.name + "&password=" + data.password, 
                    {headers: {'Content-Type': 'application/x-www-form-urlencoded'}} 
                ).
                    success(function (resultPi, statusPi, headersPi) {
                        // alert("Sucess-Login");
                        TokenStorage.store(headers('X-AUTH-TOKEN'));
                        TokenStorage.storePi(headersPi('X-AUTH-TOKEN'));
                        success(result,resultPi);
                    })
                    .error(function (resultPi, statusPi, headersPi) {
                        alert("Error-Login-Pi");
                        TokenStorage.clear();
                        failure();
                    }); 
            })
            .error(function (result, status, headers) {
                alert("Error-Login-Web");
                TokenStorage.clear();
                failure();
        });  
    };

    session.logout = function () {
        // Just clear the local storage
        TokenStorage.clear();   
        $localStorage.message = "";
        loginUser.encryption=false;
    };


    // session.isLoggedIn = function() {
    //     return localStorage.getItem("session") !== null;
    // };
    return session;
})


.factory('accountService', function($resource,eccConstants) {
    var service = {};
    service.register = function(account, success, failure) {
        var Account = $resource(eccConstants.webUrlBase+ "/rest/accounts");
        Account.save({}, account,
            function(webData){
                var AccountPi = $resource(eccConstants.piUrlBase+ "/rest/accounts");
                AccountPi.save({}, account,
                function(piData){
                    success(webData,piData);
                }, 
                function(){
                    alert("Register error Pi");
                    failure();
                });
            }, 
            function(){
                alert("Register error Web");
                failure();
            });
    };

    service.updateKey = function(success, failure) {
        var Account = $resource(eccConstants.webUrlBase+ "/rest/accounts/key",null,
                        {
                            'update': { method:'PATCH' }
                        });
        Account.update({}, {},
            function(webData){
                var AccountPi = $resource(eccConstants.piUrlBase+ "/rest/accounts/key",null,
                        {
                            'update': { method:'PATCH' }
                        });
                AccountPi.update({}, {},
                function(piData){
                    success(webData,piData);
                }, 
                function(){
                    alert("Error - Update key Pi");
                    failure();
                });
            }, 
            function(){
                alert("Error - Update key Web");
                failure();
            });
    };

    service.updateRemoteKey = function(accountWeb, accountPi, success, failure) {
        var Account = $resource(eccConstants.webUrlBase+ "/rest/accounts/remoteKey",null,
                        {
                            'update': { method:'PATCH' }
                        });
        Account.update({}, accountPi,
            function(webData){
                var AccountPi = $resource(eccConstants.piUrlBase+ "/rest/accounts/remoteKey",null,
                        {
                            'update': { method:'PATCH' }
                        });
                AccountPi.update({}, accountWeb,
                function(piData){
                    success(webData,piData);
                }, 
                function(){
                    alert("Error - Update Remote key Pi");
                    failure();
                });
            }, 
            function(){
                alert("Error - Update Remote key Web");
                failure();
            });
    };
    service.getAccountById = function(accountId) {
        var Account = $resource(eccConstants.webUrlBase + "/rest/accounts/:paramAccountId");
        return Account.get({paramAccountId:accountId}).$promise;
    };
    service.userExists = function(account, success, failure) {

        var Account = $resource(eccConstants.webUrlBase + "/rest/accounts");
        var data = Account.get({name:account.name}, function() {
            if(data.name !== null) {
                success(data);
            } else {
                failure();
            }
        },
        failure);
    };
    service.getAllAccounts = function() {
          var Account = $resource(eccConstants.webUrlBase + "/rest/accounts");
          return Account.get().$promise.then(function(data) {
            return data.accounts;
          });
      };
      service.getCurrLogin = function(success,failure) {
        var Account = $resource(eccConstants.webUrlBase + "/rest/currLogin");
        return Account.get({},{},success,failure);
    };
    return service;
})
.factory('productionService', function($resource, $q,eccConstants,$localStorage,loginUser) {
    var service = {};

    service.createProduction = function(prodData, success, failure) {

        var Pi = $resource(eccConstants.piUrlBase + "/rest/crypto/enc");
        var Prod = $resource(eccConstants.webUrlBase + "/rest/app/productions");
        if(loginUser.encryption==true){
            var piData = {};
            piData.crypta = angular.toJson(prodData);
            Pi.save({}, piData, function(encData) {
                Prod.save({}, encData, success, failure);
            }, failure);
        }
        else{
            Prod.save({}, prodData, success, failure);
        }
        
        // var Prod = $resource(eccConstants.webUrlBase + "/rest/app/productions");
        // Prod.save({}, prodData, success, failure);
    };
    service.deleteProd = function(prodId,success,failure) {
        var Prod = $resource(eccConstants.webUrlBase + "/rest/app/productions/:paramProdId");
        return Prod.delete({paramProdId:prodId},{},success,failure);
    };
    service.updateProduction = function(prodData, success, failure) {

        var Pi = $resource(eccConstants.piUrlBase + "/rest/crypto/enc");
        var Prod = $resource(eccConstants.webUrlBase + "/rest/app/productions/:paramProdId",null,
            {
                'update': { method:'PUT' }
            });
        if(loginUser.encryption==true){
            var piData = {};
            piData.crypta = angular.toJson(prodData);
            Pi.save({}, piData, function(encData) {
                Prod.update({paramProdId:prodData.rid}, encData, success, failure);
            }, failure);
        }
        else{
            Prod.update({paramProdId:prodData.rid}, prodData, success, failure);
        }
    };
    
    service.getAllProds = function(success,failure) {
        var Prod = $resource(eccConstants.webUrlBase +"/rest/app/productions");
        Prod.get({}, {}, function(encData,header) {
            if(header('X-ENC-DATA')=='true'){
                var Pi = $resource(eccConstants.piUrlBase + "/rest/crypto/dec");
                Pi.save({}, encData, function(data){
                    var val = angular.fromJson(data.crypta);
                    success(val);
                }, failure);
            }
            else{
                success(encData)
            }
            
        },failure);
    };
    service.getProd = function(prodId,success,failure) {
        var Prod = $resource(eccConstants.webUrlBase + "/rest/app/productions/:paramProdId");
        return Prod.get({paramProdId:prodId},{},function(encData,header) {
            if(header('X-ENC-DATA')=='true'){
                var Pi = $resource(eccConstants.piUrlBase + "/rest/crypto/dec");
                Pi.save({}, encData, function(data){
                    var val = angular.fromJson(data.crypta);
                    success(val);
                }, failure);
            }
            else{
                success(encData)
            }
        },failure);
    };
    return service;
})
.factory('salesService', function($resource, $q,eccConstants,$localStorage,loginUser) {
    var service = {};

    service.createSales = function(salesData, success, failure) {

        var Pi = $resource(eccConstants.piUrlBase + "/rest/crypto/enc");
        var Sales = $resource(eccConstants.webUrlBase + "/rest/app/saless");
        if(loginUser.encryption==true){
            var piData = {};
            piData.crypta = angular.toJson(salesData);
            Pi.save({}, piData, function(encData) {
                Sales.save({}, encData, success, failure);
            }, failure);
        }
        else{
            Sales.save({}, salesData, success, failure);
        }
        
        // var Sales = $resource(eccConstants.webUrlBase + "/rest/app/saless");
        // Sales.save({}, salesData, success, failure);
    };
    service.deleteSales = function(salesId,success,failure) {
        var Sales = $resource(eccConstants.webUrlBase + "/rest/app/saless/:paramSalesId");
        return Sales.delete({paramSalesId:salesId},{},success,failure);
    };
    service.updateSales = function(salesData, success, failure) {

        var Pi = $resource(eccConstants.piUrlBase + "/rest/crypto/enc");
        var Sales = $resource(eccConstants.webUrlBase + "/rest/app/saless/:paramSalesId",null,
            {
                'update': { method:'PUT' }
            });
        if(loginUser.encryption==true){
            var piData = {};
            piData.crypta = angular.toJson(salesData);
            Pi.save({}, piData, function(encData) {
                Sales.update({paramSalesId:salesData.rid}, encData, success, failure);
            }, failure);
        }
        else{
            Sales.update({paramSalesId:salesData.rid}, salesData, success, failure);
        }
    };
    
    service.getAllSaless = function(success,failure) {
        var Sales = $resource(eccConstants.webUrlBase +"/rest/app/saless");
        Sales.get({}, {}, function(encData,header) {
            if(header('X-ENC-DATA')=='true'){
                var Pi = $resource(eccConstants.piUrlBase + "/rest/crypto/dec");
                Pi.save({}, encData, function(data){
                    var val = angular.fromJson(data.crypta);
                    success(val);
                }, failure);
            }
            else{
                success(encData)
            }
            
        },failure);
    };
    service.getSales = function(salesId,success,failure) {
        var Sales = $resource(eccConstants.webUrlBase + "/rest/app/saless/:paramSalesId");
        return Sales.get({paramSalesId:salesId},{},function(encData,header) {
            if(header('X-ENC-DATA')=='true'){
                var Pi = $resource(eccConstants.piUrlBase + "/rest/crypto/dec");
                Pi.save({}, encData, function(data){
                    var val = angular.fromJson(data.crypta);
                    success(val);
                }, failure);
            }
            else{
                success(encData)
            }
        },failure);
    };
    return service;
})
.factory('financeService', function($resource, $q,eccConstants,$localStorage,loginUser) {
    var service = {};

    service.createFinance = function(financeData, success, failure) {

        var Pi = $resource(eccConstants.piUrlBase + "/rest/crypto/enc");
        var Finance = $resource(eccConstants.webUrlBase + "/rest/app/finances");
        if(loginUser.encryption==true){
            var piData = {};
            piData.crypta = angular.toJson(financeData);
            Pi.save({}, piData, function(encData) {
                Finance.save({}, encData, success, failure);
            }, failure);
        }
        else{
            Finance.save({}, financeData, success, failure);
        }
        
        // var Finance = $resource(eccConstants.webUrlBase + "/rest/app/finances");
        // Finance.save({}, financeData, success, failure);
    };
    service.deleteFinance = function(financeId,success,failure) {
        var Finance = $resource(eccConstants.webUrlBase + "/rest/app/finances/:paramFinanceId");
        return Finance.delete({paramFinanceId:financeId},{},success,failure);
    };
    service.updateFinance = function(financeData, success, failure) {

        var Pi = $resource(eccConstants.piUrlBase + "/rest/crypto/enc");
        var Finance = $resource(eccConstants.webUrlBase + "/rest/app/finances/:paramFinanceId",null,
            {
                'update': { method:'PUT' }
            });
        if(loginUser.encryption==true){
            var piData = {};
            piData.crypta = angular.toJson(financeData);
            Pi.save({}, piData, function(encData) {
                Finance.update({paramFinanceId:financeData.rid}, encData, success, failure);
            }, failure);
        }
        else{
            Finance.update({paramFinanceId:financeData.rid}, financeData, success, failure);
        }
    };
    
    service.getAllFinances = function(success,failure) {
        var Finance = $resource(eccConstants.webUrlBase +"/rest/app/finances");
        Finance.get({}, {}, function(encData,header) {
            if(header('X-ENC-DATA')=='true'){
                var Pi = $resource(eccConstants.piUrlBase + "/rest/crypto/dec");
                Pi.save({}, encData, function(data){
                    var val = angular.fromJson(data.crypta);
                    success(val);
                }, failure);
            }
            else{
                success(encData)
            }
            
        },failure);
    };
    service.getFinance = function(financeId,success,failure) {
        var Finance = $resource(eccConstants.webUrlBase + "/rest/app/finances/:paramFinanceId");
        return Finance.get({paramFinanceId:financeId},{},function(encData,header) {
            if(header('X-ENC-DATA')=='true'){
                var Pi = $resource(eccConstants.piUrlBase + "/rest/crypto/dec");
                Pi.save({}, encData, function(data){
                    var val = angular.fromJson(data.crypta);
                    success(val);
                }, failure);
            }
            else{
                success(encData)
            }
        },failure);
    };
    return service;
})
.factory('hrService', function($resource, $q,eccConstants,$localStorage,loginUser) {
    var service = {};

    service.createHR = function(hrData, success, failure) {

        var Pi = $resource(eccConstants.piUrlBase + "/rest/crypto/enc");
        var HR = $resource(eccConstants.webUrlBase + "/rest/app/hrs");
        if(loginUser.encryption==true){
            var piData = {};
            piData.crypta = angular.toJson(hrData);
            Pi.save({}, piData, function(encData) {
                HR.save({}, encData, success, failure);
            }, failure);
        }
        else{
            HR.save({}, hrData, success, failure);
        }
        
        // var HR = $resource(eccConstants.webUrlBase + "/rest/app/hrs");
        // HR.save({}, hrData, success, failure);
    };
    service.deleteHR = function(hrId,success,failure) {
        var HR = $resource(eccConstants.webUrlBase + "/rest/app/hrs/:paramHRId");
        return HR.delete({paramHRId:hrId},{},success,failure);
    };
    service.updateHR = function(hrData, success, failure) {

        var Pi = $resource(eccConstants.piUrlBase + "/rest/crypto/enc");
        var HR = $resource(eccConstants.webUrlBase + "/rest/app/hrs/:paramHRId",null,
            {
                'update': { method:'PUT' }
            });
        if(loginUser.encryption==true){
            var piData = {};
            piData.crypta = angular.toJson(hrData);
            Pi.save({}, piData, function(encData) {
                HR.update({paramHRId:hrData.rid}, encData, success, failure);
            }, failure);
        }
        else{
            HR.update({paramHRId:hrData.rid}, hrData, success, failure);
        }
    };
    
    service.getAllHRs = function(success,failure) {
        var HR = $resource(eccConstants.webUrlBase +"/rest/app/hrs");
        HR.get({}, {}, function(encData,header) {
            if(header('X-ENC-DATA')=='true'){
                var Pi = $resource(eccConstants.piUrlBase + "/rest/crypto/dec");
                Pi.save({}, encData, function(data){
                    var val = angular.fromJson(data.crypta);
                    success(val);
                }, failure);
            }
            else{
                success(encData)
            }
            
        },failure);
    };
    service.getHR = function(hrId,success,failure) {
        var HR = $resource(eccConstants.webUrlBase + "/rest/app/hrs/:paramHRId");
        return HR.get({paramHRId:hrId},{},function(encData,header) {
            if(header('X-ENC-DATA')=='true'){
                var Pi = $resource(eccConstants.piUrlBase + "/rest/crypto/dec");
                Pi.save({}, encData, function(data){
                    var val = angular.fromJson(data.crypta);
                    success(val);
                }, failure);
            }
            else{
                success(encData)
            }
        },failure);
    };
    return service;
})
// .factory('CryptoInterceptor', function($q, $injector,TokenStorage,eccConstants) {
//     return {
//         request: function(config) {

//             if(config.url.indexOf(eccConstants.webUrlBase+ "/rest/app")!=-1){
//                 if(config.data){
//                     var piData={};
//                     piData.decData = angular.toJson(config.data);
//                     piData.encData = ""; //JSON.stringify(config.data);
//                     var $resource = $injector.get('$resource');
//                     var Pi = $resource(eccConstants.piUrlBase + "/rest/crypto/enc");
//                     Pi.save({}, piData, function(data) {
//                         console.dir(data);
//                         alert("Hurray");
//                     }, function() {alert("Shi...");});
//                     // console.dir($resource);
//                 }
                
//              }
//             return config;
//         },
//         response: function(response) {
          
//             return response;
//         },
//         responseError: function(error) {
//             return $q.reject(error);
//         }
//     };
// })

;
