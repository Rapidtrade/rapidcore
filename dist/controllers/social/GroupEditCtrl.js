coreApp.controller("GroupEditCtrl", function ($scope, GlobalSvc, $location, Settings, $routeParams, $http) {
    
    $scope.onfetch = function(json){ 
        json.push({Area: "",
            GroupID: 'join',
            Name: "Join a Group",
            SupplierID: "SGA",
            image: "img/add.png",
            Tel: ""}
        );               
        return json;
    };
    $scope.delete = function(){
        if (confirm('Are you sure you want to delete?')) $scope.save('delete');
    };
    
    $scope.save = function(type){
        $scope.$emit('LOAD');
        delete $scope.errorMsg;
        delete $scope.successMsg;
        
        if (!type) type = $routeParams.id === 'new' ? 'insert' : 'update';
        var url = GlobalSvc.resturl() + 'View/ModifyAll?table=Groups&type=' + type;
        
        GlobalSvc.postData(url,
            $scope.group,
            function(){
                $scope.$emit('UNLOAD');
                $scope.successMsg = 'Saved OK';
                if (type==='delete') {
                    alert('Your group was deleted');
                    $location.path('/groups');
                    $scope.$apply();
                } else {
                    if (type==='insert') fetchNewGroup();
                    $scope.$apply();
                }    
            },
            function(err){
                $scope.$emit('UNLOAD');
                $scope.errorMsg = data;
                $scope.$apply();
        },
        'Groups',type,false,true);
    };
    
    /*
     * Since groupID's are assigned after inserting, we need to fetch last added record to see group.
     * Then call groupedit
     */
    function fetchNewGroup(){
        var url = Settings.url + 'GetStoredProc?StoredProc=social_group_readlast&params=(' + GlobalSvc.getUser().SupplierID + ')';       
        $http({method: 'GET', url: url})
            .success(function(json) {
                saveUserGroup(json[0].GroupID);
            })
            .error(function(data, status, headers, config) {
                $scope.errorMsg = data;
                $scope.$emit('UNLOAD');
            });       
    };
    
    $scope.postImage = function (){
        $scope.$emit('LOAD');
        var onComplete = function(par1){
            location.reload();
        };
        var onError = function(err){
            $scope.$emit('UNLOAD');
            $scope.errMsg = err;
        };
        GlobalSvc.postImage(GlobalSvc.getUser().SupplierID, 'GROUP' + $scope.group.GroupID, $('#file-select')[0], onComplete, onError);
    };
    
    function newObject(){
        $scope.group = {Area: "",
            GroupID: '',
            Name: "",
            SupplierID: "SGA",
            Tel: ""};
        //JsonFormSvc.buildForm($scope, 'group', 'group', false, true, 'view', 'form', undefined, $scope.group );
        fetchGroupImage($scope.group.GroupID);
    };
    
    function newUGObject(groupID){
        return {
            SupplierID: GlobalSvc.getUser().SupplierID,
            GroupID: groupID,
            UserID: GlobalSvc.getUser().UserID,
            IsAdmin: 1,
            Accepted: 1
        };
    };
    
    /*
     * Fetch the last group created so we can get the GroupID
     */
    function fetchGroup(){
        var url = Settings.url + 'GetView?view=Groups&params=Where%20GroupID%20=%20' + $routeParams.id;       
        $http({method: 'GET', url: url})
            .success(function(json) {
                $scope.group = json[0];
                fetchGroupImage($scope.group.GroupID);
                $scope.$emit('UNLOAD');
            })
            .error(function(data) {
                $scope.errorMsg = data;
                $scope.$emit('UNLOAD');
            });       
    };
    
    /*
     * When creating a group, also enter this user as the first groupuser administrator
     */
    function saveUserGroup(groupID){
        console.log('saving usergroup');
        delete $scope.errorMsg;
        delete $scope.successMsg;        
        var url = GlobalSvc.resturl() + 'View/ModifyAll?table=GroupUsers&type=insert';        
        var obj = newUGObject(groupID);

        GlobalSvc.postData(url,
            obj,
            function(){
                console.log('saved going to /groupedit/' + groupID);
                $location.path('/groupedit/' + groupID);
                $scope.$apply();
            },
            function(err){
                $scope.$emit('UNLOAD');
                $scope.errorMsg = err;
                $scope.$apply();
        },
        'Groups','insert',false,true);
    };
    
    
    function fetchGroupImage(ID){
        var key = ID;
        if (sessionStorage.getItem(key)) {
            $scope.groupIMG = sessionStorage.getItem(key);
            $scope.$apply();
            return;
        } 
        
        var url = Settings.imageUrl + '?id=GROUP' + key + '&supplierID=SGA&width=150&height=150';       
        $http({method: 'GET', url: url})
            .success(function(json) {
                if (json.indexOf('Not Found') === -1){
                    $scope.groupIMG = url;
                    sessionStorage.setItem(key, url);
                    $scope.$apply();
                } else {
                    delete $scope.groupIMG;
                }
            })
            .error(function(data, status, headers, config) {
                delete $scope.groupIMG;
            });
    };
    

    function constructor(){
        window.scrollTo(0, 0);
        $scope.groupIMG = 'none';
        $scope.id = $routeParams.id;
        $scope.$emit('left',{label: 'Cancel' , icon : 'fa fa-chevron-left', onclick: function(){window.history.back();}}); 
        $scope.$emit('heading',{heading: 'Edit' , icon : 'fa fa-users'});
        $scope.$emit('right',{label: 'Save' , icon : 'fa fa-save', onclick : $scope.save}); 
        if ($routeParams.id === 'new')
            newObject();
        else
            fetchGroup();            
    }   
    constructor();
});