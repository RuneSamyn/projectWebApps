var socket = io();

var firstData = true;
var rooms = [];
var roomsSubscribedTo = [];
var _mediaStream = null;
var video = document.createElement('video');
var handleAnimationFrame;
var subscriptionId = ""

window.addEventListener('load', () => {
    // get rooms where user is subscribed to.
    if ('subscriptionId' in localStorage) {
        // check if you have already a pushID
        subscriptionId = localStorage.getItem('subscriptionId')
        if (subscriptionId != "") {
            // check if ID needs to be updated

            axios.post('/api/check-push-id/', { ID: subscriptionId })
                .then(async (response) => {
                    if (response.data.data.success) {
                        console.log("subscription already exists")
                    } else {
                        // make new subscription
                        console.log("make new subscription")
                        await subscribeToNotifications();
                    }
                    axios.post('/api/get-rooms-by-id/', { ID: subscriptionId })
                        .then(response => {
                            console.log("response: " + JSON.stringify(response))
                            if (response.data.data.success) {
                                roomsSubscribedTo = response.data.data.rooms;
                                console.log("roomsSubscribedTo: " + roomsSubscribedTo);
                            }
                            axios.get('/getRooms')
                                .then(response => {
                                    rooms = response.data;
                                    makeCards(rooms);

                                    var liveDataInterval = setInterval(() => {
                                        socket.emit('get live data');
                                    }, 1000)

                                    socket.on('live data', data => {
                                        updateCards(data);
                                    })

                                    socket.on('connect_error', function () {
                                        noConnection();
                                    })
                                })
                                .catch(err => {
                                    console.log(err);
                                })
                        })
                        .catch(err => {
                            console.log(err)
                        })
                })
                .catch(err => {
                    console.log("failed to check subscription: " + err)
                })
        } else {
            axios.get('/getRooms')
                .then(response => {
                    rooms = response.data;
                    makeCards(rooms);

                    var liveDataInterval = setInterval(() => {
                        socket.emit('get live data');
                    }, 1000)

                    socket.on('live data', data => {
                        updateCards(data);
                    })

                    socket.on('connect_error', function () {
                        noConnection();
                    })
                })
                .catch(err => {
                    console.log(err);
                })
        }
    }
    // Zoek naar media devices.
    if ('mediaDevices' in navigator) {

        // Enumereren over de devices en beschikbaar maken in select.
        // Zie: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices.


    }
    else {
        alert('No media devices support in this browser.');
    }
})


// functions

function searchSensors() {
    var string = document.getElementById('input-search-sensor').value;
    var regex = new RegExp(string, 'i');
    rooms.forEach((room) => {
        var test = regex.test(room)
        if (test) {
            document.querySelector(`div[data-card="${room}"]`).classList.remove('hidden')
        } else {
            document.querySelector(`div[data-card="${room}"]`).classList.add('hidden')
        }
    })
}

