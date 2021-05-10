var menu_open = false;


if (localStorage.theme === 'dark' || (!'theme' in localStorage && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.querySelector('html').classList.add('dark')
    document.getElementById('icon-toggle-dark-mode').innerText = "light_mode";
} else if (localStorage.theme === 'dark') {
    document.querySelector('html').classList.add('dark')
    document.getElementById('icon-toggle-dark-mode').innerText = "light_mode";
}

document.getElementById('btn-toggle-menu').addEventListener('click', () => {
    if(menu_open) {
        document.getElementById('svg-menu-open').classList.add('hidden');
        document.getElementById('svg-menu-closed').classList.remove('hidden');
        document.getElementById('mobile-menu').classList.add('hidden');
    } else {
        document.getElementById('svg-menu-open').classList.remove('hidden');
        document.getElementById('svg-menu-closed').classList.add('hidden');
        document.getElementById('mobile-menu').classList.remove('hidden');
    }
    menu_open = !menu_open;
})

document.getElementById('btn-toggle-dark-mode').addEventListener('click', () => {
    let htmlClasses = document.querySelector('html').classList;
    if(localStorage.theme == 'dark') {
        htmlClasses.remove('dark');
        localStorage.removeItem('theme')
        document.getElementById('icon-toggle-dark-mode').innerText = "dark_mode";
    } else {
        htmlClasses.add('dark');
        localStorage.theme = 'dark';
        document.getElementById('icon-toggle-dark-mode').innerText = "light_mode";
    }
});



function turnNotificationsOn() {
    if (('PushManager' in window) && ('Notification' in window)) {
        if (Notification.permission == "granted") {
            console.log("Permission granted before.");
            subscribeToNotifications();
        }
        else
            if (Notification.permission !== "denied") {
                Notification.requestPermission()
                    .then(permission => {
                        if (permission == "granted") {
                            // permission granted => notification possible
                            console.log("Permission granted.");
                            subscribeToNotifications();
                        }
                    });
            }
            else {
                console.log("Permission denied. No Notifications will be send.");
            }

    } else {
        console.log("Notifications are not possible in this browser")
    }
}

function subscribeToNotifications() {
    navigator.serviceWorker.getRegistration()
        .then(registration => {
            registration.pushManager.subscribe(
                {
                    userVisibleOnly: true,
                    applicationServerKey: urlB64ToUint8Array("BJvJoa9aDMSSyAg79MlMU5ppCSfaHszeSroYwsdQdaVS-YZe_LivbO_Dac2cIeUqgrS3k_iJLaEJ-VTS6zJoOMM")
                }
            )
                .then(subscription => {
                    console.log("Subscripton: ", JSON.stringify(subscription));
                    axios.post("api/save-subscription", subscription)
                        .then(response => {
                            console.log("Response:", response);
                            if (response.data.data.success) {
                                console.log("save subscription id in DB")
                                localStorage.setItem('subscriptionId', response.data.data.subscriptionId);
                            }
                        })
                        .catch(error => console.log(error));
                })
                .catch(error => console.log(error));
        })
        .catch(error => console.log(error));
}


function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}