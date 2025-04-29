/**
 * Created with JetBrains WebStorm.
 * User: BiG
 * Date: 6/5/13
 * Time: 5:30 PM
 * To change this template use File | Settings | File Templates.
 */
var redis = require("redis"),
    client = redis.createClient();

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

client.on("error", function(err){
    console.log("Error " + err);
});

/*client.set("string key", "string val", redis.print);
client.hset("hash key", "hashtest 1", "some value", redis.print);
client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
client.hkeys("hash key", function(err, replies){
    console.log(replies.length + " replies:");
    replies.forEach(function(reply, i){
        console.log("    " + i + ": " + reply);
    });
    client.quit();
});*/

client.send_command("get",["big"],function(err,rly){
    console.log(rly);
});
client.quit();