async function toggleNotification(room) {
    let span = document.querySelector(`[data-span-notification-room="${room}"]`);
    if (span.innerText == "notifications_active") {
        span.innerText = "notifications_off";
        // remove room from list of subscriptions
        roomsSubscribedTo.splice(roomsSubscribedTo.indexOf(room), 1)
        axios.post('/api/remove-id-from-room/', { room: room, id: subscriptionId })
            .then(response => {
                if (response.data.data.success) {
                    console.log("successfully removed subscription to room")
                }
            })
            .catch(err => {
                console.log(err);
            })
    } else if (span.innerText == "notifications_off") {
        // add room to list of subscriptions
        if (subscriptionId == "") {
            alert('You need to enable the notifications in the settings page!')
        } else {
            span.innerText = "notifications_active";
            roomsSubscribedTo.push(room)
            axios.post('/api/add-id-to-room/', { room: room, id: subscriptionId })
                .then(response => {
                    if (response.data.data.success) {
                        console.log("successfully added subscription to room")
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        }
    }
}

function makeCards(rooms) {
    rooms.forEach(room => {
        // make copy of template card
        var card = document.querySelector('div[data-card="template"]').cloneNode(true);
        card.setAttribute("data-card", room);
        card.classList.remove("hidden");

        // change room name
        card.querySelector('span[data-room="template"]').innerText = "Lokaal " + room;
        card.querySelector('span[data-room="template"]').setAttribute("data-room", room);

        // change notification button onChange event
        card.querySelector('[data-button-notification="template"]').addEventListener("click", () => toggleNotification(room));
        card.querySelector('[data-button-notification="template"]').setAttribute('data-button-notification', room);

        // check if notifications are enabled
        if (roomsSubscribedTo.includes(room)) {
            card.querySelector('[data-span-notification-room="template"]').innerText = "notifications_active";
        }
        card.querySelector('[data-span-notification-room="template"]').setAttribute('data-span-notification-room', room);

        // change graph url
        card.querySelector('form[data-form="template"]').setAttribute("data-form", room);
        card.querySelector('input[data-form-room="template"').value = room;
        card.querySelector('input[data-form-room="template"').setAttribute("data-form-room", room);

        // change data- atributes and innerText of datavalues
        card.querySelector(`span[data-co2-val-id="template"]`).innerText = "xxx ppm";
        card.querySelector('span[data-co2-val-id="template"]').setAttribute("data-co2-val-id", room);
        card.querySelector(`span[data-hum-val-id="template"]`).innerText = "xxx %";
        card.querySelector('span[data-hum-val-id="template"]').setAttribute("data-hum-val-id", room);
        card.querySelector(`span[data-temp-val-id="template"]`).innerText = "xxx °C";
        card.querySelector('span[data-temp-val-id="template"]').setAttribute("data-temp-val-id", room);

        // change data- atribute of offline error
        card.querySelector(`span[data-error="template"]`).classList.remove('hidden');
        card.querySelector('span[data-error="template"]').setAttribute("data-error", room);

        document.getElementById('card-grid').appendChild(card);
    })
}

function updateCards(data) {
    var updatedRooms = [];
    data.forEach(element => {
        var card = document.querySelector(`div[data-card="${element.room}"]`);
        if (card == null) {
            makeCards([element]);
        } else {
            // change data- atributes and innerText of datavalues
            card.querySelector(`span[data-co2-val-id="${element.room}"]`).innerText = element.data.co2 + "ppm";
            card.querySelector(`span[data-hum-val-id="${element.room}"]`).innerText = element.data.hum + "%";
            card.querySelector(`span[data-temp-val-id="${element.room}"]`).innerText = element.data.temp + "°C";
            card.querySelector(`span[data-error="${element.room}"]`).classList.add('hidden');
            updatedRooms.push(element.room)
        }
    })
    rooms.forEach(room => {
        if (!updatedRooms.includes(room)) {
            var card = document.querySelector(`div[data-card="${room}"]`);
            if (card == null) {
                makeCards([element]);
            } else {
                // change data- atributes and innerText of datavalues
                card.querySelector(`span[data-co2-val-id="${room}"]`).innerText = "xxx ppm";
                card.querySelector(`span[data-hum-val-id="${room}"]`).innerText = "xxx %";
                card.querySelector(`span[data-temp-val-id="${room}"]`).innerText = "xxx °C";
                card.querySelector(`span[data-error="${room}"]`).classList.remove('hidden');
            }
        }
    })
}

function noConnection() {
    rooms.forEach(room => {
        var card = document.querySelector(`div[data-card="${room}"]`);
        if (card == null) {
            makeCards([element]);
        } else {
            // change data- atributes and innerText of datavalues
            card.querySelector(`span[data-co2-val-id="${room}"]`).innerText = "xxx ppm";
            card.querySelector(`span[data-hum-val-id="${room}"]`).innerText = "xxx %";
            card.querySelector(`span[data-temp-val-id="${room}"]`).innerText = "xxx °C";
            card.querySelector(`span[data-error="${room}"]`).classList.remove('hidden');
        }
    })
}

function openCamera() {
    var cameraWindow = document.getElementById('camera-window');
    var sensorWindow = document.getElementById('sensor-window');
    var btn = document.getElementById('btn-goToURL');
    cameraWindow.classList.remove('hidden');
    sensorWindow.classList.add('overflow-hidden');
    btn.innerText = `no QR-code`;
    btn.addEventListener('click', () => { goToURL('#') })
    // Use facingMode: environment to attemt to get the front camera on phones
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function (stream) {
        _mediaStream = stream;
        video.srcObject = _mediaStream;
        video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
        video.play();
    });
    handleAnimationFrame = window.requestAnimationFrame(tick);
}

function closeCamera() {
    var cameraWindow = document.getElementById('camera-window');
    var sensorWindow = document.getElementById('sensor-window');
    cameraWindow.classList.add('hidden');
    sensorWindow.classList.remove('overflow-hidden');
    window.cancelAnimationFrame(handleAnimationFrame);

    // Eventuele oude streams afsluiten (camera vrijgeven).
    if (_mediaStream != null) {
        _mediaStream.getTracks().forEach(track => {
            track.stop();
        });
    }
}

function drawLine(begin, end, color) {
    var canvas = document.getElementById('qr-canvas').getContext('2d');
    canvas.beginPath();
    canvas.moveTo(begin.x, begin.y);
    canvas.lineTo(end.x, end.y);
    canvas.lineWidth = 4;
    canvas.strokeStyle = color;
    canvas.stroke();
}

function tick() {
    var qrCanvasElement = document.getElementById('qr-canvas');
    var qrCanvas = document.getElementById('qr-canvas').getContext('2d');
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        qrCanvasElement.classList.remove('hidden')

        qrCanvasElement.height = video.videoHeight;
        qrCanvasElement.width = video.videoWidth;
        qrCanvas.drawImage(video, 0, 0, qrCanvasElement.width, qrCanvasElement.height);
        var imageData = qrCanvas.getImageData(0, 0, qrCanvasElement.width, qrCanvasElement.height);
        var code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });
        if (code && code.data.includes('http')) {
            drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
            drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
            drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
            drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
            var btn = document.getElementById('btn-goToURL');
            btn.innerText = `Go to '${code.data}'`;
            btn.addEventListener('click', () => goToURL(code.data));
        }
    }
    handleAnimationFrame = window.requestAnimationFrame(tick);
}

function goToURL(url) {
    console.log(`go to ${url}`)
    window.location.href = url;
}


