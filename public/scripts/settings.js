document.getElementById('input-push-notifications-enable').addEventListener('click', () => {
    var span = document.querySelector('#input-push-notifications-enable > .material-icons');
    if (span.innerText == "toggle_on") {
        span.innerText = "toggle_off";
        span.classList.add('text-red-600')
        span.classList.remove('text-green-600')
        // turn notifications off
        var subscriptionId = localStorage.getItem('subscriptionId')
        localStorage.setItem('subscriptionId', "");
        axios.post('/api/remove-subscription/', { ID: subscriptionId })
            .then(() => {
                console.log("successfully removed subscription")
            })
            .catch(err => {
                console.log(err)
            })

    } else if (span.innerText == "toggle_off") {
        span.innerText = "toggle_on";
        span.classList.remove('text-red-600')
        span.classList.add('text-green-600')

        // turn notifications on
        // ...
        turnNotificationsOn();

    }
})

window.addEventListener('load', () => {
    var span = document.querySelector('#input-push-notifications-enable > .material-icons');
    if ('subscriptionId' in localStorage) {
        // check if you have already a pushID
        var subscriptionId = localStorage.getItem('subscriptionId')
        if (subscriptionId != "") {
            span.innerText = "toggle_on";
            span.classList.remove('text-red-600')
            span.classList.add('text-green-600')
            console.log("check subscriptionId")
            // check if subscription exists
            axios.post('/api/check-push-id/', { ID: subscriptionId })
                .then((response) => {
                    if (response.data.data.success) {
                        console.log("subscription already exists")
                    } else {
                        // make new subscription
                        console.log("make new subscription")
                        subscribeToNotifications();
                    }
                })
                .catch(err => {
                    console.log("failed to check subscription: " + err)
                })
        }
    }
})