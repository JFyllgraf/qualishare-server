const express = require('express');
const fileUpload = require('express-fileupload');
const socketio = require('socket.io');
const http = require('http');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users.js');
const PORT = process.env.PORT || 5000;
const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(router);
app.use(fileUpload());

app.post('/upload', (req, res) => {
  console.log("In here");
  if(req.files === null){
    return res.status(400).json({msg:'no file uploaded'});
  }
  const file = req.files.file;
  file.mv(`C:/Users/Ruben/Desktop/uploaded_files/${file.name}`, err => {
    if (err){
      console.error(err);
      return res.status(500).send(err);
    }
    res.json({fileName: file.name, filePath: `/uploaded_files/${file.name}` })
  })
});


io.on('connection', (socket) => {

  // CONTENT SOCKETS
  socket.on('editingText', (data) => {
    //console.log('server: receiving and sending ' + data);
    socket.broadcast.emit('editingText', data);
  });

  //CODE SOCKETS
  socket.on('newCode', (data) => {
    console.log('server: receiving and sending ' + data);
    socket.broadcast.emit('newCode', data);
  });
  socket.on('deleteCode', (data) => {
    //console.log('server: receiving and sending ' + data);
    socket.broadcast.emit('deleteCode', data);
  });

  // CHAT SOCKETS
  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if(error) return callback(error);

    socket.join(user.room);

    socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});
    socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });

    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', { user: user.name, text: message });
    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if(user){
      io.to(user.room).emit('message', {user: 'admin', text: `${user.name} has left.`})
    }
  })
});

const funcsToTest = {};
funcsToTest.add = (num1, num2) => num1 + num2;
funcsToTest.multiply = (num1, num2) => num1 * num2;

module.exports = funcsToTest;


server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
