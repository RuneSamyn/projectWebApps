

function toggleNotification(id) {
    let span = document.querySelector(`[data-span-notification-id="${id}"]`);
    if(span.innerText == "notifications_active") {
        span.innerText = "notifications_off";
    } else if(span.innerText == "notifications_off") {
        span.innerText = "notifications_active";
    }    
}
