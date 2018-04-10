var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var path = require("path");
var express = require('express');
var CryptoJS = require("crypto-js");



function EncryptCode(userName){
  var encryptedString = CryptoJS.AES.encrypt(userName, 'https');
  return String(encryptedString);

}
function DecryptCode(userName){
  var bytes  = CryptoJS.AES.decrypt(userName.toString(), 'https');
  var decryptedString = bytes.toString(CryptoJS.enc.Utf8);
  return String(decryptedString);

}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
app.get('/AuthPage.html', function(req, res){
  res.sendFile(__dirname + '/AuthPage.html');
});
app.get('/app.js', function(req, res){
  res.sendFile(__dirname + '/app.js');
});
app.use('/semantic', express.static(path.join(__dirname, 'semantic')))
app.get('/themes/prism-atom-dark.css', function(req, res){
  res.sendFile(__dirname + '/themes/prism-atom-dark.css');
});

io.on('connection', function(socket){
  console.log(socket.id);

  io.to(socket.id).emit('UserID', socket.id);
  socket.on('CodeUpdate', function(msg, ClientID, Room){

    socket.broadcast.emit('CodeUpdate', msg, ClientID, Room);
  });
  socket.on('getJoinCode', function(msg, ClientID){
    console.log(msg);
    io.to(ClientID).emit('returnJoinCode', EncryptCode(msg));

    socket.broadcast.emit('getJoinCode', msg);
  });
  socket.on('AddUser', function(msg, ClientID, picture){
    console.log(msg);
    socket.broadcast.emit('AddUser', msg, ClientID, picture);
  });
  socket.on('joinUser', function(msg, ClientID){
    console.log(msg);
    console.log(DecryptCode(msg));
    io.to(ClientID).emit('returnJoinUser', DecryptCode(msg));

    socket.broadcast.emit('getJoinCode', msg);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
