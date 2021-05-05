var room = "";
var data = [];
var rooms = [];

window.addEventListener('load', () => {
    // get room name from url
    const urlParams = new URLSearchParams(window.location.search);
    room = urlParams.get('room');
    if (room == null) {
        document.getElementById('div-select-room').classList.remove('hidden');
        document.getElementById('div-graph').classList.add('hidden');

        // get list of rooms
        axios.get('/getRooms')
            .then((response) => {
                rooms = response.data.sort();
            })
            .catch((err) => {
                console.log(err);
            })
    } else {
        document.getElementById('div-select-room').classList.add('hidden');
        document.getElementById('div-graph').classList.remove('hidden');
        document.getElementById('h1-room').innerText = `Lokaal ${room}`

        // get data with axios
        axios.get(`/getData/${room}`)
            .then((response) => {
                data = response.data;
                loadGraphs();
            })
            .catch((err) => {
                console.log(err);
            })
    }
})


function loadGraphs() {

    const labels = [];

    const data_co2 = {
        labels: labels,
        datasets: [
            {
                label: 'CO2',
                data: [],
                borderColor: "#059669",
                backgroundColor: "#059669",
                tension: 0.5,
                color: "#ffffff",
                scale: 1,
                cubicInterpolationMode: 'monotone',
                tension: 0.1,
            }
        ]
    };
    const data_hum = {
        labels: labels,
        datasets: [
            {
                label: 'Humidity',
                data: [],
                borderColor: "#2563EB",
                backgroundColor: "#2563EB",
                tension: 0.5,
                color: "#ffffff",
                cubicInterpolationMode: 'monotone',
                tension: 0.1
            }
        ]
    };
    const data_temp = {
        labels: labels,
        datasets: [
            {
                label: 'Temperature',
                data: [],
                borderColor: "#DC2626",
                backgroundColor: "#DC2626",
                tension: 0.5,
                color: "#ffffff",
                cubicInterpolationMode: 'monotone',
                tension: 0.1,
            }
        ]
    };
    const config_co2 = {
        type: 'line',
        data: data_co2,
        options: {
            responsive: true,
            plugins: {},
            scale: {
                y: {
                    min: 400,
                    max: 2200,
                }
            },
        },
    };
    const config_hum = {
        type: 'line',
        data: data_hum,
        options: {
            responsive: true,
            plugins: {},
            scale: {
                y: {
                    min: 20,
                    max: 70,
                }
            },
        },
    };
    const config_temp = {
        type: 'line',
        data: data_temp,
        options: {
            responsive: true,
            plugins: {},
            scale: {
                y: {
                    min: 15,
                    max: 25,
                }
            },
        },
    };

    data.data.forEach(element => {
        labels.push(new Date(element.time).toLocaleTimeString());
        data_co2.datasets[0].data.push(element.co2);
        data_hum.datasets[0].data.push(element.hum);
        data_temp.datasets[0].data.push(element.temp);
    })

    config_co2.options.scale.y.min = Math.ceil((Math.min.apply(Math, data_co2.datasets[0].data) - 50) / 50) * 50
    config_co2.options.scale.y.max = Math.floor((Math.max.apply(Math, data_co2.datasets[0].data) + 50) / 50) * 50

    config_hum.options.scale.y.min = Math.ceil((Math.min.apply(Math, data_hum.datasets[0].data) - 2) / 2) * 2
    config_hum.options.scale.y.max =  Math.floor((Math.max.apply(Math, data_hum.datasets[0].data) + 2) / 2) * 2

    config_temp.options.scale.y.min = Math.min.apply(Math, data_temp.datasets[0].data) - 1
    config_temp.options.scale.y.max = Math.max.apply(Math, data_temp.datasets[0].data) + 1

    var ctx_co2 = document.getElementById('canvas-graph-co2').getContext('2d');
    var ctx_hum = document.getElementById('canvas-graph-hum').getContext('2d');
    var ctx_temp = document.getElementById('canvas-graph-temp').getContext('2d');
    var co2Chart = new Chart(ctx_co2, config_co2);
    var humChart = new Chart(ctx_hum, config_hum);
    var tempChart = new Chart(ctx_temp, config_temp);
}

function searchSensors() {
    var input = document.getElementById('input-search-sensor').value;
    if (input != "") {
        var roomsToShow = [];
        // check for matches in rooms
        var regex = new RegExp(input, 'i');
        rooms.forEach((room) => {
            if (regex.test(room)) {
                // add room to roomsToShow list
                roomsToShow.push(room);
            }
        })
        if (roomsToShow.length > 0) {
            // show dropdown and remove all children
            document.getElementById('dropdown-select-room').classList.remove('hidden');
            document.getElementById('dropdown-select-room').innerHTML = '';
            roomsToShow.forEach(room => {
                // make copy of template dropdown item
                var item = document.querySelector('a[data-dropdown-item="template"]').cloneNode(true);
                item.setAttribute("data-dropdown-item", room);
                item.classList.remove("hidden");

                // change href
                item.href = `/graphs?room=${room}`
                // change innerText
                item.innerText = room

                document.getElementById('dropdown-select-room').appendChild(item);
            })
        } else {
            document.getElementById('dropdown-select-room').classList.add('hidden');
        }
    } else {
        document.getElementById('dropdown-select-room').classList.add('hidden');
    }
}