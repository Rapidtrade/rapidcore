coreApp.controller("LogoutCtrl", function ($scope, DaoSvc, $location,$route) {
    $scope.logout = function(){
        
        //DaoSvc.deleteDB(function(){window.location.reload(true);});    //$location.path("/#");});
        DaoSvc.deleteDB(function(){window.location.reload(true);});
        $scope.loggedIn = false;
    };
    
    $scope.back = function(){
        $location.path('/welcome');
    };
});
