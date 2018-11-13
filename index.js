import MapStyles from './MapStyles';

window.init = _ => {
    console.log('google maps loaded');
    let map;
    let centerMarker;
    let placeMarker;
    let placeDirectionLine;
    const clickMarkers = [];
    const geocoder = new google.maps.Geocoder();
    const directionService = new google.maps.DirectionsService();

    class CustomMarker extends google.maps.OverlayView {
        /*
        @map:         google.maps.Map to attach the marker
        @position:    google latLng literal
        @params.html: html template literal
        @params.id:   the id of the root element
        */
        constructor (map, position, params) {
            // since we are inheriting from OverlayView we must call super()
            super();
            this.position = position
            this.params = params
            this.setMap(map)
        }

        draw () {
            let point = this.getProjection().fromLatLngToDivPixel(this.position)
            // getProjection -> mapCanvasProjection
            // mapCanvasProjection.fromLatLngToDivPixel ->
            // Computes the pixel coordinates of the given geographical location in the DOM element that holds the draggable map.

            if (!this.div) {
                this.div = document.createElement('div')
                this.div.id = this.params.id
                this.div.innerHTML = this.params.html;
                this.div.className = 'marker'
                this.div.style.position = 'absolute'
                this.getPanes().overlayImage.appendChild(this.div)
            }

            if (point && this.div) {
                this.div.style.left = `${point.x}px`
                this.div.style.top = `${point.y}px`
            }
        }

        onRemove () {
            document.getElementById(this.id).remove()
        }
    }

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
            styles: MapStyles
        });

        map.addListener('click', ({ latLng }) =>
            clickMarkers.push(
                new google.maps.Marker({
                    map: map,
                    position: latLng
                })
            )
        )

        centerMarker = new CustomMarker(
            map,
            new google.maps.LatLng(latitude, longitude),
            {
                id: 'user-location-marker',
                html: `<div id='user-position-marker' class='pulse'></div>`
            }
        )
    }

    document.getElementById('clear-markers-button').addEventListener('click', _ =>
        clickMarkers
            // removes all the markers from the array, returns the markers that were removed
            .splice(0, clickMarkers.length)
            // tells the map that it doesn't need to continue rendering the markers
            .forEach(marker => marker.setMap(null))
    )

    document.getElementById('address-search-form').addEventListener('submit', e => {
        // no more page refresh
        e.preventDefault();
        const searchInput = document.getElementById('address-search-input');

        geocoder.geocode(
            {
                address: searchInput.value
            },
            result => {
                try {
                    if (!result[0]) throw 'Could not find that place'
                    const place = {
                        address: result[0].formatted_address,
                        position: result[0].geometry.location
                    }
                    getRoute(centerMarker.position, place.position).then(({ routes }) => {
                        const route = routes[0];
                        if (!route) throw 'Could not get directions to that place'
                        if (placeMarker) placeMarker.setMap(null)
                        if (placeDirectionLine) placeDirectionLine.setMap(null)

                        placeMarker = new google.maps.Marker({
                            position: place.position,
                            map: map
                        })
                        placeDirectionLine = new google.maps.Polyline({
                            path: route.overview_path,
                            map: map
                        })

                        map.fitBounds(route.bounds)
                    })
                } catch (e) {
                    console.error(`Error adding place '${searchInput.value}':`, e)
                }
                searchInput.value = ''
            }
        )
    })

    /*
    @placeA: google.maps.LatLng()
    @placeB: google.maps.LatLng()
    */
    function getRoute (placeA, placeB) {
        return new Promise(resolve =>
            directionService.route(
                {
                    origin: placeA,
                    destination: placeB,
                    travelMode: 'DRIVING'
                },
                result => resolve(result)
            )
        )
    }
}
