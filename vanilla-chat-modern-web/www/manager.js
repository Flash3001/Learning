'use strict';

function getManager() {
    var dataModel = getDataModel();
    var socket = undefined;

    // send and receive messages
    function receiveMessage(msg) {
        ret.receiveMessage(msg);
    }

    function sendMessage(msg) {
        if (socket.isOpen()) {
            return Promise.resolve(socket.send(msg));
        } else {
            return dataModel.addMsg(msg);
        }
    }

    function sendOfflineMessages() {
        function sendMsgs(msgs) {
            if (socket.isOpen() === false || msgs.length < 1) return;
            
            var msg = msgs.shift();
            socket.send(msg);
            dataModel.confirmMsgSent(msg).then(() => sendMsgs(msgs));
        }

        dataModel.getMsgsToSend().then(sendMsgs);
    }

    // interface
    var ret = { 
        sendMessage,
        receiveMessage: (msg) => { } // should be replaced by the user.
    };

    return getSocket({ onMessage: receiveMessage, onOpen: sendOfflineMessages })
        .then(s => socket = s)
        .then(s => ret);
};