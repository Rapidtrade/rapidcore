coreApp.controller("DayEndActivitiesCtrl",function($scope,$http,$location,$routeParams,GlobalSvc,Settings,$alert){
    $scope.DayEndActivities=[];
    $scope.dayEndActivity = {};
    function fetchDayEndActivities(){
        delete $scope.errorMsg;
        delete $scope.successMsg;
        var url= Settings.url + 'GetStoredProc?StoredProc=usp_dayendactivities_readlist&params=('+ GlobalSvc.getUser().SupplierID+')';
        $http.get (url)
        .success(function(data){
            sessionStorage.setItem('dayEndActivitiesCache',JSON.stringify(data));
            $scope.DayEndActivities = data;
            console.log(data);
            $scope.$emit('UNLOAD');
        })
        .error(function(error){
            $scope.errorMsg = "Issue.";
            $scope.$emit('UNLOAD');
        })
    };
    function getParentList(){
        $scope.dayEndActivityParents = [];
        var dayendact = JSON.parse(sessionStorage.getItem('dayEndActivitiesCache'));
        for(var i = 0; i < dayendact.length; i++){
            if(dayendact[i].isParent){$scope.dayEndActivityParents.push(dayendact[i])}
        }
    }

    function fetchDayEndActivity(){
        delete $scope.errorMsg;
        delete $scope.successMsg;
        var url= Settings.url + "GetStoredProc?StoredProc=usp_dayendactivities_readsingle&params=(" + GlobalSvc.getUser().SupplierID + "|'" + $scope.dayEndTypeID + "')";
        $http.get (url)
        .success(function(data){
            $scope.dayEndActivity = data[0];
            console.log(data);
            $scope.$emit ('UNLOAD');
        })
        .error(function(error){
            $scope.errorMsg = "Issue";
            $scope.$emit('UNLOAD');
        })
    };
    function newDayEndActivityObject(){
        $scope.dayEndActivity = {
            SupplierID : GlobalSvc.getUser().SupplierID,
            DayEndTypeID: '',
            ParentID: '',
            Description: '',
            isParent: false,
        };
        $scope.$emit('UNLOAD');
    };
    function saveDayEndActivity(){
      delete $scope.errorMsg;
      delete $scope.successMsg;
      $scope.$emit('LOAD')
      var success = function(){
            $location.path("/dayendactivities");
            if($scope.dayEndActivity.Deleted === 0){
                $alert({content: 'Day End Activity has been saved' , duration: 4, placement: 'top-right', type: 'success', show: true});
            }
            else{
                $alert({content: 'Day End Activity has been deleted' , duration: 4, placement: 'top-right', type: 'success', show: true});
            }
            $scope.$emit('UNLOAD');
            $scope.$apply();
          };

      var error = function (){
        $location.path("/dayendactivities");
        if($scope.dayEndActivity.Deleted !== 0){
          $alert({content: 'Error saving Day End Activity' , duration: 4, placement: 'top-right', type: 'error', show: true});
        }
        else{
          $alert({content: 'Error deleting Day End Activity' , duration: 4, placement: 'top-right', type: 'error', show: true});
        }
      };
      sessionStorage.removeItem('dayEndActivitiesCache');
      var url = Settings.url + 'StoredProcModify?StoredProc=usp_DayEndActivities_modify';
      GlobalSvc.postData(url, $scope.dayEndActivity,success,error, 'dayendactivities', 'Modify', false, false);
      $scope.$spply();
    };

    $scope.saveDayEndActivity = function() {
         $scope.dayEndActivity.Deleted = 0;
         saveDayEndActivity();
    };
    $scope.deleteDayEndActivity = function(){
        $scope.dayEndActivity.Deleted = 1;
        saveDayEndActivity();
    };
    function constructor(){
        var user = GlobalSvc.getUser();

        if(!user.IsAdmin){
            $scope.errorMsg = 'You are not authorised....';
            return;
        };

        if(!$routeParams.mode && !$routeParams.id){
           $scope.$emit('LOAD');
           $scope.mode = 'list';
           $scope.$emit('heading',{heading: 'Day End Activities', icon: 'fa fa-calendar-check-o'});
           $scope.$emit('right',{label: 'New', icon:'glyphicon glyphicon-plus', href:'#/dayendactivities/form/new'});
           $scope.mode = 'list';
           fetchDayEndActivities();
        }else{
            $scope.id = $routeParams.id;
            $scope.$emit('LOAD');
            $scope.$emit('heading',{heading: 'Day End Activity', icon: 'fa fa-calendar-check-o'});
            $scope.$emit('left',{label: 'Back', icon: 'glyphicon glyphicon-chevron-left', onclick : function(){window.history.back();}});
            $scope.$emit('right',{label: 'Save', icon: 'glyphicon glyphicon-floppy-save', onclick : $scope.saveDayEndActivity })
            $scope.mode = 'form';
            getParentList();
            if($routeParams.id !== 'new'){
                $scope.DisabledID= true;
                $scope.dayEndTypeID = $routeParams.id;
                fetchDayEndActivity();
            }else{
                $scope.deleteID = true;
                newDayEndActivityObject();
            }
        }
    }
    constructor();
});
