window.init = _ => {
    console.log('google maps loaded');
    let map;

    createMap({});

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
