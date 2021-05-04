const { setAppCache, setIcons ,setLaunchScreens, setManifest, setFavicons, setServiceWorker } = require('create-pwa');

const appName = 'Project Web Apps';
const appIcon = 'D:\\school\\2AI\\Web Apps\\L Web Apps\\Project\\public\\images\\icons\\icon-512x512.png';
const launchScreen = 'D:\\school\\2AI\\Web Apps\\L Web Apps\\Project\\public\\images\\launchscreen\\launchscreen.png';

// setAppCache(appName);
// setIcons(appIcon);
setLaunchScreens(launchScreen);
// setManifest(appName);
// setFavicons(appIcon);
// setServiceWorker(appName);
console.log('done')