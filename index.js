var app = require('express')()
var server = require('http').Server(app)
var io = require('socket.io').listen(server)
var shortid = require('shortid')

app.set('port', 3000)

app.get('/', function(req, res){
  res.send('<h1>Welcome to ePed server</h1>');
});

var clients = []
var countPlayer = 0
var socket

io.on('connection', function(_socket){
  socket = _socket
  var ressult = {
    code: 200,
    message: 'Net available'
  }

  socket.emit('NET_AVAILABLE', result)

  socket.on('SIGNUP', function (data) {
    var currentUser = {
      id: shortid.generate(),
      name: data.name,
      position: data.position
    }

    clients.push(currentUser)
    socket.emit('CONNECTED', currentUser)
    socket.broadcast.emit('USER_CONNECTED', currentUser)
  })

  socket.on('PLAY_AVAILABLE', function(){
    // player request
    var players = {
      player1: clients[0],
      player2: clients[1]
    }

    socket.emit('PLAYER_AVAILABLE', players)
    socket.broadcast.emit('PLAYER_AVAILABLE', players)

  })

})

server.listen( app.get('port'), function (){
  console.log('listening on '+server.address().port)
})
