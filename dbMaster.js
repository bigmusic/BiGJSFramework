/**
 * Created with JetBrains WebStorm.
 * User: BiG
 * Date: 6/6/13
 * Time: 9:10 AM
 * To change this template use File | Settings | File Templates.
 */
var dbChild = require('child_process').fork(__dirname + '/dbChild.js');
dbChild.send(['get', 'big']);

dbChild.on('message', function(msg){
    console.log('in DB,big is ' + msg);
});

/*
var redis = require("redis"),
    client = redis.createClient();

client.on("error", function(err){
    console.log("Error " + err);
});

process.on('message', function(msg){
    client.send_command(msg[0], [msg[1]], function(err, rly){
        process.send(rly);
    });
    client.quit();
});
*/