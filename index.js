const express = require('express');
const path = require('path');
const moment = require('moment');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
var datastore = require('nedb');
var webpush = require('web-push');

const rooms = ['I118', 'I117', 'I115', 'I113', 'I003', 'A201', 'I212', 'C004', 'A102', 'A202', 'A008'].sort()
const hours = 2;

var db = new datastore();

const vapidKeys = {
    publicKey: 'BJvJoa9aDMSSyAg79MlMU5ppCSfaHszeSroYwsdQdaVS-YZe_LivbO_Dac2cIeUqgrS3k_iJLaEJ-VTS6zJoOMM',
    privateKey: 'nXAL5_IO0VPM92luZdQ_X9W5-rX1te04yiLum67DReg'
};

webpush.setGCMAPIKey('lwebapps');

webpush.setVapidDetails(
    'mailto:rune.samyn@gmail.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

app.use(express.static(path.join(__dirname, '/public')));
app.use(express.json())

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

// Functie die effectief de berichten pusht.
function triggerPushMessage(subscription, dataToSend) {
    // Zie: https://www.npmjs.com/package/web-push#sendnotificationpushsubscription-payload-options.
    // Deze functie return't een Promise die resulteert in een object of error.
    return webpush.sendNotification(subscription, dataToSend)
        .catch((err) => {
            console.log('err: ' + JSON.stringify(err))
            console.log('statusCode: ' + err.statusCode)
            if (err.statusCode === 404 || err.statusCode === 410) {
                console.log('Subscription has expired or is no longer valid: ', err);

                // Het bewuste abonnement verwijderen. Nog verder testen.
                db.remove({ _id: subscription._id }, {}, function () {
                    console.log("Subscription removed with _id: ", subscription._id);
                });
            }
            else {
                throw err;
            }
        });
};

function saveSubscriptionToDatabase(subscription) {
    return new Promise(function (resolve, reject) {
        // Item toevoegen aan de NeDB, zie: https://github.com/louischatriot/nedb/wiki/Inserting-documents
        db.insert(subscription, function (err, newDoc) {
            if (err)
                reject(err);
            else
                // Ter info het automatisch aangemaakte _id terug meegeven.
                resolve(newDoc._id);
        });
    });
};

function saveNewRoomInDB(room) {
    return new Promise(function (resolve, reject) {
        // Item toevoegen aan de NeDB, zie: https://github.com/louischatriot/nedb/wiki/Inserting-documents
        // save details in DB, < list of rooms, subscription-id >
        db.insert({ room: room, IDs: [] }, function (err, newDoc) {
            if (err)
                reject(err);
            else
                // Ter info het automatisch aangemaakte _id terug meegeven.
                resolve(newDoc._id);
        });
    });
}

function checkToNotify(element) {
    if (element.data.co2 > 1900) {
        db.find({ room: element.room }, function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                if (docs.length > 0) {
                    // iterate over all subscriptions
                    docs[0].IDs.forEach(ID => {
                        db.find({_id: ID}, function (err, subscriptions) {
                            console.log(subscriptions);
                            if (err)
                                console.log("Error during searching in NeDB: ", err);
                            else {
                                // Er is reeds een pagina die push berichtjes kan aanvragen/versturen... Maar het kan ook via Postman.
                                // Moet onderstaande meer asynchroon? Met Promises?
                                for (let i = 0; i < subscriptions.length; i++)
                                    triggerPushMessage(subscriptions[i], `Lokaal ${element.room}: CO2 is to high (${element.data.co2}ppm)`);
                            }
                        });
                    })
                }
            }
        });
    }
}

// sockets

