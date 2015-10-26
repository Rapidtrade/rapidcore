//var syncSvc = (function(){
//    var instance;	
//    function instanceObj() {
coreApp.service('SyncSvc', function($http, GlobalSvc, DaoSvc, Settings, OptionSvc) {

    DaoSvc.openDB();
    //this.syncTables = [];
    this.syncCount = 0;
    this.numRows = 250;
    this.userID = '';
    this.supplierID = '';
    this.resultTable = new Array();
    this.sentcount = 0;
    var $this = this;

    this.sync = function(SupplierID, UserID, $scope){
        this.syncCount = 0;
        this.supplierID = SupplierID;
        this.userID = UserID;
        $scope.syncProgress = [];
        $scope.syncProgress.push('Starting a sync');
        var table_url = Settings.url + "GetStoredProc?StoredProc=usercode_readsingle&params=("+ this.supplierID + "|'sync.synctables')";
        var keys_url = Settings.url + "GetStoredProc?StoredProc=usercode_readsingle&params=("+ this.supplierID + "|'sync.tablekeys')";
        var Oncomplete = function(){
            DaoSvc.cursor('Unsent',
                function(json){
                    $this.postObjects(json, $scope);
                },
                function(err){
                    $this.download($this.supplierID, $this.userID, $scope);
                },
                function(){
                    $this.download($this.supplierID, $this.userID, $scope);
                }
            );
        }
        //Checking if a user exit for syncing exists
        $http.get(table_url).success(function(data){
            if(!data.length){
            	Oncomplete(); //if no user tables for this supplier via a userexit, then do a complete
                return;
            }
            //Execute the User exit that returns the table names
            var userExitFunc = new Function('user',data[0].Code);
            var tables = userExitFunc( JSON.parse(localStorage.getItem('currentUser')));
            //Fetch the UserExit that returns the table keys
            $http.get(keys_url).success(function(json){
                Settings.syncTables = Settings.syncTables.concat(tables);
                console.log(Settings.syncTables);
                var userExitFunc = new Function('user',json[0].Code);
                var keys = userExitFunc( JSON.parse(localStorage.getItem('currentUser')));
                Settings.tableKeys = Settings.tableKeys.concat(keys);
                //Cache so that we that we can DROP table when doing a DaoDeleteDB
                localStorage.setItem('localTablesCache',JSON.stringify(Settings.tableKeys));
                DaoSvc.sqlCreateTables(Oncomplete);
            })
        });
    };

    this.postObjects = function(obj, $scope){
        $scope.syncProgress.push( 'Sending ' + obj.Table + ' ' + $this.sentcount++);

        GlobalSvc.postData(obj.url,
            obj.json,
            function(data){
                if (data.status) {
                    if (data.offline)
                        $scope.syncProgress.push('You seem to be offline');
                    else {
                        $this.sentcount++;
                        $scope.syncProgress.push( 'Sent ' + table + ' ' + $this.sentcount++);
                        DaoSvc.deleteItem('Unsent',obj.key,undefined,function(err){alert('error deleting unsent records')});
                    }
                } else {
                    $scope.syncProgress.push('Error: ' + obj.Table + ' (' + $this.sentcount + ') ' + data.ErrorMsg);
                    $scope.$apply();
                }
            },
            function(err){
                $scope.syncProgress.push(data.ErrorMsg);
                $scope.syncProgress.push('Trying more...');
            },
            obj.Table,
            obj.Method,
            true
        );
    };

    this.download = function(SupplierID, UserID, $scope){
        //this.syncTables = [];

        //DaoSvc.openDB();

        /*
         for (var x=0; x < Settings.syncTables.length; x++){
         var table = Settings.syncTables[x];
         this.addSync(table.SupplierID, table.userID, table.table , table.method, table.alternateLink);
         }
         */

        var item = Settings.syncTables[this.syncCount];
        syncTableCount = 0;
        //$scope.syncProgress = new Array();
        $scope.syncProgress.push(item.table + ' - downloading');
        this.fetchTable(SupplierID,UserID,item.table,item.method,this.fetchLastTableSkip(item.table), this.saveToDB, $scope, $this, item.alternateLink,item.generic);
    };

    /*
     * add the sync required
     *
     this.addSync = function(supplierid, userid, table, method , altLink){
     var syncTable= {};
     syncTable.supplierid = supplierid;
     syncTable.userid = userid;
     syncTable.table = table;
     syncTable.method = method;
     syncTable.altLink = altLink;
     this.syncTables.push(syncTable);
     console.log(syncTable);
     };
     /*

     /*
     * Fetch method to get each individual table from the server
     */
    this.fetchTable = function (supplierid, userid, table, method, skip, callback, $scope, $this,alternateLink,isgeneric) {
        var version = ('Options' === table) ? 0 : this.fetchLastTableVersion(table);
        var userParameter = '';
        if (userid) userParameter = '&userID=\'' + GlobalSvc.getUser().UserID + '\'';
        if(alternateLink){
            var url = alternateLink;
            /*'&supplierID=' + supplierid +
             userParameter +
             '&version=' + version +
             '&skip=' + skip +
             '&top=' + this.numRows + '&format=json';*/
        } else if(isgeneric){
            var url = Settings.url + 'GetStoredProc/Sync'+
                '?supplierID=' + supplierid +
                '&version=' + version +
                '&table=' + table +
                '&method='+ method +
                '&offset=' + skip +
                '&numrows=' + this.numRows + '&format=json';
            console.log(url);
        } else {
            var url = Settings.url + table + '/' + method +
                '?supplierID=' + supplierid +
                userParameter +
                '&version=' + version +
                '&skip=' + skip +
                '&top=' + this.numRows + '&format=json';
        }
        console.log(url);
        $http({method: 'GET', url: url})
            .success(function(json, status, headers, config) {
                callback(json, supplierid, userid, version, table, method, skip, $scope, $this);
            })
            .error(function(data, status, headers, config) {
                console.log(status);
            });
    };

    /*
     * return the last succesfull version for this table
     */
    this.fetchLastTableVersion = function(table){
        var lastversion = localStorage.getItem('lastversion' + table);
        if (lastversion === null) lastversion = 0;
        if (isNaN(lastversion)) lastversion = 0;
        return parseInt(lastversion);
    };
    /*
     * Store's the last page returned so we can restart from that point
     */
    this.fetchLastTableSkip = function (table) {
        // due the optional table sync, we always need to sync all data from Options table
        if ('Options' === table) return 0;
        var lastskip = localStorage.getItem('lastSkip' + table);
        if (lastskip === null) lastskip = 0;
        return parseInt(lastskip);
    };

    this.setLastVersion = function (table, version){
        localStorage.setItem('lastversion' + table, version);
        localStorage.removeItem('lastSkip' + table);
    };

    this.nextItem = function($this) {
        $this.syncCount++;
        return Settings.syncTables[$this.syncCount];
    };

    this.setMessage = function(loading, msg) {
        /*
         $('#messagediv').show();
         if (loading)
         $('#syncimg').attr('src', 'img/info-48.png');
         else
         $('#syncimg').attr('src', 'img/tick-48.png');

         $('#messagetxtdiv').text(msg);
         */
    };

    /*
     * Any time we save data, it needs to be in a save<...> method
     * This method saves the sync data to local database
     */
    this.saveToDB = function (json, supplierID, userid, version, table, method, skip, $scope, $this) {
        if (this.stopsync===true) return;

        localStorage.setItem('lastSkip' + table, skip);
        var jsonarray = (json._Items) ? json._Items : json.items; // cater for Kevin avoiding standards
        var lastversion = (json._LastVersion) ? json._LastVersion : json.LastVersion;

        if (jsonarray === undefined || jsonarray === null || jsonarray.length === 0) {
            //this table sync is finished, so check if we need more downloads of this table
            $scope.syncProgress[$scope.syncProgress.length -1] += ' OK';
            //$('#results tbody tr:last td').text($('#results tbody tr:last td').text() + ' OK');
            $this.setLastVersion(table, lastversion);

            if ((Settings.syncTables.length === ($this.syncCount + 1))) { //completed the SYNC
                console.log('===== Sync completed OK =====');
                $scope.message = 'Sync completed OK.';
                OptionSvc.options = {};
                OptionSvc.init();
                GlobalSvc.busy(false);
                if ($scope.syncCompleted) {
                    $scope.syncCompleted();
                }
            } else {	// go on to the next table
                var item = $this.nextItem($this);
                $this.fetchTable(supplierID,item.userid,item.table,item.method,$this.fetchLastTableSkip(item.table),$this.saveToDB,$scope,$this,item.alternateLink,item.generic);
                return;
            }
            return;
        }
        var writeComplete = function() {
            if ((jsonarray.length ) < 250) {
                //less than 250 records, so move on to the next sync
                $scope.syncProgress[$scope.syncProgress.length -1] = table + ' (' + (skip + jsonarray.length) + ') downloaded';
                $this.setLastVersion(table, lastversion);
                if ((Settings.syncTables.length === ($this.syncCount + 1))) {
                    console.log('===== Sync completed OK =====');
                    $scope.message = 'Sync completed OK. Please wait';
                    OptionSvc.options = {};
                    OptionSvc.init();
                    if ($scope.syncCompleted) $scope.syncCompleted();
                    GlobalSvc.busy(false);
                } else {
                    //$('#results tbody tr:last td').text(table + ' (' + (skip + jsonarray.length) + ') downloaded');
                    //do the next table
                    var item = $this.nextItem($this);
                    try {
                        $scope.syncProgress.push('Fetching new ' + item.table + '...');
                        $this.fetchTable(supplierID, item.userid, item.table, item.method, $this.fetchLastTableSkip(item.table),$this.saveToDB,$scope, $this, item.alternateLink,item.generic);
                    } catch(err) {
                        console.log('Skipping');
                    }
                }
            } else {
                //get the next 250 records for the table
                //$this.setLastVersion(table, lastversion);
                $scope.syncProgress[$scope.syncProgress.length -1] = table + ' (' + (skip + jsonarray.length) + ') downloaded';
                var item = Settings.syncTables[$this.syncCount];
                $this.fetchTable(supplierID, userid, table, method, skip + $this.numRows,$this.saveToDB,$scope,$this,item.alternateLink,item.generic); //get next 250 records	    
            }
        };

        if (jsonarray === undefined) return;
        if (jsonarray.length === 0) return;

        try {
            if (table==='DisplayFields'){
                for (var x=0; x < jsonarray.length; x++){
                    //on php length is a string, so convert to 
                    if (angular.isString(jsonarray[x].Length))
                        jsonarray[x].Length = parseInt(jsonarray[x].Length);
                }
            }

            DaoSvc.putMany(jsonarray,
                table,
                undefined,
                function (tx) {
                    GlobalSvc.alert('Error on download, can\'t continue: ' + tx.message);
                    this.stopsync = true;
                    GlobalSvc.busy(false);
                },
                writeComplete);

        } catch (err) {
            GlobalSvc.alert('Error opening transaction' + err.message);
            return;
        }
    };


}); //end instance
/*
 return {
 getInstance: function(){
 if(!instance){
 instance = new instanceObj;
 }
 return instance;
 }
 };
 })();
 */
