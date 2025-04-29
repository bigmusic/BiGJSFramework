/**
 * Created with JetBrains WebStorm.
 * User: BiG
 * Date: 6/2/13
 * Time: 11:09 PM
 * To change this template use File | Settings | File Templates.
 */
//"use strict";
global.big = {};
var repl = require('repl');
var dbChild = require('child_process').fork(__dirname + '/dbChild.js');
var WebSocketServer = require('websocket').server;
var http = require('http');
var app = function(req, res){
    console.log((new Date()) + ' Received request for ' + req.url);
    res.end();
};
var server = http.createServer(app);
server.listen(8088);
var wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

dbChild.on('message', function(msg){
    wsServer.connections[msg.cNum].sendUTF(msg.msg);
});

global.big.req = wsServer;

wsServer.on('request', function(wsRequest){
    var connection = wsRequest.accept('big-protocol', wsRequest.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.sendUTF(connection.clientNumber);

    connection.on('message', function(message){
        var msg = {};
        msg.clientNumber = connection.clientNumber;
        msg.sendItem = [];
        if(message.type === 'utf8'){
            if(message.utf8Data == 'quit'){
                console.log('Received Message: ' + message.utf8Data);
                dbChild.send('quit');
            }
            else{
                console.log('Received Message: ' + message.utf8Data);
                msg.sendItem = message.utf8Data.split(',');
                console.log(msg.sendItem);
                dbChild.send(msg);
            }
        }
        else if(message.type === 'binary'){
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description){
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
repl.start('>');


/*function originIsAllowed(origin){
 // put logic here to detect whether the specified origin is allowed.
 return true;
 }*/

/*if(!originIsAllowed(wsRequest.origin)){
 // Make sure we only accept requests from an allowed origin
 wsRequest.reject();
 console.log((new Date()) + ' Connection from origin ' + wsRequest.origin + ' rejected.');
 return;
 }*/