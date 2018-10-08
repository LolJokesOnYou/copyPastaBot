const TelegramBot = require('node-telegram-bot-api');
var express = require('express');
var porn = require("./xvideos");
var nsfw = require('./nsfw');
var shorturl = require('shorturl');
var app = express();
app.set('port', (process.env.PORT || 5000));
app.get('/', function(request, response) {
  
});
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

const token = '473658427:AAGJXIoOmy6NSpibouOebZG8Znacn-dgCMY';
const bot = new TelegramBot(token, { polling: true });

bot.on('polling_error', (error) => {
    console.log(error);  // => 'EFATAL'
  });

bot.on('message', (msg) => {

    var Hi = "hi";
    if (msg.text.toString().toLowerCase().indexOf(Hi) === 0) {
        bot.sendMessage(msg.chat.id, "Hello dear user");
    }

    var bye = "bye";
    if (msg.text.toString().toLowerCase().includes(bye)) {
        bot.sendMessage(msg.chat.id, "Hope to see you around again , Bye");
    }

    var robot = "I'm robot";
    if (msg.text.indexOf(robot) === 0) {
        bot.sendMessage(msg.chat.id, "Yes I'm robot but not in that way!");
    }
});

let search = (url, callback) => {   
    console.log(res);
    if(!!res) 
        callback(null,res);
    else 
        callback(new Error('cannot find video'));
}

bot.onText(/\/pic/, (msg) => {
    nsfw.getDetails('https://www.xvideos.com/video27038715/perfect_ass_fuck-more_on_https_lc.cx_jhfa', function(err,res){
        if(err)
            console.log(err);
        shorturl(res.flv,'bit.ly', {
            login: 'o_oq2v5lqfv',
            apiKey: 'R_f626f1196810453a85bca245b9b37fcc'}, function(err, shortUrl){
            if(err)
                console.log(err);
            bot.sendPhoto(msg.chat.id, res.thumb,{caption: `${res.title}\nLink - ${shortUrl.data.url}`}, 'MARKDOWN');
        });
        
   });
});

bot.onText(/\/random/, (msg) => {
    nsfw.searchPorn(randomQuery,function(err,results){
        if(err)
            console.log('no videos');
        nsfw.getDetails(url, function(err1, result){
            if(err){
                console.log('not able show video');
            }
            bot.sendVideo(msg.chat.id, result.flv,{caption: result.title})
        });
    });
});

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome");
});

bot.onText(/\/sendpic/, (msg) => {
    bot.sendPhoto(msg.chat.id, "https://www.pexels.com/photo/scenic-view-of-beach-248797/", { caption: "Random Pic" });
});
