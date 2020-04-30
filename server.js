const express = require('express');
const fileUpload = require('express-fileupload');
const socketio = require('socket.io');
const http = require('http');
const pdf = require('pdf-parse');
const process = require('process');

const randomColor = require('randomcolor');
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

app.use(router);
app.use(fileUpload());
app.use(express.json());

//this is also important, very important
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'OPTIONS, POST, DELETE');
  next();
});

try{
  mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
  console.log("Established database connection!");
}
catch{
  console.log("Error: could not connect to database, restart server");
}

//req, res properties see express documentation
app.post('/upload', (req, res) => {
  if(req.files === null){
    return res.status(400).json({msg:'no file uploaded'});
  }
  let file = req.files.file
  if(file.name.toLowerCase().includes("pdf")){
    pdf(file).then(function(data) {
      res.status(200).json(data.text); //documentation see pdf parse package
    }).catch(err=>{
      res.status(500).json(err);
    });
  }
  else{
    res.status(400).json("Could not handle anything else than pdf file");
  }
});

app.post('/newQuote', (req, res) => {
  console.log("in here");
  try {
      let quote = new Quote();
      quote.quoteText = req.body.quoteText;
      quote.quoteOffSet = req.body.quoteOffset;
      quote.codeRefs = req.body.codeRefs;
      quote.documentNum = req.body.documentNum;
      quote.userName = req.body.userName;
      quote.memo = req.body.memo;
      console.log(req.body.userName);
      quote.save().then((data) => {
        res.status(200).json(data);
      }).catch( err => {
        res.status(400).json("Error: " + err);
      })
  }
  catch (err) {
    console.log(err);
  }
})

app.delete('/deleteQuote', (req, res) =>{
  try {
    Quote.deleteOne({_id: req.body._id}, (err) =>{
      if (!err){
        res.status(200).json("Ok");
      }
      else{
        res.status(503).json(err);
        console.log(err);
      }
    })
  }
  catch (err) {
    console.log(err);
  }
})

app.post('/newCode', (req, res) => {
  console.log("in new code");
  try {
      let code = new Code();
      code.codeName = req.body.codeName;
      code.color = randomColor();
      code.userName = req.body.userName;

      code.save().then((code) => {
        res.status(200).json(code);
      }).catch( err => {
        res.status(400).json("Error: " + err);
      })
  }
  catch (err) {
    console.log(err);
  }
})

//modify code, when adding quotes

app.delete('/deleteCode', (req, res) =>{
  try {
      Code.deleteOne({_id: req.body._id}, (err) =>{
        if (!err){
          res.status(200).json("Ok");
        }
        else{
          res.status(503).json(err);
          console.log(err);
        }
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
  }).catch(err => {
    if (err) {
      console.log(err);
    }
  })
}

//***********************GET REQUESTS************************
app.get("/Codes", (req, res) => {
  try {
      Code.find().then(codes => {
        res.status(200).json(codes);
      }).catch(err => {
        res.status(500).json(err);
      });
  } catch (err) {
    console.log(err);
  }
});

app.get("/Quotes", (req, res) => {
  try {
      Quote.find().then(quotes => {
        res.status(200).json(quotes);
      }).catch(err => {
        res.status(500).json(err);
        console.log(err);
      });
  } catch (err) {
    console.log("Catch: ", err);
  }
});
app.get("/Quotes/by_Code_id", (req, res) => {
  try {
    console.log(req.query);
    Quote.find({codeRefs: req.query._id}).then(quotes => {
      console.log(quotes);
      res.status(200).json(quotes);
    }).catch(err => {
      res.status(500).json(err);
      console.log(err);
    });
  } catch (err) {
    console.log(err);
  }
});

io.on('connection', (socket) => {

  // CONTENT SOCKETS
  socket.on('editingText', (data) => {
    //console.log('server: receiving and sending ' + data);
    socket.broadcast.emit('editingText', data);
  });

  //CODE SOCKETS
  socket.on('newCode', (data) => {
    console.log('server IO: newCode' + data);
    socket.broadcast.emit('newCode', data);
  });
  socket.on('deleteCode', (data) => {
    console.log('server IO: deleteCode' + data);
    socket.broadcast.emit('deleteCode', data);
  });
  //QUOTE SOCKET
  socket.on("newQuote", data => {
    console.log('server IO: new quote ' + data);
    socket.broadcast.emit('newQuote', data);
  });
  socket.on("deleteQuote", data =>{
    console.log("server IO: delete quote" + data)
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

process.on('SIGINT', () => {
  console.log('Received SIGINT. Press Control-D to exit.');
  mongoose.disconnect();
  console.log("Disconnected from MongoDB");
});
process.on('exit', (code) => {
  console.log(`About to exit with code: ${code}`);
  mongoose.disconnect();
  console.log("Disconnected from MongoDB");
});
