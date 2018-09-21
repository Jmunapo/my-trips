function snapshotToArray(snapshot) {
    var returnArr = [];
    snapshot.forEach(function (childSnapshot) {
        var item = childSnapshot.val();
        item.key = childSnapshot.key;
        returnArr.push(item);
    });
    return returnArr;
};

function getData(path){
    return firebase.database().ref(path).once('value').then(snapshot => {
        return snapshotToArray(snapshot);
    })
}

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
    firebase.database().ref('trips').once('value').then(snapshot => {
        const points = snapshotToArray(snapshot);
        points.forEach((point, i) => {
            let point1 = new LatLng(point.p1.x + 0.005, point.p1.y+0.005);
            let point2 = new LatLng(point.p2.x, point.p2.y);
    
            let pointMarker1 = new Marker({
                position: point1,
                label: ''+(i+1)+'A',
                draggable: false,
                map: map,
                icon: 'assets/img/airplane.png',
                title: point.notes
            });
            let pointMarker2 = new Marker({
                position: point2,
                label: ''+(i+1)+'B',
                draggable: false,
                map: map,
                icon: 'assets/img/flag.png',
                title: point.notes
            });

            bounds.extend(point1);
            bounds.extend(point1);
    
            markers.push({
                marker1: pointMarker1,
                marker2: pointMarker2,
                cn: point.cn
            });

            if(points.length === markers.length){
                map.fitBounds(bounds);
            }
        });
    })

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

            if(!alreadyDrawn[i]){
                alreadyDrawn[i] = new Marker({
                    position: pos1,
                    clickable: false,
                    icon: symbol,
                    zIndex: 0, // behind the other markers
                    map: map
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
    console.log('Printing');
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
    
        console.log($content);

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

