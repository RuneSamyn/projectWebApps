var socket = io();

var firstData = true;
var rooms = [];

window.addEventListener('load', () => {
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

function toggleNotification(room) {
    let span = document.querySelector(`[data-span-notification-room="${room}"]`);
    if (span.innerText == "notifications_active") {
        span.innerText = "notifications_off";
    } else if (span.innerText == "notifications_off") {
        span.innerText = "notifications_active";
    }
}

function makeCards(rooms) {
    rooms.forEach(room => {
        // make copy of template card
        var card = document.querySelector('div[data-card="template"]').cloneNode(true);
        card.setAttribute("data-card", room);
        card.classList.remove("hidden");

        console.log(card)
        // change room name
        card.querySelector('span[data-room="template"]').innerText = "Lokaal " + room;
        card.querySelector('span[data-room="template"]').setAttribute("data-room", room);

        // change notification button onChange event
        card.querySelector('[data-button-notification="template"]').addEventListener("click", () => toggleNotification(room));
        card.querySelector('[data-button-notification="template"]').setAttribute('data-button-notification', room);

        // change notifications span data- atribute
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


