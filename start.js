/**
 * Created by Mortoni on 19/11/13.
 */
var readline = require('readline');
var rl;
var config = require('./config');
var viz = require('./viz');

var app = require('http').createServer(handler)
    , io = require('socket.io').listen(app, {log: false})
    , fs = require('fs');

var portNo = config.chatserver.port

app.listen(portNo);

function handler (req, res) {
    fs.readFile(__dirname + '/public' +  '/indexTest.html',
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading indexTest.html');
            }

            res.writeHead(200);
            res.end(data);
        });
}

io.sockets.on('connection', function (socket) {
    console.log('\x1b[32m\socket connection\x1b[37m');
    socket.emit('news', { hello: 'world' });
    socket.on('dataIn', function (data) {
        console.log('\x1b[32m\ ' + JSON.stringify(data) + '\x1b[37m');
        viz.sendCommand(data.my);
    });
});

console.log('Opening viz...');
viz.ip = config.engine.viz;
viz.open();

console.log('Opening command line...');
rl = readline.createInterface(process.stdin, process.stdout, null);
rl.setPrompt('> ');
/*
 rl.question('Which Viz?', function(answer) {
 me.name = answer;
 console.log('Hello', me.name);
 })

Colours
31 red
32 green
33 yellow
34 blue
35 purple
36 light blue
37 white
38 white
39 white

 */


console.log('\x1b[36m\nBrowse to port \x1b[37m' + portNo);
console.log('\nWaiting for commands...("quit" to exit)');

rl.on('line', function(cmd) {

    if (cmd === 'quit') {
        rl.question('Are you sure? (y/n) ', function(answer) {
            if (answer === 'y') {
                viz.close();
                rl.close();
            } else {
                rl.prompt();
            }
        });
    } else {
        // parse the command
        //
        if (cmd === "v") {
            viz.version(false);
        } else if (cmd === "r") {
            viz.replySwap();
        } else if (cmd === "q") {
            viz.quietSwap();
        } else if (cmd === "d") {
            viz.destroy();
        } else if (cmd === "e") {
            viz.end();
        } else {
            viz.sendCommand(cmd);       // eg MAIN VERSION
        }
        //    console.log('You typed:', cmd);
        //    console.log('Type "quit" to exit');
        rl.prompt();
    }

});

rl.on('close', function() {
    console.log('Bye');
    process.exit();
});

rl.prompt();