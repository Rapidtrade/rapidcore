coreApp.controller("SyncCtrl", function ($scope, GlobalSvc, $location, $http, SyncSvc, Settings) {
    $scope.user = GlobalSvc.getUser(); 
    $scope.message = undefined;
    $scope.errormessage = undefined;
    $scope.syncProgress = [];
    $scope.hasUser = false;
	
    $scope.loginClicked = function(){
        GlobalSvc.busy(true);
        $scope.message = 'Verifying user details';
        $scope.errormessage = undefined;
        var url = Settings.url + 'Users/VerifyPassword?userID=' + this.user.UserID + '&password=' + this.user.Password + '&format=json';
        //g_ajaxget(url, this.fetchUserOnSuccess, this.fetchUserOnError);
        $http({method: 'GET', url: url})
        .success(function(json, status, headers, config) {
	    var status = Boolean(json.Status);
	    if (status) {
                $scope.errormessage = undefined;
                $scope.message = 'User verified, downloading data...';
                localStorage.setItem('currentUser',JSON.stringify(json.UserInfo));
                SyncSvc.sync(GlobalSvc.getUser().SupplierID, GlobalSvc.getUser().UserID, $scope);
                //$location.path('/main');
                //loginjs.getInstance().sync();
	    } else {
	        GlobalSvc.busy(true);
	        $scope.errormessage = 'Wrong password, please try again.';
                $scope.message = undefined;
	    }
        })
        .error(function(data, status, headers, config) {
            $scope.errormessage = 'Issue.';
            $scope.message = undefined;
        });
    };
    
    $scope.addProgress = function(msg){
        $scope.syncProgress.push(msg);
    };

}); 

var g_indexedDB = false;