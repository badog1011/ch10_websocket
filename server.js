var express = require('express')
  , wsio = require('websocket.io')

/**
*Create express app.
*
**/
var app = express.createServer();

/**
*
* Attach websocket server to express
*
**/

var ws = wsio.attach(app);

/**
*
* Serve your code
*
**/

app.use(express.static('public'));

/**
*
* Listening on connection
*
**/
var postions = {}
  , total = 0;
ws.on('connection', function (socket) {
	//you give an id and socket
	socket.id = ++total;

	//you send the position of everyone else
	socket.send(JSON.stringify(postions));//發送JSON格式的位置訊息

	socket.on('message', function (msg) {
		try {
			var pos = JSON.parse(msg);
			broadcast(JSON.stringify({ type: 'position', pos: pos, id: socket.id}));
		} catch (e) {
			return;
		}

		postions[socket.id] = pos;//把每個位置傳給每個用戶 依id來區分
	});
	socket.on('close', function () {
		delete postions[socket.id];
		broadcast(JSON.stringify({ type: 'disconnect', id: socket.id}));
	});
	
	function broadcast (msg) {
		for (var i = 0, l = ws.clients.length; i < l; i++) {
			//you call 'send' on the other clients
			if (ws.clients[i] && socket.id != ws.clients[i].id) {
				ws.clients[i].send(msg);
			}
		}
	}
});


app.listen(3000);