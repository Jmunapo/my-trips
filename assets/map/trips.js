function snapshotToArray(snapshot) {
    var returnArr = [];
    snapshot.forEach(function (childSnapshot) {
        var item = childSnapshot.val();
        item.key = childSnapshot.key;
        returnArr.push(item);
    });
    return returnArr;
};

var map;

var curvature = 0.5; // how curvy to make the arc

async function init() {
    var Map = google.maps.Map,
        LatLng = google.maps.LatLng,
        LatLngBounds = google.maps.LatLngBounds,
        Marker = google.maps.Marker,
        Point = google.maps.Point;

    var bounds = new LatLngBounds();

    map = new Map(document.getElementById('map-canvas'), {
        center: {lat: -18, lng: 31},
        zoom: 9
    });

    let markers = [];
    var uid = sessionStorage.getItem('uid');

    firebase.database().ref(`trips/${uid}`).once('value').then(snapshot => {
        const points = snapshotToArray(snapshot);
        points.forEach((point, i) => {
            let point1 = new LatLng(point.p1.x + 0.005, point.p1.y+0.005);
            let point2 = new LatLng(point.p2.x, point.p2.y);

    
            let pointMarker1 = new Marker({
                position: point1,
                draggable: false,
                map: map,
                icon: 'assets/img/airplane.png'
            });

            let pointMarker2 = new Marker({
                position: point2,
                draggable: false,
                map: map,
                icon: 'assets/img/flag.png'
            });

            bounds.extend(point1);
            bounds.extend(point1);

            let markerinstance = 0;

            for (var i=0; i<markers.length; i++) {
                if (markers[i].marker1.getPosition().equals(pointMarker1.getPosition())) {
                    markerinstance += 0.05;
                }
                if (markers[i].marker2.getPosition().equals(pointMarker2.getPosition())) {
                    markerinstance += 0.05;
                }
            }

            let curvv = markerinstance;
            curvv = (curvv > 0.5)? curvv : 0.5+curvv;


    
            markers.push({
                marker1: pointMarker1,
                marker2: pointMarker2,
                title: point.notes,
                cn: curvv
            });

            if(points.length === markers.length){
                map.fitBounds(bounds);
            }
        });
    })

    function countPoints(arr, num) {
        let instance = 0;
        for(let i = 0; i < arr.length; i++){
            let diff = arr[i] - num;
            console.log(`Count item ${i}, Num ${num}, Diff ${diff}`);
        }
        return instance;
    }

    let alreadyDrawn = [];
    function updateCurveMarker() {
        markers.forEach((marker, i) => {
            var pos1 = marker.marker1.getPosition(), // latlng
                pos2 = marker.marker2.getPosition(),
                projection = map.getProjection(),
                p1 = projection.fromLatLngToPoint(pos1), // xy
                p2 = projection.fromLatLngToPoint(pos2);

            // Calculate the arc.
            // To simplify the math, these points 
            // are all relative to p1:

            //console.log(alreadyDrawn);
            var e = new Point(p2.x - p1.x, p2.y - p1.y), // endpoint (p2 relative to p1)
                m = new Point(e.x / 2, e.y / 2), // midpoint
                o = new Point(e.y, -e.x), // orthogonal
                c = new Point( // curve control point
                    m.x + marker.cn * o.x,
                    m.y + marker.cn * o.y);

            var pathDef = 'M 0,0 ' +
                'q ' + c.x + ',' + c.y + ' ' + e.x + ',' + e.y;

            var zoom = map.getZoom(),
                scale = 1 / (Math.pow(2, -zoom));

            var symbol = {
                path: pathDef,
                scale: scale,
                strokeWeight: 1,
                fillColor: 'none'
            };

            let infowindow = new google.maps.InfoWindow({
                content: marker.title
            });
      

            if(!alreadyDrawn[i]){
                alreadyDrawn[i] = new Marker({
                    position: pos1,
                    clickable: true,
                    icon: symbol,
                    label: marker.title,
                    zIndex: 0, // behind the other markers
                    map: map
                });
                alreadyDrawn[i].addListener('click', function() {
                    infowindow.open(map, alreadyDrawn[i]);
                });
            }else{
                alreadyDrawn[i].setOptions({
                    position: pos1,
                    icon: symbol,
                });
            }            
        });
    }

    google.maps.event.addListener(map, 'projection_changed', updateCurveMarker);
    google.maps.event.addListener(map, 'zoom_changed', updateCurveMarker);

}

google.maps.event.addDomListener(window, 'load', init);






function printMap(){
    const $body = $('body');
    const $mapContainer = $('#map-canvas');
    const $mapContainerParent = $mapContainer.parent();
    const $printContainer = $('<div class="container-fluid" style="position:relative;">');

    $printContainer
        .height($mapContainer.height())
        .append($mapContainer)
        .prependTo($body);

    const $content = $body
        .children()
        .not($printContainer)
        .not('link')
        .not('script')
        .detach();

    /**
     * Needed for those who use Bootstrap 3.x, because some of
     * its `@media print` styles ain't play nicely when printing.
     */
    const $patchedStyle = $('<style media="print">')
        .text(`
            img { max-width: none !important; }
            a[href]:after { content: ""; }
            #map-canvas {height: 100%; margin-top: 20px;}
        `)
        .appendTo('head');

    window.print();

    $body.prepend($content);
    $mapContainerParent.prepend($mapContainer);

    $printContainer.remove();
    $patchedStyle.remove();
}

