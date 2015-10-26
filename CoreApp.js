
var coreApp = angular.module("coreApp",["ngRoute","ngResource","mgcrea.ngStrap","ngSanitize","ngAnimate","ngMap","daypilot","chart.js","mwl.calendar"]) //,,

.config(function ($routeProvider,$httpProvider) {
    $routeProvider.when("/profile", {templateUrl:"js/core/view/profile.html"});
    $routeProvider.when("/sync", {templateUrl:"js/core/view/login.html"});
    $routeProvider.when("/menu", {templateUrl:"js/core/view/welcome.html"});
    $routeProvider.when("/welcome", {templateUrl:"js/core/view/welcome.html"});
    $routeProvider.when("/logout", {templateUrl:"js/core/view/logout.html"});
    $routeProvider.when("/view/:formid", {templateUrl:"js/core/view/view.html"});
    $routeProvider.when("/view/:formid/:key", {templateUrl:"js/core/view/view.html"});
    $routeProvider.when("/drilldown/:formid/:index", {templateUrl:"js/core/view/view.html"});
    $routeProvider.when("/viewdetail/:formid/:index", {templateUrl:"js/core/view/view.html"});
    $routeProvider.when("/choicetree/:id/:table", {templateUrl:"js/core/view/choiceTree.html"});
    $routeProvider.when("/choicetree/:id/:table/:parentid", {templateUrl:"js/core/view/choiceTree.html"});
    $routeProvider.when("/admin", {templateUrl:"js/core/view/admin/adminmenu.html"});
    $routeProvider.when("/options", {templateUrl:"js/core/view/admin/options.html"});
    $routeProvider.when("/options/:mode/:id", {templateUrl:"js/core/view/admin/options.html"});
    $routeProvider.when('/users/',{templateUrl : "js/core/view/admin/users.html"});
    $routeProvider.when('/users/:mode/:id',{templateUrl : "js/core/view/admin/users.html"});
    $routeProvider.when('/userexit/',{templateUrl : "js/core/view/admin/userexit.html"});
    $routeProvider.when('/userexit/:mode/:id',{templateUrl : "js/core/view/admin/userexit.html"});
    $routeProvider.when('/prodedit/',{templateUrl : "js/core/view/admin/prodedit.html"});
    $routeProvider.when('/prodedit/:mode/:id',{templateUrl : "js/core/view/admin/prodedit.html"});
    $routeProvider.when('/tree/',{templateUrl : "js/core/view/admin/tree.html"});
    $routeProvider.when('/tree/:mode/:id',{templateUrl : "js/core/view/admin/tree.html"});
    $routeProvider.when('/prodcat',{templateUrl : "js/core/view/prodcat.html"});
    $routeProvider.when('/prodcat/:mode',{templateUrl : "js/core/view/prodcat.html"});
    $routeProvider.when('/prodcat/:mode/:id',{templateUrl : "js/core/view/prodcat.html"});
    $routeProvider.when('/discount',{templateUrl : "js/core/view/discount.html"});
    $routeProvider.when('/discount/:mode/:id',{templateUrl : "js/core/view/discount.html"});
    $routeProvider.when('/discount/:mode/:id/:conditionid',{templateUrl : "js/core/view/discount.html"});
    $routeProvider.when('/prices/',{templateUrl : "js/core/view/prodPrices.html"});
    $routeProvider.when('/prices/:pricelist',{templateUrl : "js/core/view/prodPrices.html"});
    $routeProvider.when('/prices/:pricelist/:mode/:id',{templateUrl : "js/core/view/prodPrices.html"});
    $routeProvider.when('/promo',{templateUrl : "js/core/view/admin/promo.html"});
    $routeProvider.when('/promo/:mode/:id',{templateUrl : "js/core/view/admin/promo.html"});
    $routeProvider.when('/dv',{templateUrl : "js/core/view/admin/dv.html"});
    $routeProvider.when('/dv/:mode/:id',{templateUrl : "js/core/view/admin/dv.html"});
    $routeProvider.when('/dv/:mode/:rtattribute/:possiblevalue',{templateUrl : "js/core/view/admin/dv.html"});
    $routeProvider.when('/activitytypes',{templateUrl : "js/core/view/admin/activitytypes.html"});
    $routeProvider.when('/activitytypes/:mode/:id',{templateUrl : "js/core/view/admin/activitytypes.html"});
    $routeProvider.when('/dayendactivities',{templateUrl : "js/core/view/dayendactivities.html"});
    $routeProvider.when('/dayendactivities/:mode/:id',{templateUrl : "js/core/view/dayendactivities.html"});
    $routeProvider.when('/formtype',{templateUrl : "js/core/view/admin/formtype.html"});
    $routeProvider.when('/formtype/:id',{templateUrl : "js/core/view/admin/formtype.html"});
    $routeProvider.when('/formtype/:mode/:id',{templateUrl : "js/core/view/admin/formtype.html"});
    //Social Routes
    $routeProvider.when("/mycheckins", {templateUrl:"js/core/view/social/myCheckins.html"});
    $routeProvider.when("/mycheckins/:userid", {templateUrl:"js/core/view/social/myCheckins.html"});
    $routeProvider.when("/mycheckins/:mode/:index", {templateUrl:"js/core/view/social/myCheckins.html"});
    $routeProvider.when("/mycheckins/:mode/:index/:userid", {templateUrl:"js/core/view/social/myCheckins.html"});
    $routeProvider.when("/checkin", {templateUrl:"js/core/view/social/groupCheckin.html"});
    $routeProvider.when("/groups/join", {templateUrl:"js/core/view/social/groupJoin.html"});
    $routeProvider.when("/groups/join/:public", {templateUrl:"js/core/view/social/groupJoin.html"});
    $routeProvider.when("/groups", {templateUrl:"js/core/view/social/groups.html"});
    $routeProvider.when("/groups/:id", {templateUrl:"js/core/view/social/groups.html"});
    $routeProvider.when("/groups/:id/:view", {templateUrl:"js/core/view/social/groups.html"});
    $routeProvider.when("/groups/:id/:view/:requests", {templateUrl:"js/core/view/social/groups.html"});
    $routeProvider.when("/groupedit/:id", {templateUrl:"js/core/view/social/groupEdit.html"});
    $routeProvider.when("/groupedit/:id/:refresh", {templateUrl:"js/core/view/social/groupEdit.html"});
    // End Social routes


        AppRoutes($routeProvider);
        //:largecode*\
        //$routeProvider.otherwise({templateUrl:"views/welcome.html"});
        $routeProvider.otherwise({templateUrl:"js/core/view/welcome.html"});

        //Reset headers to avoid OPTIONS request (aka preflight)
        $httpProvider.defaults.headers.common = {};
        $httpProvider.defaults.headers.post = {};
        $httpProvider.defaults.headers.put = {};
        $httpProvider.defaults.headers.patch = {};
    })
    .run(function($location){
        FastClick.attach(document.body);
        if (!localStorage.getItem('currentUser'))
            $location.path('/welcome');
    })

    .factory("GlobalSvc", function(Settings, $location, DaoSvc,$alert){
        return {
            url: function(){
                return Settings.url; //'http://www.dedicatedsolutions.co.za:8082/rest2/';
                //'http://54.206.28.119:8081/Rest/index.php/';//"http://app1.rapidtrade.biz/rest/";
            },
            resturl: function(){
                return Settings.url; //'http://www.dedicatedsolutions.co.za:8082/rest2/';
                //'http://54.206.28.119:8081/Rest/index.php/';//"http://app1.rapidtrade.biz/rest/";
            },
            hasUser: function(){
                if (localStorage.getItem('currentUser'))
                    return true;
                else
                    return false;
            },
            getUser: function(){
                if (localStorage.getItem('currentUser'))
                    return JSON.parse(localStorage.getItem('currentUser'));
                else
                    return { UserID: "", Password: ""};
            },
            busy: function(show) {

            },
            alert: function(msg) {
                alert(msg);
            },
            getmenu: function(){
                return [
                    {name : "Scope",
                        children: [{
                            name : "Grandchild12",
                            children: []
                        },{
                            name : "Grandchild2",
                            children: []
                        },{
                            name : "Grandchild3",
                            children: []
                        }]
                    }, {
                        name: "Deliveries",
                        children: []
                    }];
            },
            toDate: function(strdate){
                try {
                    //return strdate.replace(' 00:00:00','')
                    var newDate;
                    if (strdate.indexOf("/Date(") > -1) {
                        var substringedDate = strdate.substring(6);
                        var parsedIntDate = parseInt(substringedDate.replace(')/',''));
                        newDate = new Date(parsedIntDate);
                    } else {
                        newDate = new Date(strdate.replace(' 00:00:00',''));
                    }
                    return newDate.toLocaleDateString();
                } catch (err){
                    return err.message;
                }
            },
            toDateString: function(date){
                var str = date.getFullYear() + '-' + this.setLeadingZero(date.getMonth()+1) + '-' + this.setLeadingZero(date.getDate());
                return str;
            },
            toMiliString: function(strdate){
                try {
                    var dte = new Date(strdate);
                    var timezoneoffset = dte.getTimezoneOffset() * 60000; //get timezone offset
                    var mili = '/Date(' + dte.getTime() + timezoneoffset  + ')/';
                    return mili;
                } catch (err){
                    return strdate;
                }

            },
            getDate: function(){
                var date = new Date();
                return date.getFullYear() + "-" +
                    this.setLeadingZero((date.getMonth() + 1)) + "-" +
                    this.setLeadingZero(date.getDate()) + "T" +
                    this.setLeadingZero(date.getHours()) + ":"  +
                    this.setLeadingZero(date.getMinutes()) + ":00";
            },
            getGUID: function(){
                var date = new Date();
                var onejan = new Date(date.getFullYear(), 0, 1);
                var yy = date.getFullYear().toString().slice(2);
                var JJJ = this.getJulianDay();
                var dd = this.setLeadingZero(date.getDate());
                var hh = this.setLeadingZero(date.getHours());
                var mm = this.setLeadingZero(date.getMinutes());
                var ss = this.setLeadingZero(date.getSeconds());
                var rr = this.setLeadingZero(Math.floor(Math.random()*100));
                return yy+JJJ+dd+hh+mm+ss+rr;
            },
            /*
             * Pass in a URL such as /funcloc/<id> and this will return the ID portion.
             * Use this to aid with allowing the back button
             * @param {type} view
             * @returns {String}
             */
            geturlid: function(view){
                try {
                    var path = $location.path().replace('/' + view,'');
                    var idx = path.lastIndexOf('/');
                    return (idx === -1) ? '' : path.substring(idx + 1);
                } catch (err) {
                    return '';
                }
            },
            setLeadingZero: function (number) {
                return number < 10 ? '0' + number : number;
            },
            getJulianDay: function(){
                var date = new Date();
                var onejan = new Date(date.getFullYear(), 0, 1);
                var JJJ = (Math.ceil((date - onejan) / 86400000)).toString();
                while (JJJ.length < 3)
                    JJJ = '0' + JJJ;
                return JJJ;
            },
            getTodaysDate : function(){
                var date = new Date();
                var today = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
                return today;
            },
            getSplitDate : function(date){
                date = date.split('.')[0];
                var splitDate = date.split(" ");
                var DateFormatArray = splitDate[0].split("-");
                var TimeFormatArray = splitDate[1].split(":");
                var dateObj = {};
                //parseInt(DateFormatArray[1]),DateFormatArray[2],DateFormatArray[0],TimeFormatArray[0],TimeFormatArray[1],TimeFormatArray[2]
                dateObj.yyyy = parseInt(DateFormatArray[0]);
                dateObj.mm = parseInt(DateFormatArray[1]);
                dateObj.dd = parseInt(DateFormatArray[2]);
                dateObj.hours = parseInt(TimeFormatArray[0]);
                dateObj.minutes = parseInt(TimeFormatArray[1]);
                dateObj.seconds = parseInt(TimeFormatArray[2]);
                return dateObj;
            },
            parseDate : function(date){
                date = date.split('.')[0];
                var splitDate = date.split(" ");
                var DateFormatArray = splitDate[0].split("-");
                var TimeFormatArray = splitDate[1].split(":");
                var dateObj = {};
                //parseInt(DateFormatArray[1]),DateFormatArray[2],DateFormatArray[0],TimeFormatArray[0],TimeFormatArray[1],TimeFormatArray[2]
                dateObj.yyyy = parseInt(DateFormatArray[0]);
                dateObj.mm = parseInt(DateFormatArray[1]);
                dateObj.dd = parseInt(DateFormatArray[2]);
                dateObj.hours = parseInt(TimeFormatArray[0]);
                dateObj.minutes = parseInt(TimeFormatArray[1]);
                dateObj.seconds = parseInt(TimeFormatArray[2]);
                var dte = new Date(dateObj.yyyy, dateObj.mm - 1, dateObj.dd, dateObj.hours, dateObj.minutes, dateObj.seconds);
                return dte;
            },
            sanitiseData: function(json){
                if (!angular.isArray(json)) return json;

                for (var x=0; x < json.length; x++){
                    var item = json[x];
                    delete item.key;
                    delete item.$$hashKey;
                }
                console.log(json);
                return json;
            },
            /*
             * Post data back to server
             */
            postData: function(url,data, onSuccess, onError, table, method, fromSync,forcephp){
                if (fromSync === undefined) fromSync = false;
                for (prop in data){
                    if (angular.isString(data[prop])){
                        //data[prop] = data[prop].replace('&','&amp;');
                        //data[prop] = data[prop].replace('/','&#47;');
                    }
                    if (angular.isDate(data[prop])){
                        var mydate = data[prop];
                        var tz = data[prop].getTimezoneOffset() * -1;
                        var twentyMinutesLater = new Date(mydate.getTime() + (tz * 60 * 1000));
                        data[prop] = twentyMinutesLater;
                        //alert('hello');
                    }
                }

                //Save in case of error posting due to no internet
                unPostedData.Table = table;
                unPostedData.Method = method;
                unPostedData.json = data;
                unPostedData.url = url;
                unPostedData.onError = onError;
                unPostedData.onSuccess = onSuccess;
                unPostedData.key = this.getGUID();

                //Below is if using post.aspx, then add table/method
                var ispostaspx = (url.toLowerCase().indexOf('post') !== -1) ? true : false;
                if (forcephp === undefined) forcephp = false;

                if ((!Settings.phpServer || ispostaspx) && !forcephp) {
                    if (!ispostaspx) url = Settings.url + 'post/post.aspx';
                    var obj = {};
                    obj.Table = table;
                    obj.Method = method;
                    obj.json = JSON.stringify(unPostedData.json); //stringify the json for post.aspx
                    data = $.param(obj);
                    data = JSON.stringify(data);
                    //annoyingly we suround the data with an extra "", so get rid
                    data = data.replace('"',''); //get rid of first "
                    data = data.substr(0,data.length-1); //get rid of last "
                    console.log(obj);
                } else {
                    data = JSON.stringify(data);
                    data = data.replace(/%/g,'');
                }

                $.ajax({
                    type : 'POST',
                    data : data,
                    datatype : 'json',
                    url : url,
                    crossDomain: true,
                    success : onSuccess,
                    error : (fromSync) ? onError : this.postOnError
                });
            },

            postOnError: function(err1, err2, err3){

                DaoSvc.put(unPostedData,
                    'unsent',
                    unPostedData.key,
                    function() {
                        var data = {};
                        data.status = true;
                        data.offline = true;
                        data.ErrorMsg = 'Your item has been saved offline. Please perform a sync as soon as you have 3G coverage';
                        unPostedData.onSuccess(data);
                    },
                    function(tx, e){
                        data.status = false;
                        data.responseText = 'Error saving local item, please try again';
                        unPostedData.onError(data);
                    });
            },

            /*
             * Replaces parameters in a url, either with global values
             * or with values form the object
             */
            setParamaters: function (url, obj){
                if (obj){
                    for (var prop in obj) {
                        url = url.replace(':' + prop,obj[prop]);
                    }
                }
                url = url.replace(':UserID',this.getUser().UserID);
                url = url.replace(':SupplierID',this.getUser().SupplierID);
                url = url.replace(':AccountID',this.getUser().RepID);
                return url;
            },

            findIndex: function (array, property, value){
                if (array===undefined) return -1;
                for (var x=0; x < array.length; x++){
                    if (array[x][property] === value){
                        return x;
                    }
                }
                return -1;
            },
            postImage: function (SupplierID, ID, input, onComplete, onError) {
                if (input.files && input.files[0]) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var image = new Object();
                        image.Id = ID;
                        image.SupplierID = SupplierID;
                        image.FileData = e.target.result.replace('data:image/jpeg;base64,', '');//dataUrl.replace('data:image/jpeg;base64,', '');
                        image.Type = 'image/jpeg;base64';
                        image.Name = image.Id + '.jpg';

                        var imageInfo = {};
                        imageInfo.Table = 'File';
                        imageInfo.Method = 'DeleteAndUploadImage';
                        imageInfo.json = JSON.stringify(image);

                        console.log(imageInfo);
                        var url = Settings.dotnetPostUrl;
                        $.ajax({
                            type: 'POST',
                            data: jQuery.param(imageInfo),
                            //url: 'http://app1.rapidtrade.biz/rest/post/post.aspx',
                            url: url,
                            success: onComplete,
                            error: onError
                        });
                    };
                    reader.readAsDataURL(input.files[0]);

                }
            },

            getGPS : function (onSuccess,onError){
                var options = {
                    enableHighAccuracy: true,
                    timeout: 50000,
                    maximumAge: 0
                };
                var getPosition = function (position){
                    if(onSuccess){
                        onSuccess(position);
                    }
                };
                var error = function(error){
                    if(onError){
                        console.warn(error);
                        onError(error)
                    }
                };
                if(navigator.geolocation){
                    navigator.geolocation.getCurrentPosition(getPosition, error, options);
                }else{
                    $alert({ content: "This item cannot be saved without capturing your current location. Please ensure your location settings are enabled", duration: 5, placement: 'top-right', type: 'danger', show: true});
                }
            }
        };
    });
var unPostedData = {};
