const { Server } = require("socket.io");
const express= require('express');
const app = express();
const server = app.listen(8000,()=>{
  console.log('server connected')
}) 



const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

app.get("*", (req, res) => {
  res.status(200).sendFile(path.join(path.resolve(), "dist/index.html"));
});


const io = new Server(server, {
  cors: true,
  pingTimeout: 60000,
 
});

io.on("connection", (socket) => {

  console.log(`Socket Connected`);
  socket.on("room:join", (data) => {
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);
    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});