io.on('connection', (socket) => {
    socket.on('get live data', () => {
        var data = [];
        rooms.forEach(room => {
            let element = {
                'room': room,
                'data': {
                    'co2': Math.floor(Math.random() * 1550) + 450,
                    'temp': Math.floor(Math.random() * 7) + 17,
                    'hum': Math.floor(Math.random() * 30) + 30,
                }
            }
            checkToNotify(element);
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
        if (element.room == req.params.room)
            res.json(element)
    })
    res.status(404).send();
})

app.get('/getRooms', (req, res) => {
    res.json(rooms);
})

// Maak een route voor het opslaan van de subscriptions.
app.post("/api/save-subscription/", function (request, response) {
    // Als de data niet ok is, keer terug met foutmelding.
    if (!request.body || !request.body.endpoint) {
        response.status(400).header('Content-type', 'application/json').send(JSON.stringify({
            error: {
                id: 'no endpoint',
                message: 'Subscription must have an endpoint.'
            }
        }));
    }
    else {
        // Als data wel ok is, sla op in lokale database (in memory)...
        saveSubscriptionToDatabase(request.body)
            .then(function (subscriptionId) {
                console.log("Saved _id: ", subscriptionId);
                response.header('Content-Type', 'application/json').send(JSON.stringify({
                    data: {
                        success: true,
                        subscriptionId: subscriptionId
                    }
                }));
            })
            .catch(function (err) {
                console.log(err);
                response.status(500).header('Content-Type', 'application/json').send(JSON.stringify({
                    error: {
                        id: 'unable-to-save-subscription',
                        message: 'The subscription was received but we were unable to save it to our database.'
                    }
                }));
            });
    }
});

// remove subscription
app.post("/api/remove-subscription/", function (request, response) {
    // Als de data niet ok is, keer terug met foutmelding.
    if (!request.body || !request.body.ID) {
        response.status(400).header('Content-type', 'application/json').send(JSON.stringify({
            error: {
                id: 'no ID',
                message: 'body must have an ID.'
            }
        }));
    }
    else {
        db.remove({ _id: request.body.ID }, {}, function (err, numRemoved) {
            if (err) {
                response.status(400).header('Content-type', 'application/json').send(JSON.stringify({
                    error: {
                        id: 'no access',
                        message: 'failed to access DB when trying to remove item.'
                    }
                }));
            } else {
                if (numRemoved > 0) {
                    response.header('Content-Type', 'application/json').send(JSON.stringify({
                        data: {
                            success: true,
                        }
                    }));
                } else {
                    response.status(400).header('Content-type', 'application/json').send(JSON.stringify({
                        error: {
                            id: 'no subscription',
                            message: 'no subscription found with given ID.'
                        }
                    }));
                }
            }
        });
    }
});

// Maak een route voor het pushen van notifications.
app.post("/api/trigger-push-message/", function (request, response) {
    console.log("Trigger push at backend received: ", request.body);

    // Antwoorden aan aanvrager.
    response.header('Content-Type', 'application/json').send(JSON.stringify({
        data: { success: true }
    }));

    // Alle abonnementen opvragen in de database en daarnaar een berichtje pushen.
    // Info over opvragen gegevens in een NeDB, zie: https://github.com/louischatriot/nedb/wiki/Finding-documents.
    db.find({}, function (err, subscriptions) {
        console.log(subscriptions);

        if (err)
            console.log("Error during searching in NeDB: ", err);
        else {
            // Er is reeds een pagina die push berichtjes kan aanvragen/versturen... Maar het kan ook via Postman.
            // Moet onderstaande meer asynchroon? Met Promises?
            for (let i = 0; i < subscriptions.length; i++)
                triggerPushMessage(subscriptions[i], request.body.message);
        }
    });
});

// route om te checken if notification al bestaat.
app.post("/api/check-push-id/", function (request, response) {
    console.log("Check if : ", request.body.ID);
    // Alle abonnementen opvragen in de database en daarnaar een berichtje pushen.
    // Info over opvragen gegevens in een NeDB, zie: https://github.com/louischatriot/nedb/wiki/Finding-documents.
    db.find({ _id: request.body.ID }, function (err, docs) {
        if (err) {
            response.status(400).header('Content-Type', 'application/json').send(JSON.stringify({
                data: { success: false, message: "failed to read from database" }
            }));
        }
        else {
            if (docs.length > 0) {
                console.log('found')
                response.header('Content-Type', 'application/json').send(JSON.stringify({
                    data: { success: true }
                }));
            } else {
                console.log('not found')
                response.header('Content-Type', 'application/json').send(JSON.stringify({
                    data: { success: false }
                }));
            }
        }
    });
});

// add subscription id to room.
app.post("/api/add-id-to-room/", function (request, response) {
    console.log(`add it to room. id: ${request.body.id}, room: ${request.body.room}`);
    // Alle abonnementen opvragen in de database en daarnaar een berichtje pushen.
    // Info over opvragen gegevens in een NeDB, zie: https://github.com/louischatriot/nedb/wiki/Finding-documents.
    db.update({ room: request.body.room }, { $addToSet: { IDs: request.body.id } }, {}, function (err, numReplaced) {
        if (err) {
            response.status(400).header('Content-Type', 'application/json').send(JSON.stringify({
                data: { success: false, message: "failed to add ID to room" }
            }));
        }
        else {
            if (numReplaced > 0) {
                response.header('Content-Type', 'application/json').send(JSON.stringify({
                    data: { success: true }
                }));
            } else {
                response.status(404).header('Content-Type', 'application/json').send(JSON.stringify({
                    data: { success: false, message: "room doesn't exists" }
                }));
            }
        }
    });
});

// remove subscription id from room.
app.post("/api/remove-id-from-room/", function (request, response) {
    console.log(`remove id from room. id: ${request.body.id}, room: ${request.body.room}`);
    // Info over opvragen gegevens in een NeDB, zie: https://github.com/louischatriot/nedb/wiki/Finding-documents.
    db.find({ room: request.body.room }, function (err, docs) {
        if (err) {
            response.status(400).header('Content-Type', 'application/json').send(JSON.stringify({
                data: { success: false, message: "failed to access DB" }
            }));
        } else {
            console.log("document: ", docs[0]);
            docs[0].IDs.splice(docs[0].IDs.indexOf(request.body.subscriptionId), 1);
            // Set an existing field's value
            db.update({ room: request.body.room }, { $set: { IDs: docs[0].IDs } }, {}, function (err, numReplaced) {
                if (err) {
                    response.status(400).header('Content-Type', 'application/json').send(JSON.stringify({
                        data: { success: false, message: "failed to access DB" }
                    }));
                } else {
                    if (numReplaced > 0) {
                        response.header('Content-Type', 'application/json').send(JSON.stringify({
                            data: { success: true }
                        }));
                    } else {
                        response.status(404).header('Content-Type', 'application/json').send(JSON.stringify({
                            data: { success: false, message: "failed to remove ID" }
                        }));
                    }
                }
            });
        }
    })
});

// returns all rooms where user is subscribed to.
app.post("/api/get-rooms-by-id/", function (request, response) {
    console.log("Get rooms");
    // Info over opvragen gegevens in een NeDB, zie: https://github.com/louischatriot/nedb/wiki/Finding-documents.
    db.find({ IDs: request.body.ID }, function (err, docs) {
        if (err) {
            response.status(400).header('Content-type', 'application/json').send(JSON.stringify({
                error: {
                    id: 'no access',
                    message: 'no access to DB while searching for rooms.'
                }
            }));
        }
        else {
            if (docs.length > 0) {
                allRooms = []
                docs.forEach(room => {
                    allRooms.push(room.room)
                })
                response.header('Content-Type', 'application/json').send(JSON.stringify({
                    data: { success: true, rooms: allRooms }
                }));
            } else {
                response.header('Content-Type', 'application/json').send(JSON.stringify({
                    data: { success: false }
                }));
            }
        }
    });
});


// server

server.listen(3000, () => {
    rooms.forEach(room => {
        saveNewRoomInDB(room)
            .then(ID => console.log(`Room ID: ${ID}`))
            .catch(err => console.log(err))
    })
    console.log(`The application started on port ${server.address().port}`);
});