/************************************************************************
 *  Copyright 2010-2011 Worlize Inc.
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ***********************************************************************/

var extend = require('./utils').extend;
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var WebSocketRequest = require('./WebSocketRequest');
var Constants = require('./Constants');

var WebSocketServer = function WebSocketServer(config) {
    this._handlers = {
        upgrade: this.handleUpgrade.bind(this),
        requestAccepted: this.handleRequestAccepted.bind(this)
    };
    this.connections = {};
    if (config) {
        this.mount(config);
    }
};

util.inherits(WebSocketServer, EventEmitter);

WebSocketServer.prototype.mount = function(config) {
    this.config = {
        // The http server instance to attach to.  Required.
        httpServer: null,
        
        // 64KiB max frame size.
        maxReceivedFrameSize: 0x10000,

        // 1MiB max message size, only applicable if
        // assembleFragments is true
        maxReceivedMessageSize: 0x100000,
        
        // Outgoing messages larger than fragmentationThreshold will be
        // split into multiple fragments.
        fragmentOutgoingMessages: true,
        
        // Outgoing frames are fragmented if they exceed this threshold.
        // Default is 16KiB
        fragmentationThreshold: 0x4000,
        
        // If true, the server will automatically send a ping to all
        // clients every 'keepaliveInterval' milliseconds.  The timer is
        // reset on any received data from the client.
        keepalive: true,
        
        // The interval to send keepalive pings to connected clients if the
        // connection is idle.  Any received data will reset the counter.
        keepaliveInterval: 20000,
        
        // If true, the server will consider any connection that has not
        // received any data within the amount of time specified by
        // 'keepaliveGracePeriod' after a keepalive ping has been sent to
        // be dead, and will drop the connection.
        // Ignored if keepalive is false.
        dropConnectionOnKeepaliveTimeout: true,
        
        // The amount of time to wait after sending a keepalive ping before
        // closing the connection if the connected peer does not respond.
        // Ignored if keepalive is false.
        keepaliveGracePeriod: 10000,
        
        // Whether to use native TCP keep-alive instead of WebSockets ping
        // and pong packets.  Native TCP keep-alive sends smaller packets
        // on the wire and so uses bandwidth more efficiently.  This may
        // be more important when talking to mobile devices.
        // If this value is set to true, then these values will be ignored:
        //   keepaliveGracePeriod
        //   dropConnectionOnKeepaliveTimeout
        useNativeKeepalive: false,
        
        // If true, fragmented messages will be automatically assembled
        // and the full message will be emitted via a 'message' event.
        // If false, each frame will be emitted via a 'frame' event and
        // the application will be responsible for aggregating multiple
        // fragmented frames.  Single-frame messages will emit a 'message'
        // event in addition to the 'frame' event.
        // Most users will want to leave this set to 'true'
        assembleFragments: true,
        
        // If this is true, websocket connections will be accepted
        // regardless of the path and protocol specified by the client.
        // The protocol accepted will be the first that was requested
        // by the client.  Clients from any origin will be accepted.
        // This should only be used in the simplest of cases.  You should
        // probably leave this set to 'false' and inspect the request
        // object to make sure it's acceptable before accepting it.
        autoAcceptConnections: false,
        
        // The Nagle Algorithm makes more efficient use of network resources
        // by introducing a small delay before sending small packets so that
        // multiple messages can be batched together before going onto the
        // wire.  This however comes at the cost of latency, so the default
        // is to disable it.  If you don't need low latency and are streaming
        // lots of small messages, you can change this to 'false'
        disableNagleAlgorithm: true,
        
        // The number of milliseconds to wait after sending a close frame
        // for an acknowledgement to come back before giving up and just
        // closing the socket.
        closeTimeout: 5000
    };
    extend(this.config, config);
    
    // this.httpServer = httpServer;
    // if (typeof(pathRegExp) === 'string') {
    //     pathRegExp = new RegExp('^' + pathRegExp + '$');
    // }
    // this.pathRegExp = pathRegExp;
    // this.protocol = protocol;
    if (this.config.httpServer) {
        this.config.httpServer.on('upgrade', this._handlers.upgrade);
    }
    else {
        throw new Error("You must specify an httpServer on which to mount the WebSocket server.")
    }
};

WebSocketServer.prototype.unmount = function() {
    this.config.httpServer.removeListener('upgrade', this._handlers.upgrade);
};

WebSocketServer.prototype.closeAllConnections = function() {
    this.connections.forEach(function(connection) {
        connection.close();
    });
};

WebSocketServer.prototype.broadcast = function(data) {
    if (Buffer.isBuffer(data)) {
        this.broadcastBytes(data);
    }
    else if (typeof(data.toString) === 'function') {
        this.broadcastUTF(data);
    }
};

WebSocketServer.prototype.broadcastUTF = function(utfData) {
    this.connections.forEach(function(connection) {
        connection.sendUTF(utfData);
    });
};

WebSocketServer.prototype.broadcastBytes = function(binaryData) {
    this.connections.forEach(function(connection) {
        connection.sendBytes(binaryData);
    });
};

WebSocketServer.prototype.shutDown = function() {
    this.unmount();
    this.closeAllConnections();
};

WebSocketServer.prototype.handleUpgrade = function(request, socket, head) {
    var wsRequest = new WebSocketRequest(socket, request, this.config);
    try {
        wsRequest.readHandshake();
    }
    catch(e) {
        wsRequest.reject(
            e.httpCode ? e.httpCode : 400,
            e.message,
            e.headers
        );
        if (Constants.DEBUG) {
            console.error((new Date()) + " WebSocket: Invalid handshake: " + e.message);
        }
        return;
    }

    wsRequest.once('requestAccepted', this._handlers.requestAccepted);
    
    if (!this.config.autoAcceptConnections && this.listeners('request').length > 0) {
        this.emit('request', wsRequest);
    }
    else if (this.config.autoAcceptConnections) {
        wsRequest.accept(wsRequest.requestedProtocols[0], wsRequest.origin);
    }
    else {
        wsRequest.reject(404, "No handler is configured to accept the connection.");
    }
};

WebSocketServer.prototype.handleRequestAccepted = function(connection) {
    var self = this;
    var randomName=Math.floor(Math.random()*1000000+1);
    var checkClientNumber = function(){
        if(self.connections[randomName]){
            randomName = Math.floor(Math.random() * 1000000 + 1);
            checkClientNumber();
        }
        return;
    }
    checkClientNumber();
    connection.once('close', function(closeReason, description) {
        self.handleConnectionClose(connection, closeReason, description);
    });
    connection.clientNumber=randomName;
    this.connections[randomName]=connection;
    //this.connections.push(connection);
    this.emit('connect', connection);
};

WebSocketServer.prototype.handleConnectionClose = function(connection, closeReason, description) {
    /*var index = this.connections.indexOf(connection);
    if (index !== -1) {
        this.connections.splice(index, 1);
    }*/
    delete this.connections[connection.clientNumber];
    this.emit('close', connection, closeReason, description);
};

module.exports = WebSocketServer;