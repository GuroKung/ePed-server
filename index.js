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
  console.log(socket.conn.id);
  var result = {
    code: 200,
    message: 'Net available'
  }

  socket.emit('NET_AVAILABLE', result)

  socket.on('LOGIN', function (data) {
    var currentUser = {
      socket_id: socket.conn.id,
      id: shortid.generate(),
      name: data.name,
      dances: ''
    }
    console.log(data.name + ' is now connect to server')
    clients.push(currentUser)
    console.log('number of clients: ' + clients.length)
    socket.emit('CONNECTED', {id: shortid.generate(), name: data.name, dances: ''})
    //socket.broadcast.emit('USER_CONNECTED', currentUser)

    if (clients.length === 2) {
      console.log('game start...')
      var game_players = {
        player1: {id: clients[0].id, name: clients[0].name, dances: clients[0].dances},
        player2: {id: clients[1].id, name: clients[1].name, dances: clients[1].dances}
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
    io.emit('ON_LEADDANCE', { lead_dances: players[0].dances })
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
      for(var i=0; i<clients.length ; i++){
        if(clients[i].socket_id === socket.conn.id){
          clients.splice(i ,1)
        }
      }
      console.log('number of clients: ' + clients.length)
      console.log('current clients: ' + clients)
   })


})

server.listen( app.get('port'), function (){
  console.log('listening on '+server.address().port)
})
