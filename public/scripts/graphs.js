const labels = ["14:35", "14:40", "14:45", "14:50", "14:55", "15:00"];
const data_co2 = {
    labels: labels,
    datasets: [
        {
            label: 'CO2',
            data: [450, 500, 600, 700, 750, , 820],
            borderColor: "#059669",
            backgroundColor: "#059669",
            tension: 0.5,
            color: "#ffffff",
            scale: 1,
        }
    ]
};
const data_hum = {
    labels: labels,
    datasets: [
        {
            label: 'Humidity',
            data: [50, 52, 55, 52, 49, 45],
            borderColor: "#2563EB",
            backgroundColor: "#2563EB",
            tension: 0.5,
            color: "#ffffff"
        }
    ]
};
const data_temp = {
    labels: labels,
    datasets: [
        {
            label: 'Temperature',
            data: [22, 21, 21, 20, 18, 15],
            borderColor: "#DC2626",
            backgroundColor: "#DC2626",
            tension: 0.5,
            color: "#ffffff"
        }
    ]
};
const config_co2 = {
    type: 'line',
    data: data_co2,
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Lokaal I118',
                color: "white"
            }
        },
        scale: {
            y: {
                color: "#ffffff"
            }
        }
    },
};
const config_hum = {
    type: 'line',
    data: data_hum,
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Lokaal I118'
            }
        }
    },
};
const config_temp = {
    type: 'line',
    data: data_temp,
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Lokaal I118'
            }
        }
    },
};


var ctx_co2 = document.getElementById('canvas-graph-co2').getContext('2d');
var ctx_hum = document.getElementById('canvas-graph-hum').getContext('2d');
var ctx_temp = document.getElementById('canvas-graph-temp').getContext('2d');
var myChart = new Chart(ctx_co2, config_co2);
var myChart = new Chart(ctx_hum, config_hum);
var myChart = new Chart(ctx_temp, config_temp);