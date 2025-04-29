/**
 * Created with JetBrains WebStorm.
 * User: BiG
 * Date: 6/6/13
 * Time: 9:10 AM
 * To change this template use File | Settings | File Templates.
 */

var redis = require("redis"),
    redisClient = redis.createClient(8089, "192.168.101.25");
var sendItem = {};
sendItem.cNum = '';
sendItem.msg = '';

redisClient.on("error", function(err){
    console.log("Error " + err);
});

process.on('message', function(msg){

    var order = msg.sendItem[0], argu = [msg.sendItem[1]];
    if(msg != 'quit'){
        if(msg.sendItem.length > 2){
            argu = msg.sendItem.slice(1);
        }
        else{
        }
        redisClient.send_command(order, argu, function(err, rly){
            sendItem.cNum = msg.clientNumber;
            sendItem.msg = rly;
            process.send(sendItem);
        });
    }
    else{
        redisClient.quit();
        process.send('db is disconnect');
    }
});