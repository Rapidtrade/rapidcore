coreApp.controller("ProdPricesCtrl", function ($scope, GlobalSvc, $alert, $http, $modal, Settings,$routeParams,$filter ){
    $scope.Pricelists = [];
    $scope.priceListEdit = {"pricelist" : "" , "description" : ""};
    $scope.Modal;
    var user = GlobalSvc.getUser();
    $scope.prices;
    $scope.price;
   
    function fetchPricelists(){
        delete $scope.errorMsg;
        delete $scope.successMsg;
        delete $scope.warningMsg;
        
        var url = Settings.url + 'GetStoredProc?StoredProc=usp_pricelisttypes_readlist&params=(' + user.SupplierID + ')';
        $http({method : 'GET', url: url})
            .success(function(data){
                if (data.length <= 0) {
                	$scope.warningMsg = "You dont have any pricelists yet. Create your first pricelist by clicking the '+ add' button above."; 
                } else {
	                $scope.Pricelists = data;
                }
                $scope.$emit('UNLOAD');
            })
            .error (function(err){
                $alert({ content: '511 Network Authentication Required. Please check your Internet Connection if problem persists!', duration: 5, placement:"top-right", type: "danger", show:true});
                $scope.$emit('UNLOAD');
                console.log(err);
            });
    };
    
    function newPricelistTypeObject(){
    	$scope.pricelistType = {
    			SupplierID: GlobalSvc.getUser().SupplierID,
    			ID: '',
    			Name: ''
    	};
    };
    
    /*
     * When adding a new row
     */
    $scope.addOnclick = function(){  
    	newPricelistTypeObject();
        $scope.Modal = $modal({scope : $scope, template: 'js/core/modal/addPricelist.html', show: true , animation: "am-fade-and-slide-top",keyboard : false,backdrop : 'static'});  
    };
    
    /*
     * Save pricelist to PricelistType table
     */
    $scope.savePricelist = function(){
    	$scope.$emit('LOAD');
        delete $scope.errorMsg;
        delete $scope.successMsg;        
        var url = GlobalSvc.resturl() + 'View/ModifyAll?table=PricelistTypes&type=insert';        

        GlobalSvc.postData(url,
        	$scope.pricelistType,
            function(){
                $scope.$emit('UNLOAD');
                $alert({ content: "Your pricelist has been added, go ahead and add prices", duration: 4, placement:"top-right", type: "success", show:true}); 
                $scope.Modal.$hide();
                fetchPricelists();
            },
            function(err){
                $scope.$emit('UNLOAD');
                $scope.errorMsg = data;
                $scope.$apply();
        },
        'Groups','insert',false,true);
    };
    
    $scope.fetchPrices = function() {
        delete $scope.errorMsg;
        delete $scope.successMsg;
        delete $scope.warningMsg;
        var url = Settings.url + 'GetStoredProc?StoredProc=usp_price_search&params=(' + user.SupplierID + '|' + $routeParams.pricelist + ($scope.searchText ? '|' + $scope.searchText : '')  +')';
        $http({method : 'GET', url: url})
        .success(function(data){
            $scope.prices = data;
            $scope.$emit('UNLOAD');
                
        })
        .error (function(err){
            $alert({ content: '511 Network Authentication Required. Please check your Internet Connection if problem persists!', duration: 5, placement:"top-right", type: "danger", show:true});
            $scope.$emit('UNLOAD');
            console.log(err);
         });
    };
    
    $scope.savePrices = function() {
    	$scope.$emit('LOAD');
    	$scope.savePrice(0);
    };
    
    /*
     * Recursive save
     */
    $scope.savePrice = function(idx) {
    	if (idx === $scope.prices.length){
    		delete $scope.warningMsg;
    		$scope.$emit('UNLOAD');
    		$alert({ content: "Your prices have been saved OK", duration: 4, placement:"top-right", type: "success", show:true}); 
    		for (var x=$scope.prices.length-1; x > -1; x--){
    			if ($scope.prices[x].Deleted) $scope.prices.splice(x, 1);
    		}
    		return;
    	}
    	
    	var price = $scope.prices[idx];
    	//if no change, then exit
    	if (!price.changed && !price.Deleted) {
    		idx += 1;
	    	$scope.savePrice(idx);
	    	return;
	    }; 
    	price.Nett = price.Gross;
	       
        success = function(){
        	$scope.prices[idx].changed = false;
        	idx += 1;
        	$scope.savePrice(idx);
        };
        
        error = function(err){
          $alert({ content: err.toString(), duration: 4, placement:"top-right", type: "danger", show:true});
          $scope.$emit('UNLOAD');         
        };
        
        var url = Settings.url + 'StoredProcModify?StoredProc=usp_price_modify2';
        GlobalSvc.postData(url, price, success, error, 'Prices', 'Modify', false, true);
    };
    
    function setWarningMsg(){
    	//$scope.warningMsg = "Your changes are in progress, press save when you are ready to comit the changes";
    	$alert({ content: 'Changes in progress, press \'Save\' wh you are ready to comit.', duration: 3, placement:"top-right", type: "warning", show:true});
    };
        
    $scope.addRow = function(){
    	setWarningMsg();
    	$scope.prices.push($scope.newPrice);
    	$scope.prices = $filter('orderBy')($scope.prices, "ProductID");
    	newPriceObject();
    };
    
    /*
     * Keep track of changed rows so we know which ones to save when they hit the save button
     */
    $scope.rowChange = function(index){
    	setWarningMsg()
    	$scope.prices[index].Nett = $scope.prices[index].Gross;
    	$scope.prices[index].changed = true;
    };
    
    $scope.deleteRow = function(index){
    	setWarningMsg()
    	if ($scope.prices[index].Deleted)
    		$scope.prices[index].Deleted = false;
    	else
    		$scope.prices[index].Deleted = true;
    }; 
    
    function newPriceObject(){
        var pricelist = $routeParams.pricelist; 
        $scope.newPrice = {
            ProductID: '',
            SupplierID: user.SupplierID,
            Cost: 0 ,
            Discount: 0,
            Gross: '',
            Nett:0,
            Pricelist: pricelist,
            Deleted: false,
            changed: true
        };
    };
    
    $scope.fetchProductPossibleValues = function(searchStr) {
    	var url = Settings.url + "GetStoredProc?StoredProc=usp_productPossibleValues&params=(" + user.SupplierID + "|'" + searchStr + "')";    
    	return $http.get(url)
        .then(function(data){
            return data.data;
        });
    };
    
    function constructor() {
       //This Checks if the user is an Administrator
        var user = GlobalSvc.getUser();
        if(!user.IsAdmin){
           $scope.errorMsg = 'You are not authorised....';
           return;
        }

        if ($routeParams.pricelist) {
            $scope.$emit('LOAD');
            $scope.$emit('heading',{heading: 'Pricelist' + $routeParams.pricelist , icon : 'glyphicon glyphicon-book'});
            $scope.pricelist = $routeParams.pricelist;
            $scope.mode = 'Prices Pricelist';
            $scope.$emit('left',{label: 'Back' , icon : 'glyphicon glyphicon-chevron-left', onclick: function(){window.history.back();}});
            $scope.$emit('right',{label: 'Save' , icon : 'fa fa-save', onclick: $scope.savePrices});
            newPriceObject();
            $scope.fetchPrices();                    
        } else {
            $scope.$emit('LOAD');
            $scope.$emit('heading',{heading: ' Pricelists' , icon : 'glyphicon glyphicon-book'});
            $scope.mode = 'Pricelists list';
            $scope.$emit('right',{label: 'Pricelist' , icon : 'glyphicon glyphicon-plus',onclick: $scope.addOnclick});
            fetchPricelists(); 
        }                                                 
   };

   constructor();
});