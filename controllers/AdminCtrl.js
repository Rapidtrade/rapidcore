
coreApp.controller("AdminMenuCtrl", function ($scope) {
	function constructor(){
		$scope.$emit('heading',{heading: 'Administration' , icon : 'glyphicon glyphicon-wrench'});
	}
	constructor();
});

coreApp.controller("ActivityTypesCtrl", function ($scope,$location,GlobalSvc,Settings,$routeParams,$http,$alert) {
	
	$scope.form = {
		newFreeAttribute: ""
	};
	
	$scope.saveObject = function(){
		if ($scope.object.FieldType===4) {
	    	$scope.object.DefaultData = '';
	    	var comma = ''; 
	    	for (var x=0; x < $scope.options.length; x++){
	    		$scope.object.DefaultData = $scope.object.DefaultData + comma + $scope.options[x] ;
	    		comma = ',';
	    	}
		}
		
		var success = function() {
			$alert({content: 'Your Activity has been ' + ($scope.object.Deleted ? 'deleted':'saved'), duration:4, placement:'top-right', type:'success', show:true});
			if ($scope.object.Deleted) $location.path('/activitytypes');
		};
		var error = function(err){
			$alert({content: err.responseText, duration:6, placement:'top-right', type:'danger', show:true});
		};
		
        var url = Settings.url + 'StoredProcModify?StoredProc=usp_eventtype_modify';
        GlobalSvc.postData(url,$scope.object,success,error,'Values','Modify',true,true);             
	};
	
	$scope.deleteObject = function(){
		if (!confirm('Are you sure?')) return;
		$scope.object.Deleted = true;
		$scope.saveObject();
	};
	
	function newObject(){
        $scope.object = {
        		SupplierID: GlobalSvc.getUser().SupplierID,
        		EventID: GlobalSvc.getGUID(),
        		FollowOnEventTypeID:"",
        		KpiGroupID:"",
        		TargetTypeID:"",
        		FieldType:0,
        		Label:"",
        		DueDateAllowed:false,
        		DueTimeAllowed:false,
        		DefaultData:"",
        		Size:0, 
        		ForAccntGrp:"",
        		ForAccntID:"",
        		KPITypeID:"",
        		KPIVersionID:"",
        		SendToCalendar:false,
        		LongDescription:"",
        		KPIAddData:false,
        		EventGroup:"2",
        		AllowNote:true,
        		Deleted:false,
        		AllowGPS:true,
        		AllowPicture:true,
        		AllowContact:true,
        		UpdateCompanyField:"",
        		SortOrder:0,
        		Icon:"",
        		Notifications:""};
        $scope.$emit('UNLOAD');
    };
    
    function fetchList(){ 
    	var user = GlobalSvc.getUser();
        var url = Settings.url + 'GetStoredProc?StoredProc=usp_eventtype_readlistonly&params=('+ user.SupplierID +')';
        console.log(url);
        $http.get(url).success(function(data){
            $scope.list = data;
            sessionStorage.setItem('cacheEventtypes', JSON.stringify(data));
            $scope.$emit('UNLOAD');
        });
    };
    
    
    function fetchObject(){
    	var list = JSON.parse(sessionStorage.getItem('cacheEventtypes'));
    	$scope.object = list[$routeParams.id];
    	if ($scope.object.FieldType===4) $scope.options = $scope.object.DefaultData.split(',');
    };
    
    $scope.addListboxOption = function(){
    	if (!$scope.options) $scope.options = [];
    	$scope.options.push($scope.form.newFreeAttribute);
    	$scope.form.newFreeAttribute = "";
    	$alert({content: 'Option added, please remember to save.', duration:4, placement:'top-right', type:'warning', show:true});
    	
    };
    
    $scope.deleteListboxOption = function(index){
    	$scope.options.splice(index,1);
    };
    
    $scope.changeEventType = function(type){
    	if ($routeParams.id === 'new') $scope.object.FieldType = type;
    };
	
	function constructor(){
	       var user = GlobalSvc.getUser();
	       if(!user.IsAdmin){
	           $scope.errorMsg = 'You are not authorised....';
	           return;
	       }
	             
	       $scope.$emit('heading',{heading: 'Customer Activities' , icon : 'fa fa-rss'});            
	       if ($routeParams.mode && $routeParams.id) {
	           $scope.$emit('left',{label: 'Back' , icon : 'fa fa-chevron-left', onclick: function(){window.history.back();}}); 
	           $scope.$emit('right',{label: 'Save' , icon : 'fa fa-floppy-o', onclick: $scope.saveObject}); 
	           $scope.mode = 'form';
	           $scope.id = $routeParams.id;
	           if ($routeParams.id === 'new')
	               newObject();
	           else
	               fetchObject(); 
	       } else {
	           $scope.$emit('LOAD');
	           $scope.$emit('right',{label: 'New' , icon : 'fa fa-plus', href:'#/activitytypes/form/new'}); 
	           $scope.mode = 'list';
	           fetchList();
	       }       
	   };    

	   constructor();	
});


