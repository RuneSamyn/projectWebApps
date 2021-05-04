document.getElementById('input-push-notifications-enable').addEventListener('click', () => {
    var span = document.querySelector('#input-push-notifications-enable > .material-icons');
    if(span.innerText == "toggle_on") {
        span.innerText = "toggle_off";
    } else if(span.innerText == "toggle_off") {
        span.innerText = "toggle_on";
    }
})