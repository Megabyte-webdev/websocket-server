const http = require('http');
const { WebSocketServer } = require('ws');

const url = require('url');
const uuidv4 = require('uuid').v4
const server = http.createServer()
const wsServer = new WebSocketServer({ server });
const PORT = process.env.PORT || 8000;

const connections = {}
const users= {}

const broadcast=()=>{
    Object.keys(connections).forEach(uuid=>{
        const connection= connections[uuid]
        const message= JSON.stringify(users)
        connection.send(message)
    })
}

const handleMessage=(bytes, uuid)=>{
    const message= JSON.parse(bytes.toString())
    const user = users[uuid]
    user.state=message

    broadcast()
}
const handleClose= uuid =>{

    delete connections[uuid];
    delete users[uuid]

    broadcast()
}

wsServer.on("connection", (connection, request) => {
    //ws:// or wss:// just like http and https
    //ws://localhost:8000?username=Afowebdev
    const { username } = url.parse(request.url, true).query;
    const uuid= uuidv4()
    console.log(username)
    console.log(uuid)

    connections[uuid]=connection;
    users[uuid]={
        username,
        state:{ }
    }
    //broadcast or fan out to send out response to all connections
    connection.on("message", message=>handleMessage(message, uuid))
    connection.on("close", ()=>handleClose(uuid))
})

server.listen(PORT, () => {
    console.log(`Websocket server is running on port ${PORT}`)
})
