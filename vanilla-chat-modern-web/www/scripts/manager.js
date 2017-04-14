'use strict';

function getManager() {
    var dataModel = getDataModel();
    var connection = getConnection();
    
    // send and receive messages
    function sendMessage(msg) {
        if (connection.isOpen()) {
            return Promise.resolve(connection.send(msg));
        } else {
            return dataModel.addMsg(msg);
        }
    }

    function sendOfflineMessages() {
        function sendMsgs(msgs) {
            if (connection.isOpen() === false || msgs.length < 1) return;
            
            var msg = msgs.shift();
            connection.send(msg);
            dataModel.confirmMsgSent(msg).then(() => sendMsgs(msgs));
        }

        dataModel.getMsgsToSend().then(sendMsgs);
    }

    // plugs
    connection.openStream.subscribe(sendOfflineMessages);

    return { 
        sendMessage,
        receiveStream: connection.receiveStream,
    };
};