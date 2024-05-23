const userModel = require('./routes/users')
const io = require("socket.io")();
const socketapi = {
    io: io
};

// Add your socket.io logic here!
io.on("connection", function (socket) {
    // console.log(socket.id)
    // io.to(socket.id).emit('sony', "hello from server")

    socket.on('join-server', async function(username) {
        const currentUser = await userModel.findOne({
            username: username
        })

        const onlineUsers = await userModel.find({
            socketId: { $nin: [ "" ] },
            username: { $nin: [ currentUser.username ] }
        })

        onlineUsers.forEach(onlineUser => {
            socket.emit('newUserJoined', {
                img: onlineUser.img,
                username: onlineUser.username,
                lastMessage: "Hello !",
                id: onlineUser._id
            })
        });

        socket.broadcast.emit('newUserJoined', {
            img: currentUser.img,
            username: currentUser.username,
            lastMessage: "Hello !",
            id: currentUser._id
        })

        // const onlineUsers = await userModel.find({
        //     socketId: {
        //         $nin: [ '' ]
        //     },
        //     username: { $nin: [ currentUser.username ] }
        // })

        // onlineUsers.forEach(onlineUser => {
        //     socket.emit('newUserJoined', {
        //         img: onlineUser.img,
        //         username: onlineUser.username,
        //         lastMessage: 'Hello !'
        //     })
        // })




        // socket.broadcast.emit('newUserJoined', {
        //     img: currentUser.img,
        //     username: currentUser.username,
        //     lastMessage: 'Hello !'
        // })

        currentUser.socketId = socket.id
        await currentUser.save()
    })
    socket.on('disconnect', async () => {
        await userModel.findOneAndUpdate({
            socketId: socket.id
        }, {
            socketId: ''
        })
    })

    socket.on('privateMessage', async msg => {
        const toUser = await userModel.findById(msg.toUser)
        io.to(toUser.socketId).emit('recPvt',msg.msg)
    })

    console.log("A user connected");
});
// end of socket.io logic

module.exports = socketapi;