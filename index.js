window.init = _ => {
    console.log('google maps loaded');
    let map;
    let centerMarker;
    const clickMarkers = [];

    getUserLocation().then(
        ({ coords }) => createMap(coords), // resolve
        err => console.error('Error getting user location: ', err) // reject
    )

    function getUserLocation () {
        return new Promise((res, rej) => {
            navigator.geolocation.getCurrentPosition(res, rej, {timeout: 10000});
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

        map.addListener('click', ({ latLng }) =>
            clickMarkers.push(
                new google.maps.Marker({
                    map: map,
                    position: latLng
                })
            )
        )

        centerMarker = new google.maps.Marker({
            map: map,
            position: {
                lat: latitude,
                lng: longitude
            }
        })
    }

    document.getElementById('clear-markers-button').addEventListener('click', _ =>
        clickMarkers
            // removes all the markers from the array, returns the markers that were removed
            .splice(0, clickMarkers.length)
            // tells the map that it doesn't need to continue rendering the markers
            .forEach(marker => marker.setMap(null))
    )
}
