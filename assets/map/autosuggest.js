var placeSearch, origin, destination;
var trip = {
    p1: {},
    p2: {}
};

function getXY(geometry){
    let x = geometry.location.lat();
    let y = geometry.location.lng();
    return { x,y }
}

function initAutocomplete() {
    // Create the autocomplete object, restricting the search to geographical
    // location types.
    origin = new google.maps.places.Autocomplete((document.getElementById('origin')),{types: ['geocode']});
    destination = new google.maps.places.Autocomplete((document.getElementById('destination')),{types: ['geocode']});

    // When the user selects an address from the dropdown, populate the address
    // fields in the form.
    origin.addListener('place_changed', addOrigin);
    destination.addListener('place_changed', addDestination);
}

function addOrigin() {
    // Get the place details from the autocomplete object.
    var place = origin.getPlace();
    console.log(place);
    var points = getXY(place.geometry);
    trip.p1 = points;
    trip.p1['formatted_address'] = place.formatted_address;
}


function addDestination() {
    var place = destination.getPlace();
    var points = getXY(place.geometry);
    trip.p2 = points;
    trip.p2['formatted_address'] = place.formatted_address;
}

    // Bias the autocomplete object to the user's geographical location,
    // as supplied by the browser's 'navigator.geolocation' object.
function geolocate() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var geolocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            var circle = new google.maps.Circle({
                center: geolocation,
                radius: position.coords.accuracy
            });
            origin.setBounds(circle.getBounds());
            destination.setBounds(circle.getBounds());
        });
    }
}


$('#add_trip').submit(e=>{
    e.preventDefault();
    console.log(trip.p1, trip.p2);
    if('x' in trip.p1 && 'x' in trip.p2){
        trip['cn'] = (Math.random()).toFixed(3);
        trip['notes'] = $('#notes').val();
        var ref = firebase.database().ref("trips");
        ref.push(trip).then(d=>{
            console.log(d);
            e.target.reset();
        });
    }
})

/*$(document).ready(function() {
    // Javascript method's body can be found in assets/js/demos.js
    console.log(firebase);
    var ref = firebase.database().ref("Joe");
    var defaultDatabase = firebase.database().ref('/');
    defaultDatabase.set({'Joe':'Joemags'});

    
    ref.once("value")
    .then(function(snapshot) {
        var key = snapshot.key;
        var val = snapshot.val();
        console.log(key, val);
    });
});*/
