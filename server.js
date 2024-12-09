//Основные библиотеки
const express = require("express")
const server = express()
const http = require("http").createServer(server).listen(3000)
const io = require("socket.io")(http)
const fs = require("fs-extra")

server.use(express.static(__dirname + "/js"))
server.use(express.static(__dirname + "/css"))
server.use("/img", express.static(__dirname + "/img"))

server.get("/", function(request, response) {
    response.sendFile(__dirname + "/index.html")
})


io.sockets.on("connection", (socket) => {
    socket.on("saveSubjectToJSON", (data) => {
        fs.writeFileSync("subjects.json", JSON.stringify(data, null, 4))
    })
    socket.on("getSubjectFromJSON", () => {
        let data = fs.readJSONSync("subjects.json")
        socket.emit('getSubjectDataFromJSON', data)
    })
    socket.on("getForbidDatesData", () => {
        let data = fs.readJSONSync("forbiddates.json")
        socket.emit('getForbidDatesData', data)
    })
    socket.on("saveForbidDatesToJSON", (data) => {
        fs.writeFileSync("forbiddates.json", JSON.stringify(data, null, 4))
    })
    socket.on("saveGroupsToJSON", (data) => {
        fs.writeFileSync("groups.json", JSON.stringify(data, null, 4))
    })
    socket.on("getGroupsData", () => {
        let data = fs.readJSONSync("groups.json")
        socket.emit('getGroupsData', data)
    })
})

console.log('server started');