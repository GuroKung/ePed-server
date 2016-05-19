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
  console.log(socket);
  var result = {
    code: 200,
    message: 'Net available'
  }

  socket.emit('NET_AVAILABLE', result)

  socket.on('LOGIN', function (data) {
    var currentUser = {
      id: shortid.generate(),
      name: data.name,
      dances: ''
    }
    console.log(data.name + ' is now connect to server')
    clients.push(currentUser)
    console.log('number of clients: ' + clients.length)
    socket.emit('CONNECTED', currentUser)
    socket.broadcast.emit('USER_CONNECTED', currentUser)

    if (clients.length === 2) {
      console.log('game start...')
      var game_players = {
        player1: clients[0],
        player2: clients[1]
      }
      console.log(game_players)
      players = [clients[0], clients[1]]
      io.emit('GAMESTART', game_players)
    }

  })

  socket.on('BeepBeep', function(){
    console.log('beep beep beep')
    socket.emit('OnBeepBeep', { status: 'kuy ped'})
  })

  socket.on('LEADDANCE', function(data){
    console.log('lead dance: ' + data)
    players[0].dances = data.dances
    io.emit('ON_LEADDANCE', players[0].dances)
  })

  socket.on('FOLLOWDANCE', function(data){
    console.log('follow dance: ' + data)
    players[1].dances = data.dances
    var isEnd = false
    var ans = []
    for(var i=0; i<players[0].dances.length ; i++){
      if(players[0].dances[i] === players[1].dances[i]){
        ans.push[true]
      }
      else{
        ans.push[false]
        isEnd = true
      }
    }
    io.emit('ON_CHECKDANCE', { player1_dance: players[0].dances, player2_dance: players[1].dances, ans: ans, isEnd: isEnd })

    // switch lead into follow
    lead = players.shift()
    players.push(lead)
  })

  socket.on('disconnect', function() {
      console.log('Got disconnect!');

      // var i = allClients.indexOf(socket);
      // allClients.splice(i, 1);
   })


})

server.listen( app.get('port'), function (){
  console.log('listening on '+server.address().port)
})
