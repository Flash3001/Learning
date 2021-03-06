'use strict';

function getConnection() {
    // Firefox seems to reopen the socket when net is back, but Chrome doesn't
    // the approach here is to make Firefox pay for its mistakes or Chrome's? or mines?!.
    // ok! the one paying is me ='(
    
    const URL = "ws://localhost:3000";
    const RETRY_IN = 15000;
    
    var socket = null;
    var lastTimeOnline = null;
    
    // status 
    function isOpen() {
        return socket !== null && socket.readyState === WebSocket.OPEN;
    };

    // helpers    
    function socketSend(o) {
        socket.send(JSON.stringify(o));
    };

    function handleOnOpen(func) { // onopen triggers before it's really opened. You can't send messages when ONCONNECTING
        return new Promise((resolve, reject) => {
            (function runWhenConnected() {
                if (isOpen()) {
                    func();
                    resolve();
                } else  {
                    setTimeout(runWhenConnected, 10); // random
                }
            })();
        });
    };

    // last time online
    function setLastTimeOnline() {
            if (lastTimeOnline === null) {
            lastTimeOnline = new Date().getTime();
        }
    };
    
    function informLastTimeOnline() {
        if (lastTimeOnline === null) return;
        
        socketSend({
            type: "last",
            time: lastTimeOnline
        });
        lastTimeOnline = null;
    };
    
    var socketStream = new Rx.Observable((observer) => {
        // helpers
        function onOpen() {
            observer.next({
                type: "open"
            });
        };

        // IIFE new real socket : look HERE
        (function getNewSocket() {
            var s = socket = new WebSocket(URL); 
            socket.onmessage = e => {
                if (socket == s) { // firefox 
                    observer.next({
                        type: "message",
                        object: JSON.parse(e.data)
                    }); 
                }
            };
            socket.onclose = e => {
                setLastTimeOnline();
                setTimeout(() => {
                    getNewSocket();
                    
                    // second socket open and so on
                    // when reopen I want to get all messages sent to server when I was gone.
                    socket.onopen = e => handleOnOpen(informLastTimeOnline).then(onOpen);
                    socket.onerror = e => socket.close(); // firefox would let it open, chrome closes it.
                }, RETRY_IN); // random: 15s
            };
        })();        

        // applies only for the first socket. Why? I don't care about messages when you were away, but I care about the ones when disconected.
        // and the Resolve thing for the promise.
        socket.onopen = e => handleOnOpen(onOpen);
        socket.onerror = e => socket.close();
    }).share();  // https://medium.com/@benlesh/hot-vs-cold-observables-f8094ed53339
    
    return {
        isOpen:         isOpen,
        openStream:     socketStream.filter(x => x.type === "open"),
        receiveStream:  socketStream.filter(x => x.type === "message").map(x => x.object),
        send:           (data) => socketSend({ type: "message", object: data })
    };
};