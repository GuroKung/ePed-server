var app = require('express')()
var server = require('http').Server(app)
var io = require('socket.io').listen(server)
var shortid = require('shortid')

app.set('port', process.env.PORT || 3000)

app.get('/', function(req, res){
  res.send('<h1>Welcome to ePed server</h1>');
});

var players = []
var clients = []
var socket

io.on('connection', function(_socket){
  console.log('on connection')
  socket = _socket
  var result = {
    code: 200,
    message: 'Net available'
  }

  socket.emit('NET_AVAILABLE', result)

  socket.on('LOGIN', function (data) {
    var currentUser = {
      id: shortid.generate(),
      name: data.name,
      dance: ''
    }
    console.log(data.name + ' is now connect to server')
    clients.push(currentUser)
    console.log('number of clients: ' + clients.length)
    socket.emit('CONNECTED', currentUser)
    socket.broadcast.emit('USER_CONNECTED', currentUser)

    if (countPlayer === 2) {
      console.log('game start...')
      var game_players = {
        player1: clients[0],
        player2: clients[1]
      }
      players = [clients[0], clients[1]]
      socket.emit('GAMESTART', game_players)
    }

  })

  socket.on('BeepBeep', function(){
    console.log('beep beep beep')
    socket.emit('OnBeepBeep', { status: 'kuy ped'})
  })

  socket.on('LEADDANCE', function(data){
    console.log(data)
    players[0].dance = data.dance
    socket.broadcast.emit('ON_LEADDANCE', players[0].dance)
  })

  socket.on('FOLLOWDANCE', function(data){
    console.log(data)
    players[1].dance = data.dance
    var isEnd = false
    var ans = []
    for(var i=0; i<players[0].dance.length ; i++){
      if(players[0].dance[i] !== players[1].dance[i]){
        isEnd = true
        break
      }
    }
    for(var i=0; i<players[0].dance.length ; i++){
      if(players[0].dance[i] === players[1].dance[i]){
        ans.push[true]
      }
      else{
        ans.push[false]
      }
    }
    socket.broadcast.emit('ON_CHECKDANCE', { player1_dance: players[0].dance, player2_dance: players[1].dance, ans: ans, isEnd: isEnd })

    // switch lead into follow
    lead = players.shift()
    players.push(lead)
  })

})

server.listen( app.get('port'), function (){
  console.log('listening on '+server.address().port)
})
