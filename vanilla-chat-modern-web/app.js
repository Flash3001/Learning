const express = require('express');
const webSocket = require('ws');

const app = express();
const server = require('http').createServer(app);
const wss = new webSocket.Server({ server });

// history
let history = [];
history.allSince = time => history.filter((v) => v.time >= time);

// enhance websocket
webSocket.Server.prototype.broadcast = function(notForYou, msg) {
    var json = JSON.stringify(msg);
    Array.from(this.clients)
        .filter(client => client != notForYou && client.readyState === webSocket.OPEN)
        .forEach(client => client.send(json));
};

webSocket.prototype.sendMany = function(msgs) {
    msgs.forEach(v => this.send(JSON.stringify(v)));
};

// look HERE... ok: comments are just regions for the eyes!
function handleMessage(client, data) {
    switch (data.type) {
        case "message":
            history.push(data.object);
            wss.broadcast(client, data.object)
            break;
        case "last":
            client.sendMany(history.allSince(data.time));
            break;
    }
};

// plug server stuff
app.use(express.static('www'));
wss.on("connection", function(client){
     client.on("message", msg => handleMessage(client, JSON.parse(msg)));
});
server.listen(3000, () => console.log("working on 3000"));