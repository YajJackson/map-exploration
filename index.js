window.init = _ => {
    console.log('google maps loaded');
    let map;

    getUserLocation().then(
        ({ coords }) => createMap(coords), // resolve
        err => console.error('This browser does not support geolocation: ', err) // reject
    )

    function getUserLocation () {
        return new Promise((res, rej) => {
            navigator.geolocation.getCurrentPosition(res, rej);
        });
    }

    function createMap ({latitude = 39.76838, longitude = -86.15804}) {
        map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: latitude,
                lng: longitude
            },
            zoom: 13,
            disableDefaultUI: true,
        });
    }
}
