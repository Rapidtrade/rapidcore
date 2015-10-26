coreApp.service("OptionSvc", function(DaoSvc, GlobalSvc,UserCodeSvc, Settings, $http){
    this.options = JSON.parse(sessionStorage.getItem('optioninfo'));
    
    this.init = function(){
        
        if(!$.isEmptyObject(this.options) ) return;
       
        this.options = {};
        DaoSvc.openDB();
        var $this = this;
        DaoSvc.cursor('Options',
            function(json) {
                $this.options[json.Name] = json;
            },
            function(err){
                fetchOptionsHttp($this);
            },function(){
                onComplete($this);
            }
        );
    };
    
    function onComplete($this){
        this.options = $this.options;
        sessionStorage.setItem('optioninfo',JSON.stringify(this.options));
        UserCodeSvc.init();
    };
    
    /*
     * Fetch Online if no offline options found
     */
    function fetchOptionsHttp($this){ 
        if (!GlobalSvc.getUser().SupplierID) {
            console.log ('No SupplierID, dont fetch options yet');
            return;
        }
        var url = Settings.url + 'GetStoredProc?StoredProc=usp_option_readlist&params=(' + GlobalSvc.getUser().SupplierID + ')';
        $http({method: 'GET', url: url})
        .success(function(json) {
            for (var x=0; x< json.length; x++){
                $this.options[json[x].Name] = json[x];
            };  
            onComplete($this); 
            console.log('Options built from HTTP');
            save(json);
        })
        .error(function(data, status, headers, config) {
            Alert('No options items found...');
        });
    };
    
    /*
     * Since we got options online, try save locally for next time
     */
    function save(jsonarray){
        try {
            DaoSvc.putMany(jsonarray, 
                'Options',
                undefined,
                function (tx) {
                    console.log('Options updated ok from http');
                });  
        } catch (err){
            console.log('Error updating options from http');
        }
          
    };
    
    this.getBoolean = function(Name, defaultVal){
        this.init();
        try {
            if (defaultVal !== true && defaultVal !== false){
                console.log('optionSvc.getBoolean for ' + Name + ' does not have a correct defaultVal, pelase correct, defaulting to false');
                defaultVal = false;
            }
            if (!this.options[Name]) return defaultVal;
            if (this.options[Name].Value.toUpperCase() === 'TRUE') return true;
            if (this.options[Name].Value.toUpperCase() === 'FALSE') return false;
            if (this.options[Name].Value === '1') return true;
            if (this.options[Name].Value === '0') return false;
            return defaultVal;
        } catch (err){
            return defaultVal;
        }
    };
    
    this.getText = function(Name, defaultVal){
        this.init();
        if (!this.options[Name]) return defaultVal;
        return this.options[Name].Value;       
    };
});
