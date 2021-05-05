document.getElementById('input-push-notifications-enable').addEventListener('click', () => {
    var span = document.querySelector('#input-push-notifications-enable > .material-icons');
    if(span.innerText == "toggle_on") {
        span.innerText = "toggle_off";
        span.classList.add('text-red-600')
        span.classList.remove('text-green-600')
    } else if(span.innerText == "toggle_off") {
        span.innerText = "toggle_on";
        span.classList.remove('text-red-600')
        span.classList.add('text-green-600')
    }
})