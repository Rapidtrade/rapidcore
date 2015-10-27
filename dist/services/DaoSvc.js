//var daoSvc = (function(){
coreApp.service("DaoSvc", function(Settings){

    //var instance;	
    //function instanceObj() { 
    this.openeded = false;

    this.getKey = function(table, item){
        if (!this.idx) this.idx = this.findIndex(Settings.tableKeys,'table',table);
        if (this.idx === -1) {
            alert('Problem, you need Settins.tableKeys defined to define keys and indexes for table ' + table);
            return;
        }
        var tbl = Settings.tableKeys[this.idx];
        //var tbl = Settings.tableKeys[this.idx];
        return tbl.getKey(item);
    };

    this.getIndex = function(table, index, item){
        if (!this.idx) this.idx = this.findIndex(Settings.tableKeys,'table',table);
        //if (this.idx === -1) {
        //alert('Problem, you need Settins.tableKeys defined to define keys and indexes for table ' + table);
        //   return;
        //}
        var tbl = Settings.tableKeys[this.idx];
        //if no index defined, return nothing
        if (!tbl['index' + index]) return undefined;
        //else runt the index<X> function
        return tbl['index' + index](item);
    };

    this.get = function (table, key, ponsuccessread, ponerror, poncomplete) {
        if (g_indexedDB)
            this.idbget(table, key, ponsuccessread, ponerror, poncomplete);
        else
            this.sqlget(table, key, ponsuccessread, ponerror, poncomplete);
    };

    /*
     * pass in a jsonobject and
     */
    this.put = function (json, table, key, ponsuccesswrite, ponerror, poncomplete) {
        if ((table === 'productCategories2') && (!json.p))
            json.p = 'PC';

        /*var idx = this.findIndex(Settings.tableKeys,'table',table);
         if (idx === -1) {
         alert('Problem, you need Settins.tableKeys defined to define keys and indexes for table ' + table);
         return;
         }
         var tbl = Settings.tableKeys[idx];
         for (var x=0; x<items.length; x++){
         var item = items[x];
         //check for deleted as a string and convert to boolean
         if (item.Deleted){
         if (item.Deleted === "0") item.Deleted = false;
         if (item.Deleted === "1") item.Deleted = true;
         }
         if (!item.key) item.key = tbl.getKey(item);
         }*/

        if (g_indexedDB)
            this.idbput(json, table, key, ponsuccesswrite, ponerror, poncomplete);
        else
            this.sqlput(json, table, key, ponsuccesswrite, ponerror, poncomplete);
    };

    /*
     * pass in a jsonobject and
     */
    this.putMany = function (items, table, ponsuccesswrite, ponerror, poncomplete) {
        if (table==='DisplayFields') items = this.tempCorrection(items);
        if (!items) return;
        if (items.length===0) return;

        var idx = this.findIndex(Settings.tableKeys,'table',table);
        if (idx === -1) {
            alert('Problem, you need Settins.tableKeys defined to define keys and indexes for table ' + table);
            return;
        }
        var tbl = Settings.tableKeys[idx];
        for (var x=0; x<items.length; x++){
            var item = items[x];
            //check for deleted as a string and convert to boolean
            if (item.Deleted){
                if (item.Deleted === "0") item.Deleted = false;
                if (item.Deleted === "1") item.Deleted = true;
            }
            if (!item.key) item.key = tbl.getKey(item);
        }
        delete this.idx;
        if (g_indexedDB)
            this.idbputMany(items, table, ponsuccesswrite, ponerror, poncomplete);

        else
            this.sqlputMany(items, table, ponsuccesswrite, ponerror, poncomplete);
    };

    /*
     * Below only needed till PHP is fixed
     * @param {type} items
     * @returns {unresolved}
     */
    this.tempCorrection = function (items){
        for (var x=0; x<items.length; x++){
            if (items[x].Visible==='0') items[x].Visible = false;
            else if (items[x].Visible==='1') items[x].Visible = true;

            if (items[x].ReadOnly==='0') items[x].ReadOnly = false;
            else if (items[x].ReadOnly==='1') items[x].ReadOnly = true;

            if (items[x].Mandatory==='0') items[x].Mandatory = false;
            else if (items[x].Mandatory==='1') items[x].Mandatory = true;

            if (!isNaN(parseInt(items[x].SortOrder))) items[x].SortOrder = parseInt(items[x].SortOrder);
        }
        return items;
    };

    this.index = function (table, key, idx, ponsuccessread, ponerror, poncomplete) {
        if (g_indexedDB)
            this.idbindex(table, key, idx, ponsuccessread, ponerror, poncomplete);
        else
            this.sqlindex(table, key, idx, ponsuccessread, ponerror, poncomplete);
    };

    this.indexsorted = function (table, key, idx, sortidx, ponsuccessread, ponerror, poncomplete) {
        if (g_indexedDB)
        //TODO: implement an idbindexsorted then we can implement below. for indexeddb we just call index for now
            this.idbindex(table, key, idx, ponsuccessread, ponerror, poncomplete);
        else
            this.sqlindexsorted(table, key, idx, sortidx, ponsuccessread, ponerror, poncomplete);
    };


    this.cursor = function (table, ponsuccessread, ponerror, poncomplete) {
        if (g_indexedDB)
            this.idbcursor(table, ponsuccessread, ponerror, poncomplete);
        else
            this.sqlcursor(table, ponsuccessread, ponerror, poncomplete);
    };

    this.count = function (table, key, index,  poncomplete, ponerror) {
        if (g_indexedDB)
            this.idbcount(table, key, index,  poncomplete, ponerror);
        else
            this.sqlcount(table, key, index,  poncomplete, ponerror);
    };


    /*
     * The first method called and is opens the database for the page
     */
    this.openDB = function (pdbopened) {
        var isIE = function() {
            var tmp = document.documentMode;
            // Try to force this property to be a string. 
            try{
                document.documentMode = "";
            } catch(e){
            };
            // If document.documentMode is a number, then it is a read-only property, and so 
            // we have IE 8+.
            // Otherwise, if conditional compilation works, then we have IE < 11.
            // Otherwise, we have a non-IE browser. 
            result = typeof document.documentMode === "number" ? !0 : eval("/*@cc_on!@*/!1");
            // Switch back the value to be unobtrusive for non-IE browsers. 
            try {
                document.documentMode = tmp;
            }catch(e){
            };
            return result;
        };

        g_indexedDB = false;
        if (isIE()) g_indexedDB = true;
        if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)) g_indexedDB = true;

        if (g_indexedDB)
            this.idbopenDB(pdbopened);
        else
            this.sqlopenDB(pdbopened);
        this.openeded = true;
    };

    /*
     * d
     */
    this.deleteDB = function (pondbdeleted) {
        var seq = localStorage.getItem('sequenceNumber');
        var seqday = localStorage.getItem('sequenceDay');

        if (g_indexedDB)
            this.idbdeleteDB(pondbdeleted);
        else
            this.sqldeleteDB(pondbdeleted);

        //reset sequence number
        if (seq) localStorage.setItem('sequenceNumber',seq);
        if (seqday) localStorage.setItem('sequenceDay',seqday);
    };

    this.clear = function (table) {
        if (g_indexedDB)
            this.idbclear(table);
        else
            this.sqlclear(table);
    };
    this.deleteItem = function (table, key, idx, ponerror, poncomplete) {
        if (g_indexedDB)
            this.idbdeleteItem(table, key, idx, ponerror, poncomplete);
        else
            this.sqldeleteItem(table, key, idx, ponerror, poncomplete);
    };

    this.clearBasket = function (table, accountID, type, ponerror, poncomplete) {
        if (g_indexedDB)
            this.idbclearBasket(table, accountID, type, ponerror, poncomplete);
        else
            this.sqlclearBasket(table, accountID, type, ponerror, poncomplete);
    };

    /***************** Indexed DB ********************************************************************************
     * this method is used to read the database.
     * to be be consistent for indexeddb and websql we will trigger an event when we have read the data
     *************************************************************************************************************/
    this.idbget = function (table, key, ponsuccessread, ponerror, poncomplete) {
        //TODO - fix this...
        if (table === 'tree') table = 'Tree';


        //get the local user and enter the userid on the screen
        var objectStore = this.db.transaction(table).objectStore(table);
        var request = objectStore.get(key);
        request.onerror = function (event) {
            ponerror("No record found");
        };
        request.onsuccess = function (event) {
            if (event.target.result === undefined) {
                if (ponerror !== undefined)
                    ponerror("No record found");
            } else {
                if (ponsuccessread !== undefined)
                    ponsuccessread(event.target.result);
            }
        };
    };

    /*
     * pass in a jsonobject and
     */
    /*
     * pass in a jsonobject and
     */
    this.idbputMany = function (json, table, ponsuccesswrite, ponerror, poncomplete) {
        var $this = this;
        this.idbputManyRecurse(0, json, table, ponsuccesswrite, ponerror, poncomplete, $this);
    };

    this.idbputManyRecurse = function (idx, json, table, ponsuccesswrite, ponerror, poncomplete, $this) {
        if (idx === json.length) {
            if (poncomplete) poncomplete();
            return;
        }
        var item = json[idx];
        //var key = $this.getKeyField(item, table); --handled in parent function
        if (item.Deleted){
            if (item.Deleted === "0") item.Deleted = false;
            if (item.Deleted === "1") item.Deleted = true;
        }

        if (!item.key || item.key === undefined) item.key = $this.getKey(table,item);
        console.log(table + ' key: ' + item.key);
        if (item.Deleted || item.del)
            $this.idbput(json[idx], table, item.key,
                function(){
                    idx += 1;
                    $this.idbputManyRecurse(idx, json, table, ponsuccesswrite, ponerror, poncomplete, $this)
                },
                ponerror, undefined);
        else
            $this.idbput(json[idx],
                table,
                item.key,
                function(){
                    idx += 1;
                    $this.idbputManyRecurse(idx, json, table, ponsuccesswrite, ponerror, poncomplete, $this)
                },
                ponerror, undefined);
    };


    /*
     * pass in a jsonobject and
     */
    this.idbput = function (json, table, keyf, ponsuccesswrite, ponerror, poncomplete) {
        var $this = this;
        // for index range purposes
        json.key = keyf;
        try {
            json.index1 = $this.getIndex(table,1,json);//getsqlIndex1(table, json); 
            if(json.index1 === null){
                json.index1 = "";
            }
        } catch (err){
            console.log('index1 not defined correctly for ' + table);
        }

        try {
            json.index2 = $this.getIndex(table,2,json);//getsqlIndex1(table, json); 
            if(json.index2 === null){
                json.index2 = "";
            }
        } catch (err){
            console.log('index2 not defined correctly for ' + table);
        }

        try {
            json.index3 = $this.getIndex(table,3,json);//getsqlIndex1(table, json);
            if(json.index3 === null){
                json.index3 = "";
            }
        } catch (err){
            console.log('index3 not defined correctly for ' + table);
        }

        try {
            json.index4 = $this.getIndex(table,4,json);//getsqlIndex1(table, json); 
            if(json.index4 === null || json.index4 === undefined){
                json.index4 = "";
            }
        } catch (err){
            console.log('index4 not defined correctly for ' + table);
        }

        if ('Pricelists' === table)
            json[g_pricelistSortField] = 'PL:' + json.pl + ';' + g_pricelistSortField.toUpperCase() + ':' + json[g_pricelistSortField];

        var transaction;

        try {
            transaction = this.db.transaction(table, 'readwrite');
        } catch (err) {
            if (ponerror !== undefined)
                ponerror("error getting database");
            return;
        }

        transaction.oncomplete = function (event) {
            if (poncomplete !== undefined)
                poncomplete();
        };

        transaction.onerror = function (event) {
            if (ponerror !== undefined)
                ponerror(event);
        };

        var objectStore = transaction.objectStore(table);
        //json.key = key;

        try {
            var request = objectStore.put(json);
            request.onsuccess = function (event) {
                if (ponsuccesswrite !== undefined)
                    ponsuccesswrite();
            };
        } catch (err){
            console.log(err.toString());
        }
    };

    this.idbindexsorted = function (table, key, idx, sortidx, ponsuccessread, ponerror, poncomplete) {
        $this = this;
        $this.idbresult = [];
        $this.sortidx = sortidx;
        $this.sort = function(a,b){
            if (a[$this.sortidx] < b[$this.sortidx])
                return -1;
            else
                return 1;
        };
        var transaction = $this.db.transaction(table, "readwrite");
        //in complete, we need to sort before returning
        transaction.oncomplete = function (event) {
            $this.idbresult.sort($this.sort);
            for (var x=0; x < $this.idbresult.length; x++){
                if (ponsuccessread !== undefined) ponsuccessread($this.idbresult[x]);
            }
            if (poncomplete !== undefined) poncomplete();
        };
        transaction.onerror = function (event) {
            if (ponerror !== undefined)
                ponerror(event);
        };
        var noResult = true;
        var objectStore = transaction.objectStore(table);
        var index = objectStore.index(idx);
        var singleKeyRange = IDBKeyRange.only(key);
        index.openCursor(singleKeyRange).onsuccess = function (event) {

            var cursor = event.target.result;
            if (cursor) {
                noResult = false;
                $this.idbresult.push(cursor.value);
                // cursor.key is a name, like "Bill", and cursor.value is the whole object.
                //if (ponsuccessread !== undefined) 
                //        ponsuccessread(cursor.value);
                cursor['continue']();
            } else if (ponerror && noResult) {
                ponerror(key);
            }

        };
    };

    this.idbindex = function (table, key, idx, ponsuccessread, ponerror, poncomplete) {

        if(key === null || key === "null"){
            key = "";
        }

        var transaction = this.db.transaction(table, "readwrite");
        transaction.oncomplete = function (event) {
            if (poncomplete !== undefined)
                poncomplete();
        };
        transaction.onerror = function (event) {
            if (ponerror !== undefined)
                ponerror(event);
        };
        var noResult = true;
        var objectStore = transaction.objectStore(table);
        var index = objectStore.index(idx);
        var singleKeyRange = IDBKeyRange.only(key);
        index.openCursor(singleKeyRange).onsuccess = function (event) {
            console.log('in');
            //var cursor = event.target.result;
            if (event.target.result) {
                noResult = false;
                // cursor.key is a name, like "Bill", and cursor.value is the whole object.
                if (ponsuccessread !== undefined)
                    ponsuccessread(event.target.result.value);
                event.target.result['continue']();
            } else if (ponerror && noResult) {
                ponerror(key);
            }

        };
    };

    this.idbcount = function (table, key, idx, poncomplete ,ponerror ) {
        var transaction = this.db.transaction(table, "readwrite");
        var counter = 0;
        transaction.oncomplete = function (event) {
            if (poncomplete !== undefined)
                poncomplete(counter);
        };
        transaction.onerror = function (event) {
            if (ponerror !== undefined)
                ponerror(event);
        };
        var noResult = true;
        var objectStore = transaction.objectStore(table);
        var index = objectStore.index(idx);
        var singleKeyRange = IDBKeyRange.only(key);
        index.openCursor(singleKeyRange).onsuccess = function (event) {
            console.log('in');
            var cursor = event.target.result;
            if (cursor) {
                console.log(cursor.value);
                counter += 1;
                cursor['continue']();
            } else if (ponerror && noResult) {
                ponerror(key);
            }

        };
    };

    this.idbcursor = function (table, ponsuccessread, ponerror, poncomplete) {
        var transaction = this.db.transaction(table, "readwrite");
        // Do something when all the data is added to the database.
        transaction.oncomplete = function (event) {
            if (poncomplete !== undefined)
                poncomplete();
        };

        transaction.onerror = function (event) {
            if (ponerror !== undefined)
                ponerror(event);
        };

        var objectStore = transaction.objectStore(table);
        objectStore.dao = this;
        /*if (key !== undefined) {
         var keyfrom = key;
         var keyto = key + '}}}';
         var boundKeyRange = IDBKeyRange.bound(keyfrom, keyto);
         objectStore.openCursor(boundKeyRange).onsuccess = function (event) {
         var cursor = event.target.result;
         if (cursor) {
         //$(document).trigger('rowreadOK',cursor.value);
         if (ponsuccessread !== undefined)
         ponsuccessread(cursor.value);
         cursor['continue']();
         };
         };
         } else {*/
        objectStore.openCursor().onsuccess = function (event) {
            //var cursor = event.target.result;
            /* (cursor) {
             //$(document).trigger('rowreadOK',cursor.value);
             if (ponsuccessread !== undefined)
             ponsuccessread(cursor.value);
             cursor['continue']();
             };*/
            if (event.target.result) {
                //$(document).trigger('rowreadOK',cursor.value);
                if (ponsuccessread !== undefined)
                    ponsuccessread(event.target.result.value);
                event.target.result['continue']();
            };
        };
        //};
    };

    /*
     * The first method called and is opens the database for the page
     */
    this.idbopenDB = function (pdbopened) {
        if(!localStorage.getItem('currentUser')) return;

        var $this = this;
        window.indexedDB = window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.indexedDB;
        window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
        window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

        var request = window.indexedDB.open(Settings.dbName, 22);
        request.onerror = function (event) {
            //g_alert("Error opening database");
            console.log("Error opening database");
        };

        request.onupgradeneeded = function (event) {
            console.log('upgrade needed');
            $this.db = event.target.result;
            $this.idbcreateTables($this, pdbopened);
        };

        request.onsuccess = function (event) {
            console.log("Database opened");
            $this.db = request.result;
            if (pdbopened) pdbopened();
        };
    };

    this.idbcreateTables = function($this, pdbopened){
        console.log('create tables');
        var objectStore;
        for(var i = 0; i < Settings.tableKeys.length; i++){
            try {
                $this.db.deleteObjectStore(Settings.tableKeys[i].table);
            } catch (error){
                console.log('could not delete table ' + error.toString());
            }
            try {
                objectStore = $this.db.createObjectStore(Settings.tableKeys[i].table, { keyPath: "key" });
            } catch (error) {
                console.log("Table Already exists " + Settings.tableKeys[i].table);
            }
            try {
                objectStore.createIndex("index1", "index1", { unique: false });
            } catch (error) {
                console.log("index 1 already exists" + error.toString());
            }
            try {
                objectStore.createIndex("index2", "index2", { unique: false });
            } catch (error) {
                console.log("index 1 already exists");
            }
            try {
                objectStore.createIndex("index3", "index3", { unique: false });
            } catch (error) {
                console.log("index 1 already exists");
            }
            console.log(Settings.tableKeys + " All OK " + + Settings.tableKeys[i].table);
        }
        if (pdbopened) pdbopened();
    };


    this.idbdeleteDB = function (pondbdeleted) {
        localStorage.clear();
        sessionStorage.clear();
        var $this = this;
        var objectStoreLength = this.db.objectStoreNames.length;
        console.log(objectStoreLength);

        var clearObjectStore = function($this,x){
            if(x === objectStoreLength){
                if (pondbdeleted !== undefined) {
                    pondbdeleted();
                }else{
                    return;
                }
            }

            var table = db.objectStoreNames.item(x);
            var transaction = db.transaction(table, 'readwrite');
            try {
                var objectStore = transaction.objectStore(table);
                var objectStoreRequest = objectStore.clear();

                objectStoreRequest.onsuccess = function(event){
                    console.log("Success Clear:" + $this.db.objectStoreNames[x]);
                    x = x + 1;
                    clearObjectStore($this,x);
                };

                objectStoreRequest.onerror = function(error){
                    console.log("Error In Clear The DB");
                    x = x + 1;
                    clearObjectStore($this,x);
                };
                //$this.db.deleteObjectStore(objectStore);
            } catch (error) {
                console.log(error.toString());
                x = x + 1;
                clearObjectStore($this,x);
            }
        };

        //this.idbopenDB(function (){
        var DBOpenRequest = window.indexedDB.open(Settings.url, 22);

        DBOpenRequest.onsuccess = function(event) {
            //var db = DBOpenRequest.result;
            db = DBOpenRequest.result;
            clearObjectStore($this,0);
        };

        DBOpenRequest.oncomplete = function(){
            if (pondbdeleted !== undefined)
                pondbdeleted();
        };



        /*var clearObjectStore = function($this,x){
         if(x > objectStoreLength){
         if (pondbdeleted !== undefined) {
         pondbdeleted();
         }else{
         return;
         }
         }
         var table = $this.db.objectStoreNames.item(x);
         var transaction = $this.db.transaction(table, 'readwrite');
         try {
         var objectStore = transaction.objectStore(table);
         var objectStoreRequest = objectStore.clear();

         objectStoreRequest.onSuccess = function(){
         x = x + 1;
         clearObjectStore($this,x);
         };


         //$this.db.deleteObjectStore(objectStore);
         } catch (error) {
         console.log(error.toString());
         x = x + 1;
         clearObjectStore($this,x);
         }
         };
         clearObjectStore($this,0);*/


        /*for (var x = 0; x < $this.db.objectStoreNames.length; x++) {
         var table = $this.db.objectStoreNames.item(x);
         var transaction = $this.db.transaction(table, 'readwrite');
         try {
         var objectStore = transaction.objectStore(table);
         objectStore.clear();
         //$this.db.deleteObjectStore(objectStore);
         } catch (error) {
         console.log(error.toString());
         //g_alert(error.toString());
         }
         }*/

        //if (pondbdeleted !== undefined)
        //    pondbdeleted();
        //});

    };

    this.idbclear = function (table) {
        poncomplete = this.oncomplete;
        var transaction = this.db.transaction(table, 'readwrite');
        transaction.oncomplete = function (event) {
            if (poncomplete !== undefined)
                poncomplete();
        };
        var objectStore = transaction.objectStore(table);
        objectStore.clear();

    };

    this.idbdeleteItem = function (table, key, idx, ponerror, poncomplete) {
        var transaction = this.db.transaction(table, 'readwrite');
        transaction.oncomplete = function (event) {
            if (poncomplete !== undefined)
                poncomplete();
        };

        var objectStore = transaction.objectStore(table);
        objectStore.dao = this;

        if (idx) {
            var index = objectStore.index(idx);
            var singleKeyRange = IDBKeyRange.only(key);
            var $this = this;
            index.openCursor(singleKeyRange).onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    $this.db.transaction(table, 'readwrite').objectStore(table)['delete'](cursor.value.key);
                    cursor['continue']();
                };
            };
        } else {
            $this.db.transaction(table, 'readwrite').objectStore(table)['delete'](key);
        }
        /*
         //poncomplete = this.oncomplete;
         var transaction = this.db.transaction(table, 'readwrite');

         transaction.oncomplete = function (event) {
         if (poncomplete !== undefined)
         poncomplete();
         };
         var objectStore = transaction.objectStore(table);

         var request = objectStore.get(key);
         request.onerror = function (event) {
         ponerror("No record found");
         };
         objectStore['delete'](key);
         */
    };

    this.idbclearBasket = function (table, accountID, type, ponerror, poncomplete) {
        var transaction = this.db.transaction(table, 'readwrite');
        transaction.oncomplete = function (event) {
            if (poncomplete !== undefined)
                poncomplete();
        };

        var objectStore = transaction.objectStore(table);
        objectStore.dao = this;
        objectStore.openCursor().onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                if (cursor.value.AccountID === accountID && cursor.value.Type === type) {
                    db.transaction(table, 'readwrite').objectStore(table)['delete'](cursor.value.key);
                };

                cursor['continue']();
            };
        };

    };


    /**************************************** Web SQL **********************************************
     *
     ***********************************************************************************************/
    /*
     * this method is used to read the database.
     * to be be consistent for indexeddb and websql we will trigger an event when we have read the data 
     */
    this.sqlget = function (table, key, ponsuccessread, ponerror, poncomplete) {
        this.db.transaction(function (tx) {
            tx.executeSql('SELECT [json] FROM ' + table + ' where keyf = ?',
                [key],
                function (tx, results) {
                    if (ponsuccessread !== undefined) {
                        try {
                            ponsuccessread(JSON.parse(results.rows.item(0).json));
                        } catch (error) {
                            if (ponerror !== undefined)
                                ponerror("No record found");
                        }
                    }
                },
                function (tx, e) {
                    if (ponerror !== undefined)
                        ponerror();
                });
        });
    };

    /*
     * pass in a jsonobject and 
     */
    /*
     * pass in a jsonobject and 
     */
    this.sqlput = function (item, table, keyf, ponsuccesswrite, ponerror, poncomplete){
        var $this = this;
        this.db.transaction(function (tx) {
            var idx = $this.findIndex(Settings.tableKeys,'table',table);
            var tbl = Settings.tableKeys[idx];
            var sql = 'INSERT or REPLACE INTO ' + table + '(keyf, json, index1, index2, index3, index4)'
                + 'VALUES (?,?,?,?,?,?)';
            tx.executeSql(sql,
                [keyf, JSON.stringify(item), $this.getIndex(table,1,item), $this.getIndex(table,2,item), $this.getIndex(table,3,item), $this.getIndex(table,4,item)],
                function (tx, results) {
                    if (ponsuccesswrite !== undefined)
                        ponsuccesswrite();
                },
                function (tx, e) {
                    if (ponerror !== undefined)
                        ponerror(tx, e);
                });
        });
    };

    /*
     * pass in a jsonobject and 
     */
    this.sqlputMany = function (items, table, ponsuccesswrite, ponerror, poncomplete) {
        if (!items) return;
        var $this = this;

        this.db.transaction(function (tx) {
                for (var x=0; x<items.length;x++) {
                    var item = items[x];
                    if ((table === 'productcategories2') && (!item.p)) item.p = 'PC';
                    var idx = $this.findIndex(Settings.tableKeys,'table',table);
                    var tbl = Settings.tableKeys[idx];

                    if (item.Deleted || item.del) {
                        $this.deleteItem(table, item.key, undefined, undefined, undefined);
                    } else {
                        var sql = 'INSERT or REPLACE INTO ' + table + '(keyf, json, index1, index2,index3, index4) VALUES (?,?,?,?,?,?)';
                        tx.executeSql(sql, [item.key, JSON.stringify(item), $this.getIndex(table,1,item), $this.getIndex(table,2,item), $this.getIndex(table,3,item), $this.getIndex(table,4,item)]);
                    }
                };
            },

            function (tx) {
                if (ponerror !== undefined) ponerror(tx);
            },
            function (){
                if (poncomplete !== undefined) poncomplete();
            });

    };

    /*
     * Builds a key field for each table type
     *
     this.getKeyField = function (item, table) {
     var keyf = '';
     switch (table) {
     case "DisplayFields":
     keyf = item.SupplierID + item.ID + item.Name;
     break;
     case "Options":
     keyf = item.SupplierID + item.Name;
     break;
     case "productcategories2":
     keyf = item.s + item.c;
     break;
     case "Tree":
     keyf = item.SupplierID + item.TreeID;
     break;
     case "ActivityTypes":
     keyf = item.SupplierID + item.EventID;
     break;
     case "productcategories2":
     keyf = item.s + item.c;
     break;
     case "WorkOrders" :
     keyf = item.orderidField;
     break;
     case "Functlocations" :
     keyf = item.functlocationField;
     break;
     case "ReasonCodes" :
     keyf = item.grdtxField;
     break;
     }
     return keyf.trim();
     };
     */

    //todo - turn these into proper functions 
    /*function getsqlIndex1(table, item) {
     try {
     switch (table) {
     case 'productcategories2':
     return item.p;
     break;
     case 'DisplayFields':
     return item.ID;
     break;
     case 'Tree':
     return item.Group;
     break;
     case 'ShoppingCart':
     return item.AccountID;
     break;
     case 'ActivityTypes':
     return item.EventID;
     break;
     case 'WorkOrders' :
     return item.orderTypeField;
     break;
     case 'Functlocations' :
     return item.supflocField;
     break;
     case 'WorkItems' :
     return item.activityField;
     break;
     case 'ReasonCodes' :
     return item.grundField;
     break;
     }
     } catch (error) {
     return '';
     };
     };

     function getsqlIndex2(table, item) {
     try {
     switch (table) {
     case 'productcategories2':
     return item.c;
     break;
     case 'DisplayFields':
     return item.SortOrder;
     break;
     case 'Tree':
     return item.ParentTreeID;
     break;
     case 'ShoppingCart':
     return item.ProductID;
     break;
     case 'WorkOrders':
     return item.pmacttypeField;
     break;
     case 'Functlocations' :
     return item.funclocField;
     break;
     case 'WorkItems' :
     return item.workOrderID;
     break;
     case 'ReasonCodes' :
     return item.mandtField;
     break;
     }
     } catch (error) {
     return '';
     };
     };

     function getsqlIndex3(table, item) {
     try {
     switch (table) {
     case 'productcategories2':
     return item.des;
     case 'Tree':
     return item.SortOrder;
     break;
     case 'ShoppingCart':
     return item.Description;
     break;
     case 'WorkOrders' :
     return item.funclocField;
     break;
     case 'ReasonCodes' :
     return item.werksField;
     break;
     }
     } catch (error) {
     return '';
     };
     };

     function getsqlIndex4(table, item) {
     try {
     return '';
     } catch (error) {
     return '';
     };
     };

     function getsqlIndex4(table, item) {
     try {
     return '';
     } catch (error) {
     return '';
     };
     };*/

    function checkindex (idx){
        if (idx !== 'index1' && idx !== 'index2' && idx !== 'index3' && idx !== 'index4') {
            idx = 'index1'; // index can only be either Index1 or Index2. so default to index1 of not valid
            console.log('Issue with this index used, defaulting to index1');
        }
        return idx;
    };



    this.sqlindex = function (table, key, idx, ponsuccessread, ponerror, poncomplete) {

        var sqlstmt = (key) ? 'SELECT [json] FROM ' + table + ' where ' + checkindex(idx) + '= ?' : 'SELECT [json] FROM ' + table + ' where ' + checkindex(idx) + ' is ?'

        this.db.transaction(function (tx) {
            //tx.executeSql('SELECT [json] FROM ' + table + ' where ' + checkindex(idx) + '= ?', [key], function (tx, results) {
            tx.executeSql(sqlstmt, [key], function (tx, results) {
                if (ponsuccessread !== undefined) {
                    try {
                        var len = results.rows.length, i;
                        if (!len) {
                            ponerror(key);
                        }
                        for (i = 0; i < len; i++) {
                            ponsuccessread(JSON.parse(results.rows.item(i).json));
                        }
                        if (poncomplete !== undefined)
                            poncomplete();
                    } catch (error) {
                        if (ponerror !== undefined)

                            ponerror("No record found");
                    };
                };
            });
        });
    };

    this.sqlindexsorted = function (table, key, idx, sortidx, ponsuccessread, ponerror, poncomplete) {
        this.db.transaction(function (tx) {
            tx.executeSql('SELECT [json] FROM ' + table + ' where ' + checkindex(idx) + '= ? order by ' + checkindex(sortidx), [key], function (tx, results) {
                if (ponsuccessread !== undefined) {
                    try {
                        var len = results.rows.length, i;
                        if (!len) {
                            ponerror(key);
                        }
                        for (i = 0; i < len; i++) {
                            ponsuccessread(JSON.parse(results.rows.item(i).json));
                        }
                        if (poncomplete !== undefined)
                            poncomplete();
                    } catch (error) {
                        if (ponerror !==  undefined)
                            ponerror("No record found");
                    };
                };
            });
        });
    };

    this.sqlcount = function (table, key, idx, poncomplete, ponerror) {
        if (idx !== 'index1' && idx !== 'index2' && idx !== 'index3' && idx !== 'index4') {
            idx = 'index1'; // index can only be either Index1 or Index2. so default to index1 of not valid
            console.log('Issue with this index used, defaulting to index1');
        }
        this.db.transaction(function (tx) {
            tx.executeSql('SELECT count(keyf) as cnt FROM ' + table + ' where ' + idx + '= ?', [key], function (tx, results) {
                if (poncomplete !== undefined) {
                    try {
                        var len = results.rows.item(0).cnt;
                        if (len > 0)
                            poncomplete(len);
                        else
                            ponerror(0);
                    } catch (error) {
                        if (ponerror !== undefined)
                            ponerror("No record found");
                    };
                };
            });
        });
    };


    this.sqlcursor = function (table, ponsuccessread, ponerror, poncomplete) {
    	if (!this.db) return;
        this.db.transaction(function (tx) {
            tx.executeSql('SELECT [json] FROM ' + table, [], function (tx, results) {
                if (ponsuccessread !== undefined) {
                    try {
                        var len = results.rows.length, i;
                        for (i = 0; i < len; i++) {
                            ponsuccessread(JSON.parse(results.rows.item(i).json));
                        }
                        if (poncomplete !== undefined) {
                            if (len > 0)
                                poncomplete(len);
                            else
                                ponerror(0);
                        }

                    } catch (error) {
                        if (ponerror !== undefined)
                            ponerror("No record found");
                    };
                };
            });
        });
    };

    
    this.sqlRecurseTables = function(tx, i, onComplete){
    	if (i >= Settings.tableKeys.length ) {
    		if (onComplete) onComplete();
    		return;
    	}
    	var $this = this;
        var createString = 'CREATE TABLE IF NOT EXISTS '+ Settings.tableKeys[i].table + ' (keyf, json, index1, index2, index3, index4, primary key (keyf))';
        tx.executeSql(createString, [], function(tx,result){
        	i++;
        	$this.sqlRecurseTables(tx, i, onComplete);
        });
    };

    /*
     * The first method called and is opens the database for the page
     */
    this.sqlopenDB = function (onComplete) {  	
        this.db = openDatabase(Settings.dbName, '1.0', 'MM database', 2 * 1024 * 1024);
        this.sqlCreateTables(onComplete);
    };
    
    this.sqlCreateTables = function(onComplete){
    	if (!this.db) 
    		return;
    	var $this = this;
        this.db.transaction(function (tx) {
        	$this.sqlRecurseTables(tx, 0, onComplete);
        });    	
    };
    

    this.sqldeleteDB = function (pondbdeleted) {
        var tableKeys = JSON.parse(localStorage.getItem('localTablesCache'));
        localStorage.clear();
        sessionStorage.clear();
        this.db.transaction(function (tx) {

            /*tx.executeSql('drop table if EXISTS DisplayFields ');
             tx.executeSql('drop table if EXISTS Options  ');
             tx.executeSql('drop table if EXISTS Unsent  ');
             tx.executeSql('drop table if EXISTS ProductCategories2  ');
             tx.executeSql('drop table if EXISTS Tree  ');
             tx.executeSql('drop table if exists ShoppingCart  ');
             tx.executeSql('drop table if exists ActivityTypes  ');
             tx.executeSql('drop table if exists WorkItems');
             tx.executeSql('drop table if exists WorkOrders');
             tx.executeSql('drop table if exists Functlocations');
             tx.executeSql('drop table if exists ReasonCodes');*/

            for(var i = 0; i < tableKeys.length; i++){
                var dropString = 'drop table if EXISTS '+ tableKeys[i].table;
                tx.executeSql(dropString);
            }

        });

        if (pondbdeleted !== undefined)
            pondbdeleted();
    };

    this.sqlclear = function (table, poncomplete, ponerror) {
        this.db.transaction(function (tx) {
            tx.executeSql('delete FROM ' + table, [], function (tx, results) {
                if (poncomplete !== undefined) {
                    poncomplete();
                };
            });
        });
    };

    this.sqldeleteItem = function (table, key, idx, ponerror, poncomplete) {
        this.db.transaction(function (tx) {
            if (idx) if (idx.length===0) idx = undefined;
            if (idx) {
                tx.executeSql('delete FROM ' + table + ' where index1 = ?', [key], function (tx, results) {
                    if (poncomplete !== undefined) {
                        poncomplete();
                    };
                });
            } else {
                tx.executeSql('delete FROM ' + table + ' where keyf = ?', [key], function (tx, results) {
                    if (poncomplete !== undefined) {
                        poncomplete();
                    };
                });
            }
        });
    };

    this.findIndex = function (array, property, value){
        if (array===undefined) return -1;
        for (var x=0; x < array.length; x++){
            if (array[x][property] === value){
                return x;
            }
        }
        return -1;
    }
    /*
     };
     return {
     getInstance: function(){
     if(!instance){
     instance = new instanceObj;
     }
     return instance;
     }
     };
     */
});
//})();
