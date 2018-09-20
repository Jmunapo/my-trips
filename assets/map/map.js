const map = {
    initMap: ()=>{
        var map;

        var curvature = 0.5; // how curvy to make the arc

        function init() {
            var Map = google.maps.Map,
                LatLng = google.maps.LatLng,
                LatLngBounds = google.maps.LatLngBounds,
                Marker = google.maps.Marker,
                Point = google.maps.Point;

            // This is the initial location of the points
            // (you can drag the markers around after the map loads)
            var points = [
                {
                    p1: {
                        x: 22.634501,
                        y: -102.552783
                    },
                    p2: {
                        x: -11.555,
                        y: 25.555
                    }
                },
                {
                    p1: {
                        x: -18.98,
                        y: 32.60
                    },
                    p2: {
                        x: -15.98,
                        y: 36.60
                    }
                },
                {
                    p1: {
                        x: -22.20,
                        y: 30.70
                    },
                    p2: {
                        x: -44.555,
                        y: 55.555
                    }
                }
            ]

            let point1 = new LatLng(points[0].p1.x, points[0].p1.y);
            let point2 = new LatLng(points[0].p2.x, points[0].p2.y);

            var xbounds = new LatLngBounds();
            xbounds.extend(point1);
            xbounds.extend(point2);

            

            
            var mmap = new Map(document.getElementById('map-canvas'), {
                center: xbounds.getCenter(),
                zoom: 2
            });

            mmap.fitBounds(xbounds);
            
            google.maps.event.addListener(mmap, 'projection_changed', ()=>{
                points.forEach((point, i) => {
                    let point1 = new LatLng(point.p1.x, point.p1.y);
                    let point2 = new LatLng(point.p2.x, point.p2.y);
    
                    let pointMarker1 = new Marker({
                        position: point1,
                        label: ''+i+'',
                        draggable: false,
                        map: mmap
                    });
                    let pointMarker2 = new Marker({
                        position: point2,
                        label: ''+i+'',
                        draggable: false,
                        map: mmap
                    });
    
                    var curv1 = pointMarker1.getPosition(), // latlng
                        curv2 = pointMarker2.getPosition(),
                        projection = mmap.getProjection(),
                        p1 = projection.fromLatLngToPoint(curv1), // xy
                        p2 = projection.fromLatLngToPoint(curv2);


                    var e = new Point(p2.x - p1.x, p2.y - p1.y), // endpoint (p2 relative to p1)
                    m = new Point(e.x / 2, e.y / 2), // midpoint
                    o = new Point(e.y, -e.x), // orthogonal
                    c = new Point( // curve control point
                        m.x + curvature * o.x,
                        m.y + curvature * o.y);

                    var pathDef = 'M 0,0 ' +
                        'q ' + c.x + ',' + c.y + ' ' + e.x + ',' + e.y;

                        var zoom = mmap.getZoom(),
                        scale = 1 / (Math.pow(2, -zoom));

                    var symbol = {
                        path: pathDef,
                        scale: scale,
                        strokeWeight: 2,
                        fillColor: 'none'
                    };

                    new Marker({
                        position: curv1,
                        clickable: false,
                        icon: symbol,
                        zIndex: 0, // behind the other markers
                        map: map
                    });
                });

            });

            
            
            

            return;
            var pos1 = new LatLng(23.634501, -102.552783);
            var pos2 = new LatLng(17.987557, -92.929147);

            var bounds = new LatLngBounds();
            bounds.extend(pos1);
            bounds.extend(pos2);

            map = new Map(document.getElementById('map-canvas'), {
                center: bounds.getCenter(),
                zoom: 2
            });

            
            map.fitBounds(bounds);

            var markerP1 = new Marker({
                position: pos1,
                label: "1",
                draggable: true,
                map: map
            });
            var markerP2 = new Marker({
                position: pos2,
                label: "2",
                draggable: false,
                map: map
            });

            

            var curveMarker;

            function updateCurveMarker() {
                var pos1 = markerP1.getPosition(), // latlng
                    pos2 = markerP2.getPosition(),
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
                        m.x + curvature * o.x,
                        m.y + curvature * o.y);

                var pathDef = 'M 0,0 ' +
                    'q ' + c.x + ',' + c.y + ' ' + e.x + ',' + e.y;

                

                var zoom = map.getZoom(),
                    scale = 1 / (Math.pow(2, -zoom));

                var symbol = {
                    path: pathDef,
                    scale: scale,
                    strokeWeight: 2,
                    fillColor: 'none'
                };

                if (!curveMarker) {
                    curveMarker = new Marker({
                        position: pos1,
                        clickable: false,
                        icon: symbol,
                        zIndex: 0, // behind the other markers
                        map: map
                    });
                } else {
                    curveMarker.setOptions({
                        position: pos1,
                        icon: symbol,
                    });
                }
            }

            google.maps.event.addListener(map, 'projection_changed', updateCurveMarker);
            google.maps.event.addListener(map, 'zoom_changed', updateCurveMarker);

            google.maps.event.addListener(markerP1, 'position_changed', updateCurveMarker);
            google.maps.event.addListener(markerP2, 'position_changed', updateCurveMarker);
        }

        google.maps.event.addDomListener(window, 'load', init);
    }
}