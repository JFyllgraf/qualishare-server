const express = require('express');
const fileUpload = require('express-fileupload');
const socketio = require('socket.io');
const http = require('http');


const { addUser, removeUser, getUser, getUsersInRoom } = require('./users.js');
const {quote_schema, Quote} = require('./db_schemas/quote_schema');
const {code_schema, Code} = require('./db_schemas/code_schema');
const uri = "mongodb+srv://dbUser:HTJCOtJR25povwdT@clusterboi-omexg.azure.mongodb.net/test?retryWrites=true&w=majority";
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;
const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
//const bodyParser = require('body-parser');

app.use(router);
app.use(fileUpload());
app.use(express.json());
//this is also important

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'OPTIONS, POST, DELETE');
  next();
});

app.post('/upload', (req, res) => {
  if(req.files === null){
    return res.status(400).json({msg:'no file uploaded'});
  }
  const file = req.files.file;
  file.mv(`C:/Users/Ruben/Desktop/uploaded_files/${file.name}`, err => { //this is callback, previous way before promises
    if (err){
      console.error(err);
      return res.status(500).send(err);
    }
    res.json({fileName: file.name, filePath: `/uploaded_files/${file.name}` })
  })
});

let socket;

app.post('/newQuote', (req, res) => {
  console.log("in here");
  try {
    mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
      let quote = new Quote();
      quote.quoteText = req.body.quoteText
      quote.quoteOffSet = req.body.quoteOffset
      quote.codeRefs = req.body.codeRefs
      quote.documentNum = req.body.documentNum
      return quote
    }).then(quote => {
      quote.save().then((data) => {
        res.status(200).json(data);
        console.log("Data: ", data);
      }).catch( err => {
        res.status(400).json("Error: " + err);
        mongoose.disconnect();
      })
    }).catch(err =>{
      mongoose.disconnect();
    })
  }
  catch (err) {
    console.log(err);
  }
})

app.delete('/deleteQuote', (req, res) =>{
  console.log("in here");
  try {
    mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
    Quote.deleteOne(req.body.id, (err) =>{
      if (!err){
        res.status(200).json("Ok");
      }
      else{
        res.status(503).json("Could not delete quote: ", err);
      }
    })
    }).catch(err =>{
      res.status(500).json(err);
      mongoose.disconnect();
    })
  }
  catch (err) {
    console.log(err);
  }
})

function saveQuotePromise(quote) {
  quote.save().then((saveResult) => {
    console.log(saveResult);
    return Quote.find();
  }).then((result) => {
    console.log(result);
    mongoose.disconnect();
  }).catch(err => {
    if (err) {
      console.log(err);
      mongoose.disconnect();
    }
  })
}

io.on('connection', (socket) => {

  // CONTENT SOCKETS
  socket.on('editingText', (data) => {
    //console.log('server: receiving and sending ' + data);
    socket.broadcast.emit('editingText', data);
  });

  //CODE SOCKETS
  socket.on('newCode', (data) => {
    console.log('server: newCode' + data);

    socket.broadcast.emit('newCode', data);
  });
  socket.on('deleteCode', (data) => {
    //console.log('server: receiving and sending ' + data);
    socket.broadcast.emit('deleteCode', data);
  });
  //QUOTE SOCKET
  socket.on("newQuote", data => {
    console.log('server: new quote ' + data);
    socket.broadcast.emit('newQuote', data);
  });
  socket.on("deleteQuote", data =>{
    console.log("server: delete quote" + data)
    socket.broadcast.emit("deleteCode", data);
  })

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





server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
