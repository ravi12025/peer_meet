const express = require('express');
const app = express();

const { v4 : uuidv4 } = require('uuid');

const server = require('http').Server(app)
const io = require('socket.io')(server)


const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});

app.set('view engine','ejs');
app.use(express.static("public"));
app.use('/peerjs',peerServer);


app.get("/",function(req,res)
{
    res.redirect(`/${uuidv4()}`);
})

app.get('/:room',(req,res)=>{
    res.render('room',{roomId : req.params.room});
})

io.on('connection', socket => {
    socket.on('join-room', (roomId,userId) => {
      socket.join(roomId);
      console.log("SUCCESSFULL JOINDE ROOM",userId,roomId)
      socket.broadcast.to(roomId).emit('user-connected',userId);

      socket.on('disconnect',(userId)=>{
          console.log("ssisconnect");
        socket.broadcast.emit('user-disconnected',userId);
      });

    socket.on("message", (msg) => {
        io.to(roomId).emit("createMessage", msg,userId);
      });
    
    })

    
  })

server.listen(3000,function(req,res)
{
     console.log("server started runing on port ....");
});