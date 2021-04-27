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