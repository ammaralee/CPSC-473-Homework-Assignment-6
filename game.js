"use strict";

var express = require("express"), //Requiring express module
    bodyParser = require("body-parser"), //Requiring body-parser module
    http = require("http"),
    game,
    redis = require("redis"), //Requiring redis module
    redisClient,
    wins,
    losses;

game = express();

//using bodyParse to parse json
game.use(bodyParser.json());

//starting the server
http.createServer(game).listen(3000, function () {
    console.log("Listening on port 3000 ! Let's Play..");
});

//Creating redisClient
redisClient = redis.createClient();

//Flips the coin
game.post("/flip", function (req, res) {

    //stores call's choice of heads or tails
    var callHeadsOrTails = req.body.call;

    //get random number between 0 and 1
    var array = Math.floor((Math.random() * 2));

    //generates random coin of heads or tails
    var call_heads_or_tails = ["heads", "tails"];
    var coin = call_heads_or_tails[array];
    console.log("System's Call:  " + coin);

    //compares the coins to get win or lose
    if (callHeadsOrTails === coin) {
        redisClient.incr("wins")
        console.log("Player Calls:  " + callHeadsOrTails);

        res.json({
            "result": "win"
        });
    } else {
        redisClient.incr("losses")
        console.log("Player Calls:  " + callHeadsOrTails);


        res.json({
            "result": "loss"
        });
    }

});

//Current wins and losses values from Redis
game.get("/stats", function (req, res) {

    redisClient.mget(["wins", "losses"], function (err, results) {

        if (err !== null) {
            console.log("Error: " + err);

            return;
        }

        wins = parseInt(results[0], 10) || 0;
        losses = parseInt(results[1], 10) || 0;
        console.log("The score is :{ wins: " + wins + ", losses: " + losses + " }");
        res.json({

            "wins": wins,
            "losses": losses
        });

    });
});

//Resetting wins and losses values to 0
game.delete("/stats", function (req, res) {

    redisClient.set("wins", 0);
    redisClient.set("losses", 0);

    console.log("stats has been reset to Win = 0 and loss = 0 !");
    res.json({
        "wins": 0,
        "losses": 0
    });
});