coreApp.controller('TreeCtrl',function($scope,$location,GlobalSvc,Settings,$routeParams,$http){
    $scope.trees = [];
    $scope.treeEdit = {};
    $scope.JSONField;
    $scope.mode = $routeParams.mode;
    $scope.options = [['form','table'],['edit','view','drilldown'],['glyphicon glyphicon-plus','glyphicon glyphicon user','glyphicon glyphicon-ok','glyphicon glyphicon-remove','glyphicon glyphicon-cog','glyphicon glyphicon-refresh','glyphicon glyphicon-floppy-saved','glyphicon glyphicon-floppy-remove','glyphicon glyphicon-floppy-save','glyphicon glyphicon-inbox', 'glyphicon glyphicon-home','glyphicon glyphicon-envelope','glyphicon glyphicon-calendar','glyphicon glyphicon-th-list','glyphicon glyphicon-search','glyphicon glyphicon-upload']];
    $scope.id = $routeParams.id;
    var user = GlobalSvc.getUser();

    $scope.save = function(){
        var url = Settings.url + 'StoredProcModify?StoredProc=usp_tree_modify';
        $scope.treeEdit.JSON = JSON.stringify($scope.JSONField);
        GlobalSvc.postData(url,$scope.treeEdit,function(){
            $location.path('/tree');
            //sessionStorage.removeItem("treeCache");
            $scope.$apply();
        },function(){
            console.log("Error .... ");
            $scope.$apply();
        },'tree','modify',false,true);
    };

    $scope.delete = function(){
        $scope.treeEdit.Deleted = 1;
        $scope.save();
    };

    function  makeJsonfieldObject(){
        //fix in place because JSON.parse has a problem convert json with single quotes to an object
        $scope.JSONField = JSON.parse($scope.treeEdit.JSON.replace(/'/g, '"'));
        $scope.JSONField.heading = $scope.JSONField.heading == undefined ? '' : $scope.JSONField.heading;
        $scope.JSONField.id = $scope.JSONField.id == undefined ? "mainmenu" : $scope.JSONField.id;
        $scope.JSONField.type =  $scope.JSONField.type == undefined ? '' :  $scope.JSONField.type;
        $scope.JSONField.nocache =  $scope.JSONField.nocache == undefined ? true :  $scope.JSONField.nocache;
        $scope.JSONField.mode = $scope.JSONField.mode == undefined ? '' : $scope.JSONField.mode;
        $scope.JSONField.url = $scope.JSONField.url == undefined ? '' : $scope.JSONField.url;
        $scope.JSONField.img = $scope.JSONField.img == undefined ? '' : $scope.JSONField.img;
        $scope.JSONField.canDelete = $scope.JSONField.canDelete == undefined ? '' : $scope.JSONField.canDelete;
        $scope.JSONField.drilldownid = $scope.JSONField.drilldownid == undefined ? '' : $scope.JSONField.drilldownid;
        $scope.JSONField.drilldownurl = $scope.JSONField.drilldownurl == undefined ? '' : $scope.JSONField.drilldownurl;
        $scope.JSONField.backbutton = $scope.JSONField.backbutton == undefined ? false : $scope.JSONField.backbutton;
    }

    function newTreeObject(){
        $scope.treeEdit = {
            Deleted : false,
            Description : "",
            HasChildren : false,
            JSON : "{'heading':'','id':'','type':'','nocache':true,'mode':'','url':''}",
            ParentTreeID : "mainmenu",
            SortOrder : 0,
            SupplierID : user.SupplierID,
            Tags : "",
            Tips :  "",
            TreeID : ""
        };
        $scope.$emit('UNLOAD');
    }

    function fetchTrees(){
        var url = Settings.url + 'GetStoredProc?StoredProc=usp_tree_readlist&params=('+ user.SupplierID +')';
        console.log(url);
        $http.get(url).success(function(data){
            $scope.trees = data;
            $scope.$emit('UNLOAD');
            //sessionStorage.setItem( "UsersCache",JSON.stringify($scope.trees) )
        });
    }

    function fetchTree(){
        var url = Settings.url + 'GetStoredProc?StoredProc=usp_tree_readsingle&params=('+ user.SupplierID + '|'  + $routeParams.id  +')';
        console.log(url);
        $http.get(url).success(function(data){
            //get the First Object because it comes back as array
            console.log(data[0]);
            $scope.treeEdit = data[0];
            //function that creates the Object for the Advanced Screen
            makeJsonfieldObject();
            console.log($scope.JSONField);
            $scope.$emit('UNLOAD');
        });
    }

    function constructor(){
        //This Checks if the user is an Administrator
        if(!user.IsAdmin){
            $scope.errorMsg = 'You are not authorised....';
            return;
        }
        $scope.$emit('LOAD');
        $scope.$emit('heading',{heading: 'Menu' , icon : 'fa fa-tree'});
        if($routeParams.mode && $routeParams.id){
            $scope.mode = 'form';
            $scope.$emit('left',{label: 'Back' , icon : 'glyphicon glyphicon-chevron-left', onclick: function(){window.history.back();}});
            $scope.$emit('right',{label: 'Save' , icon : 'glyphicon glyphicon-floppy-save', onclick : $scope.save});
            if($routeParams.id === 'new'){
                newTreeObject();
                makeJsonfieldObject();
            }else{
                $scope.id = $routeParams.id;
                fetchTree();
            }
        }else{
            $scope.$emit('right',{label : 'New Tree' , icon : 'glyphicon glyphicon-plus' , href: '#/tree/form/new'});
            $scope.mode = 'list';
            fetchTrees();
        };
    }
    constructor();
})

coreApp.controller("UserCtrl",function($scope,$route,$routeParams,$http,GlobalSvc,Settings,JsonFormSvc,$window,$location,$modal){
    $scope.$emit('heading',{heading: 'Users' , icon : 'fa fa-user'});
    $scope.users = [];
    $scope.userEdit = {};
    $scope.userRoleModal;
    $scope.checkboxs = {'isAdmin' : true};
    var savebtnClicked = false;
    var user = GlobalSvc.getUser();

    function newUserObject(){
        var newUser = {};
        newUser.SupplierID = user.SupplierID;
        newUser.UserID = "";
        newUser.PasswordHash = "";
        newUser.PasswordSalt = "";
        newUser.AddressID = "";
        newUser.IsLockedOut = "";
        newUser.LastLoginDate = "";
        newUser.FailedPasswordAttemptCount = "";
        newUser.Email = "";
        newUser.Country = "";
        newUser.Deleted = 0;
        newUser.RepID = "";
        newUser.Manager = "";
        newUser.IsAdmin = "";
        newUser.DailySummary = "";
        newUser.WeeklySummary = "";
        newUser.MonthlyKPI = "";
        newUser.AllCustomers = "";
        newUser.NumCustomers = "";
        newUser.Role = "";
        return newUser;
    }

    $scope.newClicked = function(){
        var newUser = newUserObject();
        sessionStorage.setItem('currentuseredit',JSON.stringify(newUser));
        $location.path('/users/form/new');
    };

    $scope.backbtnClicked = function(){
        window.history.back();
    };

    $scope.deleteUser = function(){
        success = function(){
            $scope.$emit('UNLOAD');
            $scope.successMsg = 'User Deleted OK';
            sessionStorage.removeItem("UsersCache");
            $location.path('/users/');
        };
        
        error = function(){
            $scope.$emit('UNLOAD');
            $scope.errorMsg = 'Error Deleting User';
            $location.path('/users/');
        };
        
        $scope.$emit('LOAD');
        var url = Settings.url + 'View/ModifyAll?table=users&type=delete';
        GlobalSvc.postData(url,$scope.userEdit,success,error,'users','modify',false,true);
    };

    $scope.saveUser = function(){
        savebtnClicked = true;
        if($routeParams.id === 'new'){
            //Checking if the user already exists //this Code Could Be Improved
            $http.get(Settings.url + 'GetStoredProc?StoredProc=usp_user_readsingle&params=("'+ $scope.userEdit.UserID +'")').success(function(data){
                //get the First Object because it comes back as array
                if(data.length){
                    delete $scope.errorMsg;
                    delete $scope.successMsg;
                    $scope.errorMsg = 'User Already Exists';
                    return;
                }else{
                    save();
                    sendMail();
                }
            });
        }else{
            save();
        }
    };
    
    function sendMail(){
        
    	var body = '<div><p>Hello ' + $scope.userEdit.Name + '. You have successfuly been registered to the ' + Settings.appName + ' website(' + Settings.siteUrl + '). Below are your login details. Enjoy! </p><p><b>Username: </b>' + $scope.userEdit.UserID + '</p><p><b>Password: </b>' + $scope.userEdit.PasswordHash + '<p>Kind Regards</p></div>';
    	console.log(body);
    	var url = 'http://107.21.55.154/testrest/rapidapi/RapidAPI/index.php/Send?userid=' + $scope.userEdit.UserID + '&subject= Login details for - ' + Settings.appName;
    	var onSuccess = function(){
    		$scope.$emit('UNLOAD');
    		$alert({content: 'Email has been sent', duration:4, placement:'top-right', type:'success', show:true});
            $scope.$apply();
    	};
    	console.log(url);
    	
    	var onError = function(err){
            $scope.$emit('UNLOAD');
            $alert({content: 'Error sending email', duration:4, placement:'top-right', type:'error', show:true});
            $scope.$apply();
        }
    	
    	$.ajax({
            type : 'POST',
            data : body,
            datatype : 'json',
            url : url,
            crossDomain: true,
            success : onSuccess,
            error : onError
        });
    	
    };

    $scope.userRoleClicked = function(){
        $scope.userRoleModal =  $modal({scope : $scope, title: 'User Roles', template: 'js/core/modal/userRole.html', show: true , animation: "am-fade-and-slide-top",keyboard : false,backdrop : 'static'});
        $scope.vansalesuser = {'warehouse' : $scope.userEdit.warehouse, 'number' : $scope.userEdit.van};
        //Checking whether userrole is currently pod or vansales
        $scope.activetab = $scope.userEdit.PasswordSalt === 'POD' ? 'pod' : 'vansales';
    };

    $scope.userRoleSaveClicked = function(){
        if($scope.activetab === 'vansales'){
            //$scope.userEdit.PasswordSalt = "canInv,wh="+$scope.vansalesuser.warehouse+",van="+$scope.vansalesuser.number;
            sessionStorage.setItem('userRole',"canInv,wh="+$scope.vansalesuser.warehouse+",van="+$scope.vansalesuser.number);
            $scope.userRoleModal.$promise.then($scope.userRoleModal.hide);
        }else if($scope.activetab === 'pod'){
            sessionStorage.setItem('userRole',"POD");
            $scope.userRoleModal.$promise.then($scope.userRoleModal.hide);
        }
    };

    function fetchManagers(){
        $http.get(Settings.url+'GetView?view=users&params=Where%20supplierid%20=%20%27'+GlobalSvc.getUser().SupplierID+'%27%20and%20isManager%20=%201').success(function(data){
            $scope.managers = [];
            for(var i = 0; i < data.length; i++){
                $scope.managers.push(data[i].Name);
            }
            console.log($scope.managers);
        });
    }

    function save(){
        $scope.$emit('LOAD');
        sessionStorage.removeItem( "UsersCache");
        var url = Settings.url + 'StoredProcModify?StoredProc=usp_user_modify2';
        if(sessionStorage.getItem('userRole')){
            $scope.userEdit.PasswordSalt = sessionStorage.getItem('userRole');
            $scope.userEdit.Role = sessionStorage.getItem('userRole');
            sessionStorage.removeItem('userRole');
        }
        GlobalSvc.postData(url,$scope.userEdit,function(){
            $scope.$emit('UNLOAD');
            $scope.successMsg = 'User saved ok';
            sessionStorage.removeItem("UsersCache");
            $scope.$apply();
        },function(){
            $scope.$emit('UNLOAD');
            $scope.errorMsg = 'Error Saving User';
            $scope.$apply();
        },'users','modify',false,true);
    }

    function fetchUsers(){
    	if (sessionStorage.getItem( "UsersCache")) {
    		$scope.users = JSON.parse(sessionStorage.getItem( "UsersCache"));
    		$scope.$emit('UNLOAD');
    	} else {
	        var url = Settings.url + 'GetStoredProc?StoredProc=usp_user_readlist&params=('+ user.SupplierID +')';
	        console.log(url);
	        $http.get(url).success(function(data){
	            $scope.users = data;
	            $scope.$emit('UNLOAD');
	            sessionStorage.setItem( "UsersCache",JSON.stringify($scope.users) );
	        });
    	}
    }

    function fetchUser(userid){
        userid = userid || $routeParams.id;
        if($routeParams.id === 'new' && !savebtnClicked){
            //newUserObject();
            //$scope.userEdit = JSON.parse(sessionStorage.getItem('currentuseredit'));
            $scope.userEdit = newUserObject();
            $scope.$emit('UNLOAD');
        }else{
            var url = Settings.url + 'GetStoredProc?StoredProc=usp_user_readsingle&params=("'+ userid +'")';
            console.log(url);
            $http.get(url).success(function(data){
                //get the First Object because it comes back because it is what stores the user data
                $scope.userEdit = data[0];
                /*
                 this piece of code deals with the Separation of the userRole field
                 $scope.userEdit.warehouse and $scope.userEdit.van are created so
                 we can bind them to the modal
                 the spilt just separate the the three different fields into an array
                 and than the values to be bound to the screen is substringed it out
                 */
                if($scope.userEdit.PasswordSalt !== 'POD' && $scope.userEdit.PasswordSalt !== '' && $scope.userEdit.PasswordSalt !== null){
                    var passwordSalt = $scope.userEdit.PasswordSalt.split(',');
                    $scope.userEdit.warehouse = passwordSalt[1].substr(passwordSalt[1].indexOf('=')+ 1);
                    $scope.userEdit.van = passwordSalt[2].substr(passwordSalt[1].indexOf('=')+ 2);
                    console.log($scope.userEdit.warehouse);
                    console.log($scope.userEdit.van);
                }
                $scope.$emit('UNLOAD');
            });
        }
    }

    function constructor(){
        if(!user.IsAdmin){
            $scope.errorMsg = 'You are not authorised....';
            return;
        }
        
        $scope.$emit('LOAD');            
        if ($routeParams.mode && $routeParams.id) {
        	$scope.$emit('left',{label: 'Back' , icon : 'glyphicon glyphicon-chevron-left', onclick: function(){window.history.back();}}); 
            $scope.$emit('right',{label: 'Save' , icon : 'glyphicon glyphicon-floppy-save', onclick: $scope.saveUser}); 
            $scope.mode = 'form';
            $scope.id = $routeParams.id;
            fetchManagers();
            fetchUser();
        } else {
            $scope.$emit('right',{label: 'New' , icon : 'glyphicon glyphicon-plus', href : "#/users/form/new"});
            $scope.mode = 'list';
            fetchUsers();
        }       
    };
    
    constructor();
});

coreApp.controller("OptionsCtrl", function ($scope, GlobalSvc, DaoSvc, Settings, $routeParams, $http) {
    //$scope.mode = 'list';
    $scope.options = [];
    $scope.option = {};
    
    $scope.backClicked = function(){
        window.history.back();                       
    };
    
    $scope.save = function(){
        delete $scope.errorMsg;
        delete $scope.successMsg;
        $scope.$emit('LOAD');
        
        success = function(){
            if ($scope.option.Deleted) {
                $scope.successMsg = "Your option was Deleted...";
                newObject();
            } else    
                $scope.successMsg = "Your option was saved OK.";
            $scope.$emit('UNLOAD');
            $scope.$apply();
        };
        
        error = function(err){
            $scope.errorMsg = data;
            $scope.$emit('UNLOAD');
        };
        
        var url = Settings.url + 'StoredProcModify?StoredProc=usp_option_modify';
        GlobalSvc.postData(url,$scope.option,success,error,'Options','Modify',false,true);             
    };
    
    $scope.deleteObj = function(){
        $scope.option.Deleted = true;
        $scope.save();
    };
    
    function newObject(){
        $scope.option = {
            SupplierID: GlobalSvc.getUser().SupplierID,
            Name: '',
            Type: '',
            Value: '',
            Platform: '',
            Deleted: false
        };
        $scope.$emit('UNLOAD');
    }
    
    function fetchOptions(){
        delete $scope.errorMsg;
        delete $scope.successMsg;
        var url = Settings.url + 'GetStoredProc?StoredProc=usp_option_readlist&params=(' + GlobalSvc.getUser().SupplierID + ')';
        $http({method: 'GET', url: url})
        .success(function(json, status, headers, config) {
            $scope.options = json;
            $scope.$emit('UNLOAD');
            console.log(json);
        })
        .error(function(data, status, headers, config) {
            $scope.errorMsg = 'Issue.';
            $scope.$emit('UNLOAD');
        });        
    };
    // $scope.$emit('left',{label: 'Back' , icon : 'glyphicon glyphicon-chevron-left', onclick: function(){window.history.back();}});
    //$scope.$emit('right',{label: 'Save' , icon : 'glyphicon glyphicon-floppy-save', onclick : $scope.saveDiscount});
    function fetchOption(){
        delete $scope.errorMsg;
        delete $scope.successMsg;
        
        $scope.loading = true;
        var url = Settings.url + 'GetStoredProc?StoredProc=usp_option_readsingle&params=(' + GlobalSvc.getUser().SupplierID + ',' + $routeParams.id +  ')';
        $http({method: 'GET', url: url})
        .success(function(json, status, headers, config) {
            $scope.option = json[0];
            $scope.$emit('UNLOAD');
        })
        .error(function(data, status, headers, config) {
            $scope.errorMsg = 'Issue.';
            $scope.$emit('UNLOAD');
        });        
    };
    
    function constructor(){
        if(!GlobalSvc.getUser().IsAdmin){
            $scope.errorMsg = 'You are not authorised....';
            return;
        }

        $scope.$emit('LOAD');
        $scope.$emit('heading',{heading: 'Options' , icon : 'glyphicon glyphicon-wrench'});
        if ($routeParams.mode && $routeParams.id) {
            $scope.$emit('left',{label: 'Back' , icon : 'glyphicon glyphicon-chevron-left', onclick : function(){window.history.back()}});
            $scope.$emit('right',{label: 'Save' , icon : 'glyphicon glyphicon-floppy-save', onclick: $scope.save});
            $scope.mode = 'form';
            $scope.id = $routeParams.id;
            if ($scope.id==='new')
                newObject();    
            else    
                fetchOption();
        } else {
        	$scope.mode = 'list';
            fetchOptions();
            $scope.$emit('right',{label: 'New Option' , icon : 'glyphicon glyphicon-plus', href : '#/options/form/new'});
        }   
        
    };
    constructor();
});

coreApp.controller("ProdEditCtrl", function ($scope, GlobalSvc, DaoSvc, Settings, $routeParams, $http, $alert) {
    $scope.mode = 'list';
    
    $scope.searchClicked = function(){
        sessionStorage.removeItem('cacheProdEdit');
        sessionStorage.setItem('cacheProdEditSearchString', $scope.searchString);
        $scope.fetchProducts();
    };
    
    $scope.fetchProducts = function(){
        $scope.$emit('LOAD');
        delete $scope.errorMsg;
        delete $scope.successMsg;
        
        if (sessionStorage.getItem('cacheProdEditSearchString')) $scope.searchString = sessionStorage.getItem('cacheProdEditSearchString');
        
        //load from cache
        if (sessionStorage.getItem('cacheProdEdit')){
            $scope.products = JSON.parse(sessionStorage.getItem('cacheProdEdit'));
            $scope.$emit('UNLOAD');
            return;
        }
        
        //fetch from server
        var url = Settings.url + 'GetStoredProc?StoredProc=usp_product_searchlist&params=(' + GlobalSvc.getUser().SupplierID + (($scope.searchString) ? '|\'' + $scope.searchString + '\'' : '' ) + ')';
        $http({method: 'GET', url: url})
        .success(function(json, status, headers, config) {
            sessionStorage.setItem('cacheProdEdit', JSON.stringify(json));
            $scope.products = json;
            $scope.$emit('UNLOAD');
        })
        .error(function(data, status, headers, config) {
            $scope.errorMsg = 'Issue.' + data.toString();
            $scope.$emit('UNLOAD');
        });      
    }; 
    
    $scope.backbtnClicked = function(){
        window.history.back();
    };
    
    //change to use stored proc as soon as possible
    $scope.save = function(){
        $scope.$emit('LOAD');
        $scope.product.SupplierID = GlobalSvc.getUser().SupplierID;
        delete $scope.ProductUniqueId;
        var url = Settings.url + 'StoredProcModify?StoredProc=usp_product_modify2';
        GlobalSvc.postData(url,$scope.product,function(){
            $scope.$emit('UNLOAD');
            $alert({content: 'Your changes have been saved', duration:4, placement:'top-right', type:'success', show:true});
            sessionStorage.removeItem("cacheProdEdit");
            $scope.$apply();
        },function(){
            $scope.$emit('UNLOAD');
            $scope.errorMsg = 'Error Saving Product';
            $scope.$apply();
        },'product','modify',false,true);
    };
    
    $scope.saveold = function(){
        $scope.$emit('LOAD');
        var type = $routeParams.id === 'new' ? 'insert' : 'update';
        var url = Settings.dotnetPostUrl;
        console.log(url);

        GlobalSvc.postData(url,
            $scope.product,
            function(){
                $scope.$emit('UNLOAD');
                $scope.successMsg = 'Product saved ok';
                sessionStorage.removeItem("cacheProdEdit");
                $scope.$apply();
            },
            function(err){
                $scope.$emit('UNLOAD');
                $scope.errorMsg = 'Error Saving Product';
                $scope.$apply();
            }  
        );  
    };
    
    $scope.deleteObj = function(){
        $scope.$emit('LOAD');
        $scope.deleteproduct = {
                    SupplierID: GlobalSvc.getUser().SupplierID,
                    ProductID: $scope.product
        };
        var url = Settings.url + 'StoredProcModify?StoredProc=usp_product_delete';
        GlobalSvc.postData(url,$scope.product,function(){
            $scope.$emit('UNLOAD');
            alert('Deleted....');
            sessionStorage.removeItem("cacheProdEdit");    
            window.history.back();
        },function(){
            $scope.$emit('UNLOAD');
            $scope.errorMsg = 'Error Saving Product';
            $scope.$apply();
        },'product','modify',false,true);
    };
    
    
    function newProduct(){
        $scope.product = {
            SupplierID: GlobalSvc.getUser().SupplierID,
            ProductID: '',
            ProductUniqueId: '0',
            Description: '',
            CategoryName: '',
            VAT: '',
            Barcode: '',
            Unit: '',
            UserField01: '',
            UserField02: '',
            UserField03: '',
            UserField04: '',
            UserField05: '',
            Deleted: 0
        };
    };
    
    function fetchProduct(){
        var products = JSON.parse(sessionStorage.getItem('cacheProdEdit'));
        $scope.product = products[$routeParams.id];
        delete products;        
    };

    function constructor(){
        var user = GlobalSvc.getUser();
        if(!user.IsAdmin){
            $scope.errorMsg = 'You are not authorised....';
            return;
        }
              
        $scope.$emit('heading',{heading: 'Manage Products' , icon : 'glyphicon glyphicon-book'});            
        if ($routeParams.mode && $routeParams.id) {
            $scope.$emit('left',{label: 'Back' , icon : 'glyphicon glyphicon-chevron-left', onclick: function(){window.history.back();}}); 
            $scope.$emit('right',{label: 'Save' , icon : 'glyphicon glyphicon-floppy-save', onclick: $scope.save}); 
            $scope.mode = 'form';
            $scope.id = $routeParams.id;
            if ($routeParams.id === 'new')
                newProduct();
            else
                fetchProduct(); 
        } else {
            $scope.$emit('LOAD');
            $scope.$emit('right',{label: 'New' , icon : 'glyphicon glyphicon-plus', href:'#/prodedit/form/new'}); 
            $scope.mode = 'list';
            $scope.fetchProducts();
        }       
    };
    
    constructor();
});

coreApp.controller("UserExitCtrl", function ($scope, GlobalSvc, DaoSvc, Settings, $routeParams, $http) {
    function fetchUserCodes(){
        delete $scope.warningMsg;
        delete $scope.errorMsg;
        delete $scope.successMsg;
        
        //fetch from server
        var url = Settings.url + 'GetStoredProc?StoredProc=usp_usercode_readlist&params=(' + GlobalSvc.getUser().SupplierID + ')';
        $http({method: 'GET', url: url})
        .success(function(json, status, headers, config) {
            if (json.length===0) $scope.warningMsg = 'No User Exits are setup yet. Click the NEW button to set one up.';
            $scope.usercodes = json;
            sessionStorage.setItem('cacheUserCodes', JSON.stringify(json));
            $scope.$emit('UNLOAD');
        })
        .error(function(data, status, headers, config) {
            $scope.errorMsg = 'Issue.';
            $scope.$emit('UNLOAD');
        });      
    };
    
    function fetchUserCode(){
        var usercodes = JSON.parse(sessionStorage.getItem('cacheUserCodes'));
        $scope.usercode = usercodes[$routeParams.id];
        $scope.userexit = {
            Description: $scope.usercode.Description,
            Signature: $scope.usercode.Signature
        };
        delete usercodes;        
    };
    
    function fetchUserExits(){        
        //fetch from server
        var url = Settings.url + 'GetStoredProc?StoredProc=usp_userexits_readlist&params=(RapidSales)';
        $http({method: 'GET', url: url})
        .success(function(json, status, headers, config) {
            $scope.userexits = json;
            $scope.$emit('UNLOAD');
        })
        .error(function(data, status, headers, config) {
            $scope.errorMsg = 'Issue getting userexits.';
            $scope.$emit('UNLOAD');
        });      
    };
    
    function newObject(){
        $scope.usercode = {
            SupplierID: GlobalSvc.getUser().SupplierID,
            Product: 'RapidSales',
            UserExitID: '',
            UserID: GlobalSvc.getUser().UserID,
            Code: ''
        };
    };
    
    $scope.$watch('usercode.UserExitID', function() {
       for (var x=0; x<$scope.userexits.length; x++){
            if ($scope.userexits[x].UserExitID === $scope.usercode.UserExitID){
                $scope.userexit = $scope.userexits[x];
            }
        }
    });
    
    $scope.backbtnClicked = function(){
        window.history.back();
    };
    
    $scope.deleteObj = function(){
        $scope.usercode.Delete = true;
        $scope.save();
    };
    
    $scope.save = function(){
        delete $scope.errorMsg;
        delete $scope.successMsg;
        
        $scope.$emit('LOAD');
        
        success = function(){
            if ($scope.usercode.Delete) {
                $scope.successMsg = 'Your user function was Deleted...';
                newObject();
            } else    
                $scope.successMsg = 'Your user function was saved OK.';
            $scope.$emit('UNLOAD');
            $scope.$apply();
        };
        
        error = function(err){
            $scope.errorMsg = data;
            $scope.$emit('UNLOAD');
        };
        
        if (!$scope.usercode.Delete) $scope.usercode.Delete = false;
        var url = Settings.url + 'StoredProcModify?StoredProc=usp_usercode_modify';
        GlobalSvc.postData(url,$scope.usercode,success,error,'UserCode','Modify',false,true);             
    };
    
    function constructor(){
        var user = GlobalSvc.getUser();
        if(!user.IsAdmin){
            $scope.errorMsg = 'You are not authorised....';
            return;
        }
              
        $scope.$emit('heading',{heading: 'UserExits' , icon : 'glyphicon glyphicon-book'});            
        if ($routeParams.mode && $routeParams.id) {
            $scope.$emit('left',{label: 'Back' , icon : 'glyphicon glyphicon-chevron-left', onclick: function(){window.history.back();}}); 
            $scope.$emit('right',{label: 'Save' , icon : 'glyphicon glyphicon-floppy-save', onclick: $scope.save}); 
            $scope.mode = 'form';
            $scope.id = $routeParams.id;
            if ($routeParams.id === 'new'){
                fetchUserExits();
                newObject();
            } else
              fetchUserCode(); 
        } else {
            $scope.$emit('LOAD');
            $scope.$emit('right',{label: 'New' , icon : 'glyphicon glyphicon-plus', href:'#/userexit/form/new'}); 
            $scope.mode = 'list';
            fetchUserCodes();
        }       
    };
    
    constructor();
});

coreApp.controller('ProdCatCtrl',function($scope,$http,GlobalSvc,Settings,$routeParams,$location,$modal,$route, $alert){
    var user = GlobalSvc.getUser();
    $scope.categories = [];
    $scope.catEdit = {};
    $scope.searchviaoptions = ['CategoryID','Product ID','Search','Userfield01','Discount Values'];
    $scope.id = $routeParams.id;
    $scope.searchvia = '';
    $scope.searchbox = {searchval : ''};
    $scope.mode = $routeParams.mode;
    $scope.previewModal;
    $scope.breadcrumb = sessionStorage.getItem('BreadCrumbCache') ? JSON.parse(sessionStorage.getItem('BreadCrumbCache')) : [];
    $scope.previewjson = sessionStorage.getItem('previewCache') ? JSON.parse(sessionStorage.getItem('previewCache')) : undefined;
    
    $scope.breakCrumbBackClicked = function(){
        if ($scope.breadcrumb.length > 1) {
            var code = $scope.breadcrumb[$scope.breadcrumb.length - 2];
            $location.path('/prodcat/list/' + code);
        } else {
            sessionStorage.removeItem('BreadCrumbCache');
            $scope.breadcrumb = [];
            $location.path('/prodcat/list');
        }
        $route.reload();
    };

    function fetchTopCategories(){
        $scope.$emit('heading',{heading: 'Categories' , icon : 'glyphicon glyphicon-tree-conifer'});
        $scope.$emit('right',{label: 'New' , icon : 'glyphicon glyphicon-plus', href:'#/prodcat/new'});
        $scope.breadcrumb = [];
        sessionStorage.setItem('prodcatbreadcrumb', JSON.stringify($scope.breadcrumb));
        var url = Settings.url + 'GetStoredProc?StoredProc=usp_productcategory2_readlisttop2&params=("'+ user.SupplierID +'")';
        $http.get(url).success(function(data){
            $scope.categories = data;
            $scope.$emit('UNLOAD');
        });
    };

    function newCategory(){
        $scope.$emit('heading',{heading: 'New Category' , icon : 'glyphicon glyphicon-tree-conifer'});
        $scope.$emit('left',{label: 'Back' , icon : 'glyphicon glyphicon-chevron-left', onclick: function(){window.history.back();}}); 
        $scope.$emit('right',{label: 'Save' , icon : 'glyphicon glyphicon-floppy-save', onclick: $scope.saveClicked}); 
        $scope.catEdit = newCategoryObj();
        $scope.$emit('UNLOAD');
    };

    function fetchCategories(){
        $scope.$emit('LOAD');
        //Get breadcrumb to the right lefel
        $scope.breadcrumb = JSON.parse(sessionStorage.getItem('prodcatbreadcrumb'));
        for(var i = 0; i < $scope.breadcrumb.length; i++){
            if ($scope.breadcrumb[i] === $routeParams.id){
                $scope.breadcrumb = $scope.breadcrumb.splice(0, i  );
                break;
            }
        }
        $scope.breadcrumb.push($routeParams.id);
        $scope.$emit('heading',{heading: 'Categories :' + $routeParams.id  , icon : 'glyphicon glyphicon-tree-conifer'});
        $scope.$emit('left',{label: 'Back' , icon : 'glyphicon glyphicon-chevron-left', onclick:$scope.breakCrumbBackClicked });
        $scope.$emit('right',{label: 'New' , icon : 'glyphicon glyphicon-plus', href:'#/prodcat/new/' + $routeParams.id});

        var url = Settings.url + 'GetStoredProc?StoredProc=usp_productcategory2_readchildren2&params=('+ user.SupplierID + '|' + $routeParams.id +')';
        sessionStorage.setItem('prodcatbreadcrumb',JSON.stringify($scope.breadcrumb));
        $http.get(url).success(function(data){
            $scope.categories = data;
            $scope.$emit('UNLOAD');
        });
    };

    function newCategoryObj(){
        var category = {
            SupplierID: user.SupplierID,
            CategoryID: '',
            ParentCategoryID: ($routeParams.id) ? $routeParams.id : '',
            Tags: '',
            Tips: '',
            Description: '',
            Deleted: 0
        };
        return category;
    };

    function fetchCategory(){
        $scope.$emit('LOAD');
        $scope.$emit('heading',{heading: 'Edit'  , icon : 'glyphicon glyphicon-tree-conifer'});
        $scope.$emit('left',{label: 'Back' , icon : 'glyphicon glyphicon-chevron-left', onclick: function(){window.history.back();}}); 
        $scope.$emit('right',{label: 'Save' , icon : 'glyphicon glyphicon-floppy-save', onclick: $scope.saveClicked}); 
        var url = Settings.url + 'GetStoredProc?StoredProc=usp_productcategory2_readsingle2&params=('+ user.SupplierID + '|' +$routeParams.id +')';
        $http.get(url).success(function(data){
            $scope.catEdit = data[0];
            /*
             * This logic deals with Checking What the Search Parameter are so we are able to pick up
             * The Correct Value For The Drop Down Box
             */
            if($scope.catEdit.Tags !== ''){
                if($scope.catEdit.Tags.indexOf('p:') > -1){
                    $scope.searchvia  = 'Product ID';
                }else if($scope.catEdit.Tags.indexOf('s:') > -1){
                    $scope.searchvia = 'Search';
                }else if($scope.catEdit.Tags.indexOf('u1:')){
                    $scope.searchvia = 'Userfield01';
                }else if($scope.catEdit.Tags.indexOf('dv:')){
                    $scope.searchvia = 'Discount Values';
                }
                //This extracts the search value
                $scope.searchbox.searchval = $scope.catEdit.Tags.substring($scope.catEdit.Tags.indexOf(':') + 1,$scope.catEdit.Tags.indexOf('*'));
            }else{
                $scope.searchvia = 'CategoryID';
            }
            $scope.$emit('UNLOAD');
        });
    }

    $scope.selectClicked = function(location,$index){
        console.log($scope.breadcrumb.indexOf($scope.categories[$index].Description));
        var bc = {};
        bc.name = $scope.categories[$index].Description;
        bc.link = '#/prodcat/list/' + $scope.categories[$index].CategoryID;
        bc.code = $scope.categories[$index].CategoryID;
        $scope.breadcrumb.push(bc);
        sessionStorage.setItem('BreadCrumbCache',JSON.stringify($scope.breadcrumb));
        $location.path(location);
    };

    $scope.previewClicked = function(){
        var manager = user.Manager === "" ? "''" : user.Manager;
        var searchparam = '';
        if($scope.catEdit.Tags !== ''){
            searchparam = "'" + $scope.catEdit.Tags + "'";
        } else {
            searchparam = $scope.id;
        }
        var url = Settings.url + 'GetStoredProc?StoredProc=usp_pricelist_readlist_viacategory&params=(' + user.SupplierID + '|' + user.RepID + '|' + manager + '|' + searchparam  + '|0|100|false|false)';
        $http.get(url).success(function(data){
            $scope.previewjson = data;           
            $modal({scope : $scope, title: 'Preview', template: 'js/core/modal/previewCategories.html', show: true , animation: "am-fade-and-slide-top",keyboard : false,backdrop : 'static'});
        });
    };

    $scope.saveClicked = function(){
        delete $scope.errorMsg;
        delete $scope.successMsg;
        $scope.$emit('LOAD');
        
        if($scope.searchvia !== ''){
            var tags = '';
            if($scope.searchvia === 'Product ID'){
                tags = 'p:'+ $scope.searchbox.searchval + '*';
            } else if ($scope.searchvia === 'Search'){
                tags = 's:'+ $scope.searchbox.searchval + '*';
            } else if ($scope.searchvia === 'Userfield01'){
                tags = 'u1:'+ $scope.searchbox.searchval + '*';
            } else if ($scope.searchvia === 'Discount Values'){
                tags = 'dv:'+ $scope.searchbox.searchval + '*';
            }
            $scope.catEdit.Tags = tags;
        }
        console.log($scope.catEdit);
        var url = Settings.url + 'StoredProcModify?StoredProc=usp_productcategory2_modify';
        //add the Logic to check whether the Product Already Exists
        GlobalSvc.postData(url,$scope.catEdit,function(){
        	$alert({content: 'Changes saved OK.', duration:3, placement:'top-right', type:'success', show:true});
            $scope.$emit('UNLOAD');
            $location.path('/prodcat/' + ($scope.catEdit.ParentCategoryID ? 'list/' + $scope.catEdit.ParentCategoryID : ''));
            $scope.$apply();  
        },function(err){
            $scope.errorMsg = err;
            $scope.$apply();
            $scope.$emit('UNLOAD');
        },'tree','modify',false,true);
    };

    $scope.deleteClicked = function(){
        $scope.$emit('LOAD');
        $scope.catEdit.Deleted = 1;
        var url = Settings.url + 'StoredProcModify?StoredProc=usp_productcategory2_modify';
        //add the Logic to check whether the Product Already Exists
        GlobalSvc.postData(url,$scope.catEdit,function(){
            $scope.$emit('UNLOAD');
            $location.path('/prodcat/' + ($scope.catEdit.ParentCategoryID ? 'list/' + $scope.catEdit.ParentCategoryID : ''));
            $scope.$apply();
        },function(){
            $scope.errorMsg = err;
            $scope.$apply();
            $scope.$emit('UNLOAD');
        },'tree','modify',false,true);
    };

    function constructor(){
        if(!user.IsAdmin){
            $scope.errorMsg = 'You are not authorised....';
            return;
        }
        if (!$scope.mode) $scope.mode = 'list';
        $scope.$emit('LOAD');
        if ($scope.mode === 'list' && $scope.id === undefined){
            fetchTopCategories();
        } else if($scope.mode === 'list' && $scope.id){
            fetchCategories();
        } else if($scope.mode === 'form'){
            fetchCategory();
        } else if($scope.mode === 'new'){
            newCategory();
        }
    }
    constructor();
});

coreApp.controller('DVCtrl',function($scope, $filter, GlobalSvc, Settings, $routeParams, $alert,  $http, $location, $window){
    $scope.Discounts = [];
    var user = GlobalSvc.getUser();
    //$scope.searchText = '';
    $scope.PossibleValues;
    $scope.DiscountConditions;
    $scope.ProductPossibleValues;
    $scope.Values;
    $scope.NewdiscountValue;
    $scope.form = {};
        
    $scope.searchClicked = function(){
        delete $scope.errorMsg;
        delete $scope.successMsg;
        delete $scope.InfoMsg;
           
        sessionStorage.setItem('searchText', $scope.form.searchText);
        sessionStorage.removeItem('PossibleValuesCache' + $routeParams.id);
        fetchAccountPossibleValues();
    } ;  
    
    $scope.selectAllClicked = function(){
    	for (var x=1; x<$scope.discountValues.length; x++){
    		var item = $scope.discountValues[x];
    		if (item.Deleted) continue;
    		if (item.Rebate) continue;
    		item.Rebate = true;
    		$scope.rowChange(x);
    	}
    };
    
    /*
     * Keep track of changed rows so we know which ones to save when they hit the save button
     */
    $scope.rowChange = function(index){
    	setWarningMsg();
    	$scope.discountValues[index].changed = true;
    };
    
    $scope.deleteRow = function(index){
    	if ($scope.discountValues[index].newrow){
    		$scope.discountValues.splice(index, 1);
    		return;
    	}
    	
    	setWarningMsg();
    	if ($scope.discountValues[index].Deleted)
    		$scope.discountValues[index].Deleted = false;
    	else
    		$scope.discountValues[index].Deleted = true;
    };
        
    function fetchAccountPossibleValues(){
    	$scope.$emit('heading',{heading: 'Select an ' + $routeParams.id , icon : 'glyphicon glyphicon-book'});
    	$scope.$emit('LOAD');
    	$scope.placeholder = 'Search for ' + $routeParams.id;
        if (sessionStorage.getItem('PossibleValuesCache' + $routeParams.id)){
            $scope.PossibleValues = JSON.parse(sessionStorage.getItem('PossibleValuesCache' + $routeParams.id));
            $scope.$emit('UNLOAD');
        } else {
            var url = Settings.url + "GetStoredProc?StoredProc=usp_discountconditions_accountPossibleValues&params=(" + user.SupplierID + "|" + $routeParams.id + "|'" + ($scope.form.searchText ? $scope.form.searchText : "") + "')";
            $http({method: 'GET', url: url})
            .success(function(data){
                console.log(data);
                $scope.PossibleValues= data;
                $scope.$emit('UNLOAD');
                sessionStorage.setItem('PossibleValuesCache', JSON.stringify(data));
                if (data.length === 0){
                    $scope.InfoMsg ='No data availible';
                };
                $scope.$emit('UNLOAD');
            });
        };
    };
    
    $scope.tabclicked = function(index){
    	$scope.activeTab = index;
    	sessionStorage.setItem('valuesactiveTab', $scope.activeTab);
    	fetchDiscountValues();
    };
   
    /*
     * Fetch conditions first to get the RTAttribute field so we know what field we searching for in accounts
     */
    function fetchDiscountConditions() {
       var url = Settings.url + "GetStoredProc?StoredProc= usp_discountcondition_readforattribute&params=(" + user.SupplierID + "|" + $routeParams.rtattribute +")";
       $http({method: 'GET', url: url}).success(function(data){ 
    	   $scope.tabs = [];
    	   $scope.activeTab = (sessionStorage.getItem('valuesactiveTab')) ? parseInt(sessionStorage.getItem('valuesactiveTab')) : 0; 
    	   //create tabs for the screen
    	   for (var x=0; x<data.length; x++){
        		if (data[x].RTAttribute === $routeParams.rtattribute){
        			$scope.tabs.push({title : data[x].Name, 
        							discountID: data[x].DiscountID,
        							Type: data[x].Type});
        		};
        	};
        	sessionStorage.setItem('conditions' + $routeParams.rtattribute,JSON.stringify(data));
        	fetchDiscountValues(); 
        }).error(function(err){
            console.log(err);
            fetchDiscountValues(); 
        }); 
    };
    
    $scope.getAddress = function(viewValue) {
        var params = {address: viewValue, sensor: false};
        return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {params: params})
        .then(function(res) {
          return res.data.results;
        });
    };
         
    $scope.fetchProductPossibleValues = function(searchStr) {
    	var url = Settings.url + "GetStoredProc?StoredProc=usp_discountconditions_productPossibleValues&params=(" + user.SupplierID + "|" + $scope.tabs[$scope.activeTab].discountID + "|" + searchStr + ")";    
    	return $http.get(url)
        .then(function(data){
            return data.data;
        });
    };
     
    function fetchDiscountValues(){
    	delete $scope.errorMsg;
		delete $scope.InfoMsg;
		$scope.$emit('LOAD');
		  
		//get the main discount record
		$scope.discountValues = [];
		$scope.tab = $scope.tabs[$scope.activeTab];
		var discountID = $scope.tabs[$scope.activeTab].discountID;
		var conditions = JSON.parse(sessionStorage.getItem('conditions' + $routeParams.rtattribute));
		  
		//find out which product field is used
		$scope.conditions = [];
		for (var x=0; x<conditions.length; x++){
			if (conditions[x].DiscountID === discountID) $scope.conditions[conditions[x].RTObject.replace('#','')] = conditions[x];
		};
		newDiscountValueObject();
		
		var url = Settings.url + "GetStoredProc?StoredProc=usp_discountvalues_readlistviaid&params=(" + user.SupplierID + "|" + discountID + "|'" + $routeParams.possiblevalue + "')";
		$http({method: 'GET', url: url})
		   .success(function(data){
		        for (var x=0; x < data.length; x++){
		        	data[x].sort = data[x].Deal + data[x].FromDate + data[x].ToDate + data[x].ProductID;
		        	data[x].prev = data[x].Deal + data[x].FromDate + data[x].ToDate;
		        	data[x].Deleted = false;
		        }
		        $scope.discountValues = $filter('orderBy')(data, "sort");
		        $scope.$emit('UNLOAD');
		        
		        if ($scope.discountValues.length === 0)
		             $scope.InfoMsg = "Add your first prices or discount for the " + sessionStorage.getItem('RTAttribute')  + ': ' + $routeParams.possiblevalue;                 
		   }).error(function(err){
		        $scope.errorMsg = 'Issue.' + err.toString();
		        $scope.$emit('UNLOAD');
		   });      
    };
    
    $scope.dealClicked = function(deal){
    	for (var x=0; x < $scope.discountValues.length; x++){
    		if ($scope.discountValues[x].Deal === deal){
    			$scope.newrow.Deal = $scope.discountValues[x].Deal;
    			$scope.newrow.FromDate = new Date($scope.discountValues[x].FromDate);
    			$scope.newrow.ToDate = new Date($scope.discountValues[x].ToDate);
    			$scope.newrow.Rebate = $scope.discountValues[x].Rebate;
    			return;
    		};
    	};
    };
    
    function setWarningMsg(){
    	//$scope.warningMsg = "Your changes are in progress, press save when you are ready to comit the changes";
    	$alert({content: 'Changes in progress, press save to comit your changes.', duration:3, placement:'top-right', type:'warning', show:true});
    	$scope.$emit('right',{label: 'Save' , icon : 'fa fa-floppy-o',onclick: $scope.saveDiscountValues});
    };

    
    function newDiscountValueObject(oldObject){
    	if (!$scope.conditions) return;
        $scope.newrow = {
           SupplierID   : user.SupplierID,
           DiscountID   : $scope.tabs[$scope.activeTab].discountID, 
           AccountID    : ($scope.conditions.Account.DiscountField === 'AccountID') ? $routeParams.possiblevalue : '',
           AccountGroup : ($scope.conditions.Account.DiscountField === 'AccountGroup') ? $routeParams.possiblevalue : '',
           BranchID     : '',
           ProductID    : '',
           Category     : '',
           Usefield01   : ($scope.conditions.Account.DiscountField === 'Usefield01') ? $routeParams.possiblevalue : '',
           Usefield02   : ($scope.conditions.Account.DiscountField === 'Usefield02') ? $routeParams.possiblevalue : '',
           Usefield03   : ($scope.conditions.Account.DiscountField === 'Usefield03') ? $routeParams.possiblevalue : '',
           Usefield04   : '',
           Usefield05   : '',
           FromDate 	: oldObject ? oldObject.FromDate : new Date(),
           ToDate 		: oldObject ? oldObject.ToDate : new Date(),
           QtyLow 		: oldObject ? oldObject.QtyLow :0,
           QtyHigh 		: oldObject ? oldObject.QtyHigh :9999,
           Discount 	: '',
           Price  		: '',
           Deal			: oldObject ? oldObject.Deal :'',
           Rebate		: oldObject ? oldObject.Rebate :false,
           Deleted		: false,
           changed		: true,
           newrow		: true
       };
    };
    
    /*
     * Create our new object to push into array and reset newrow
     */
    $scope.addRow = function(){
    	setWarningMsg();
    	var obj = {};
    	for (prop in $scope.newrow) {
    		obj[prop] = $scope.newrow[prop];
    	}
    	//Set extra fields
    	obj.FromDate = GlobalSvc.toDateString(obj.FromDate);
    	obj.ToDate = GlobalSvc.toDateString(obj.ToDate);
    	obj.sort = obj.Deal + obj.FromDate + obj.ToDate + obj.ProductID;
    	obj.prev = obj.Deal + obj.FromDate + obj.ToDate;
    	$scope.discountValues.push(obj);
    	$scope.discountValues = $filter('orderBy')($scope.discountValues, "sort");
    	
    	//Reset newrow
    	newDiscountValueObject($scope.newrow);	
    	$scope.newrow.Discount = '';
    	$scope.newrow.Price = '';
    	$scope.newrow[$scope.conditions.Product.DiscountField] = '';
    	delete $scope.InfoMsg;
    	//set focus back to productid
    	var element = $window.document.getElementById('productid');
        if (element) element.focus();
    };
    
    $scope.saveDiscountValues = function(){
    	$scope.$emit('LOAD');
    	saveDiscountValue($scope.discountValues.length - 1);
    };
    
    /*
     * Recursive function to save discount values one at a time
     */
    function saveDiscountValue(index) {
        if (index === -1) {
        	$scope.$apply();
        	$scope.$emit('UNLOAD');
        	$alert({content: 'Your changes have been saved', duration:4, placement:'top-right', type:'success', show:true});
        	return;
        }
        
        // No changes so continue
        if (!$scope.discountValues[index].changed && !$scope.discountValues[index].Deleted) {
        	index -= 1;
        	saveDiscountValue(index);
        	return;
        }
        
        success = function(){
        	if ($scope.discountValues[index].Deleted){
        		$scope.discountValues.splice(index, 1);
        	} else {
            	$scope.discountValues[index].changed = false;
            	$scope.discountValues[index].newrow = false; 
            	$scope.discountValues[index].broken = false;
        	}
        	index -= 1;
        	saveDiscountValue(index);
        };
        
        error = function(obj1, obj2){
        	$scope.errorMsg='Issue.' ; 
        	$scope.discountValues[index].broken = true;
        	index -= 1;
        	saveDiscountValue(index);
        };
        
        var obj = angular.copy($scope.discountValues[index]);
        if (! angular.isDate(obj.FromDate)) obj.FromDate = new Date(obj.FromDate.substring(0,4), obj.FromDate.substring(5,7) - 1, obj.FromDate.substring(8,10));
        if (! angular.isDate(obj.ToDate)) obj.ToDate = new Date(obj.ToDate.substring(0,4), obj.ToDate.substring(5,7) - 1, obj.ToDate.substring(8,10));
        obj.Discount = (obj.Discount==="") ? 0 : obj.Discount;
        obj.Price = (obj.Price==="") ? 0 : obj.Price;
        //obj.Deleted = (obj.Deleted) ? 1 : 0;
        obj.UserID = GlobalSvc.getUser().UserID;
        delete obj.sort;
        delete obj.prev;
        delete obj.changed;
        delete obj.$$hashKey;
        var url = Settings.url + 'StoredProcModify?StoredProc=usp_discountvalues_modify3';
        GlobalSvc.postData(url,obj,success,error,'Values','Modify',true,true);             
    };
   
    function fetchDiscounts() {
       delete $scope.errorMsg;
       delete $scope.successMsg;
       var url = Settings.url + "GetStoredProc?StoredProc=usp_discountconditions_readattributes&params=(" + user.SupplierID + ")";        
         $http({method: 'GET', url: url})
          .success(function(data) {
            $scope.attributes = data;
            sessionStorage.setItem('attributes',JSON.stringify(data));
            $scope.$emit('UNLOAD');
             
          })
        .error(function(err) {
            console.log(err);
            $scope.errorMsg='Issue.';
            $scope.$emit('UNLOAD'); 
        });
    };

    function constructor(){
	   var user = GlobalSvc.getUser();
	   if (!user.IsAdmin){
	       $scope.errorMsg = 'You are not authorised....';
	       return;
	   }
	   
	   if (!$routeParams.mode) {
		   $scope.$emit('LOAD');
		   fetchDiscounts();
		   $scope.mode = 'list'; 
		   $scope.$emit('heading',{heading: 'Discount Values' , icon : 'glyphicon glyphicon-book'});
	       //$scope.id = $routeParams.discountid;
	   } else {
		   $scope.id = $routeParams.id;
		   $scope.mode = $routeParams.mode;
		   $scope.$emit('LOAD');
		   if ($routeParams.mode ==='possiblevalues'){  
			   $scope.$emit('left',{label: 'Back' , icon : 'glyphicon glyphicon-chevron-left', onclick: function(){$location.path('/dv');}});
			   $scope.searchText = sessionStorage.getItem('searchText');
			   $scope.searchText = ($scope.searchText === 'null') ? '' : $scope.searchText; //get rid of the word null
			   fetchAccountPossibleValues($scope.searchText);
		   } else if ($routeParams.mode==='values'){
			   $scope.$emit('left',{label: 'Back' , icon : 'glyphicon glyphicon-chevron-left', onclick: function(){window.history.back();}});
			   $scope.$emit('heading',{heading: 'Deals for ' + $routeParams.rtattribute  + ': ' + $routeParams.possiblevalue , icon : 'glyphicon glyphicon-book'});	
			   //$scope.$emit('right',{label: 'Save' , icon : 'fa fa-floppy-o',onclick: $scope.saveDiscountValue});
			   fetchDiscountConditions();         
		    };          
	   };
	};    

   constructor();
});
