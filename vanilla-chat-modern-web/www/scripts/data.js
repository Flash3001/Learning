'use strict';

function getDataModel() {
    const DB_NAME = "msgs";
    const TABLE_SEND = "send";

    // get db 
    // was only promisses, but https://stackoverflow.com/questions/28388129/inconsistent-interplay-between-indexeddb-transactions-and-promises
    var getDb = (callback) => {
        var dbRequest = indexedDB.open("db", 1);
        dbRequest.onsuccess = e => callback(e.target.result);
        //dbRequest.onerror = e => reject(e.target.error); 
        dbRequest.onupgradeneeded = function(e) {
            e.target.result.createObjectStore(TABLE_SEND, { keyPath: "time" });
        }
    };

    // helpers
    var requestToProm = request => new Promise((resolve, reject) => {
        request.onsuccess = e => resolve(request.result);
        request.onerror = e => reject(request.error);
    });

    // transactions
    var getWrite = (s, callback) => getDb(db => callback(db.transaction(s, "readwrite")));
    var getRead  = (s, callback) => getDb(db => callback(db.transaction(s, "readonly")));
    
    // CRUD
    var putData = (s, data) => new Promise((resolve, r) => { getWrite(s, tx => resolve(requestToProm(tx.objectStore(s).put(data)))) });
    var getData = (s) => new Promise((resolve, r) => { getRead(s, tx => resolve(requestToProm(tx.objectStore(s).getAll()))) });
    var removeData = (s, key, data) => new Promise((resolve, r) => { getWrite(s, tx => resolve(requestToProm(tx.objectStore(s).delete(data[key])))) });

    // interface
    return {
        addMsg: (msgs) => putData(TABLE_SEND, msgs),
        getMsgsToSend: () => getData(TABLE_SEND),
        confirmMsgSent: (msg) => removeData(TABLE_SEND, "time", msg)
    }; 
};