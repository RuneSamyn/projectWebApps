const express = require('express');
const path = require('path');
const moment = require('moment');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const rooms = ['I118', 'I117', 'I115', 'I113', 'I003', 'A201', 'I212', 'C004', 'A102', 'A202', 'A008'].sort()
const hours = 2;

app.use(express.static(path.join(__dirname, '/public')));

// functions

function generateFakeDate(timeInMinutes) {
    var data = [];
    var prevElement = {
        'co2': Math.floor(Math.random() * 1550) + 450,
        'temp': Math.floor(Math.random() * 7) + 17,
        'hum': Math.floor(Math.random() * 30) + 30,
    }
    for (var i = 0; i < timeInMinutes; i += 5) {
        let element = {
            'co2': prevElement.co2 + Math.floor(Math.random() * 301) - 150,
            'temp': prevElement.temp + Math.floor(Math.random() * 3) - 1,
            'hum': prevElement.hum + Math.floor(Math.random() * 7) - 3,
            'time': moment().subtract(timeInMinutes - i, "minutes").utc().format()
        }
        element.co2 = element.co2 < 450 ? 450 : (element.co2 > 2000 ? 2000 : element.co2); 
        element.temp = element.temp < 17 ? 17 : (element.temp > 24 ? 24 : element.temp); 
        element.hum = element.hum < 30 ? 30 : (element.hum > 60 ? 60 : element.hum); 

        data.push(element);
        prevElement = element;
    }
    return data;
}

// sockets

io.on('connection', (socket) => {
    socket.on('get live data', () => {
        var data = [];
        rooms.forEach(room => {
            let element = {
                'room': room, 
                'data':{
                    'co2': Math.floor(Math.random() * 1550) + 450,
                    'temp': Math.floor(Math.random() * 7) + 17,
                    'hum': Math.floor(Math.random() * 30) + 30,
                }
            }
            data.push(element);
        })
        socket.emit('live data', data);
      });
  });

// routes

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/pages/graphs.html');
})

app.get('/graphs', (req, res) => {
    res.sendFile(__dirname + '/public/pages/graphs.html');
})

app.get('/sensors', (req, res) => {
    res.sendFile(__dirname + '/public/pages/sensors.html');
})

app.get('/settings', (req, res) => {
    res.sendFile(__dirname + '/public/pages/settings.html');
})

app.get('/fallback', (req, res) => {
    res.sendFile(__dirname + '/public/pages/fallback.html');
})

app.get('/getData/:room', (req, res) => {
    const fake_data_graph = [];
    rooms.forEach((room) => {
        fake_data_graph.push({
            'room': room,
            'data': generateFakeDate(60 * hours)
        })
    })
    fake_data_graph.forEach(element => {
        if(element.room == req.params.room)
            res.json(element)
    })
    res.status(404).send();
})

app.get('/getRooms', (req, res) => {
    res.json(rooms);
})

// server

server.listen(3000, () => {
    console.log(`The application started on port ${server.address().port}`);
});