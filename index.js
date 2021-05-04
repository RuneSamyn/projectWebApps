const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, '/public')));


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

const server = app.listen(3000, () => {
    console.log(`The application started on port ${server.address().port}`);
});