/**
    for Instagram
**/
var location_img_list = new Array();

function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[#&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getImageData(json_file){

    var $instagram = $( '#instagram' );
    for ( var i = 0; i < json_file.data.length; i++ ) {
        var basic_images = json_file.data[i];
        imageUrl = basic_images.images.low_resolution.url;
        // alert(imageUrl);
        if(basic_images.location != null){

            imageLoc_lat = basic_images.location.latitude;
            imageLoc_lon = basic_images.location.longitude;
            imageLoc_name = basic_images.location.name;
            // If no text
            if(basic_images.caption != null){
                imageText = basic_images.caption.text;
            }else{
                imageText = '';
            }

            imageTime = parseInt(basic_images.created_time)*1000;
            imageStUrl = basic_images.images.standard_resolution.url;
            // $instagram.append( '<div class="row"><div class="col-md-6 "><img src="' + imageUrl + '" /><p>'
            // + imageLoc_lat + ',' + imageLoc_lat +'</p></div></div>' );
            location_img_list.push([imageUrl,imageLoc_lat,imageLoc_lon,imageLoc_name,imageText,imageTime,imageStUrl]);
            // alert(location_img_list);
        }else{
            // $instagram.append( '<div class="row><div class="col-md-6"><img src="' + imageUrl + '" /></div></div>' );
            continue
        }
    }
}

function nextImages(next_url){
    Instagram.nextPages(next_url,function( response ) {
        getImageData(response);
        try{
            if(response.pagination.next_url != undefined){
            
            next_url = response.pagination.next_url;
            nextImages(next_url);
            }else{
                //add the finish loading function
                document.getElementById('loader').innerHTML = "";
                document.getElementById('loader').style.display = "none";
                document.getElementById('loadinfo').style.display = "none";
                document.getElementById('map').style.visibility = "visible";
                document.getElementById('btn_create').style.visibility = "visible";
            }
        }catch(err){
            console.log(err.message);
        }
    });
}

window.Instagram = {
    /**
     * Store application settings
     */
    config: {},

    BASE_URL: 'https://api.instagram.com/v1',

    init: function( opt ) {
        opt = opt || {};

        this.config.client_id = opt.client_id;
        // this.config.access_token = opt.access_token;
        this.config.access_token = getParameterByName('access_token');
        if(getParameterByName('access_token')== null){
            // alert("Please login with Instagram!");
            window.location.href="https://www.instagram.com/oauth/authorize/?client_id=dc0e44cb1714408aac0fb713fb888337&redirect_uri=https://idea.cs.nthu.edu.tw/~yenhao0218/insta_map/&response_type=token";
            // window.location.href="https://www.instagram.com/oauth/authorize/?client_id=dc0e44cb1714408aac0fb713fb888337&redirect_uri=http://140.114.77.11/~yenhao0218/insta_map/&response_type=token";

        }
    },

    /**
     * Get a list of popular media.
     */
    mymedia: function( callback ) {
        var endpoint = this.BASE_URL + '/users/self/media/recent?access_token=' + this.config.access_token + '&count=30';
        // alert(endpoint);
        this.getJSON( endpoint, callback );
    },

    /**
     * Get a list of recently tagged media.
     */
    tagsByName: function( name, callback ) {
        var endpoint = this.BASE_URL + '/tags/' + name + '/media/recent?client_id=' + this.config.client_id;
        this.getJSON( endpoint, callback );
    },

    getJSON: function( url, callback ) {
        $.ajax({
            type: 'GET',
            url: url,
            dataType: 'jsonp',
            success: function( response ) {
                if ( typeof callback === 'function' ) callback( response );
            }
        });
    },

    nextPages: function( next_url, callback ){
        this.getJSON( next_url, callback );
    }
};

Instagram.init({
    client_id: 'dc0e44cb1714408aac0fb713fb888337',
    access_token: ''
});

/**
    For google map
**/
var marker_list;
var infowindow_list;
function myMap(callback) {
    var mapCanvas = document.getElementById("map");
    // var mapCanvas = $( '#map' ); //?????
    var mapOptions = {
    center: new google.maps.LatLng(23.79, 120.79),
    zoom: 7
    }
    var map = new google.maps.Map(mapCanvas, mapOptions);
}

function buildImgMap(){
    marker_list = new Array();
    infowindow_list = new Array();
    var mapCanvas = document.getElementById("map");
    var myCenter = new google.maps.LatLng(location_img_list[0][1],location_img_list[0][2]);
    var mapOptions = {
        center: new google.maps.LatLng(23.79, 120.79),
        zoom: 7
    }
    var map = new google.maps.Map(mapCanvas,mapOptions);
    var arrayLength = location_img_list.length;
    for(var i = 0; i < arrayLength; i++){
        placeMarker(map,location_img_list[i]);
    }
    for(var i = 0; i < marker_list.length; i++){
        marker_list[i].setMap(map);
    }

    // Add a marker clusterer to manage the markers.
      var markerCluster = new MarkerClusterer(map, marker_list,{imagePath: 'img/cluster/'});
      // var markerCluster = new MarkerClusterer(map, marker_list);

    resizeIcon(map);
}

function placeMarker(map, img_info) {
    var latlng = new google.maps.LatLng(img_info[1],img_info[2]);
    //get array of markers currently in cluster
    var allMarkers = marker_list;
    //final position for marker, could be updated if another marker already exists in same position
    var finalLatLng = latlng;
    //check to see if any of the existing markers match the latlng of the new marker
    if (allMarkers.length != 0) {
        for (i=0; i < allMarkers.length; i++) {
            var existingMarker = allMarkers[i];
            var pos = existingMarker.getPosition();
            //if a marker already exists in the same position as this marker
            if (latlng.equals(pos)) {
                //update the position of the coincident marker by applying a small multipler to its coordinates
                var newLat = latlng.lat() + (Math.random() -.5) / 1500;// * (Math.random() * (max - min) + min);
                var newLng = latlng.lng() + (Math.random() -.5) / 1500;// * (Math.random() * (max - min) + min);
                finalLatLng = new google.maps.LatLng(newLat,newLng);
            }
        }
    }
    var image = {
        url: img_info[0],
        // This marker is 20 pixels wide by 32 pixels high.
        // size: new google.maps.Size(32, 32),
        // The origin for this image is (0, 0).
        // origin: new google.maps.Point(0, 0),
        // The anchor for this image is the base of the flagpole at (0, 32).
        // anchor: new google.maps.Point(0, 32)
        scaledSize: new google.maps.Size(42, 42) // set the size of icon
    };
    var marker = new google.maps.Marker({
    position: finalLatLng,
    icon: image,
    map: map
    });

    marker_list.push(marker);
    var postdate = new Date(img_info[5]);
    var infocontent = '<div>'+
            '<h4>' + postdate.getFullYear() + '/' + postdate.getMonth() + '/' + postdate.getDate() + '<br/>' + img_info[3] + '</h4>'+
            '<center><img class="img-rounded" src="' + img_info[0] + '" width="80%"/></center>'+
            '<p style="margin-top:8px">' + img_info[4].replace("\n", "<br/>"); + '</p>'+
        '</div>';

    google.maps.event.addListener(marker,'click',function() {
        var infowindow = new google.maps.InfoWindow({
          content:infocontent,
          maxWidth: 300
        });
        // To automaticly close other infowindow when click this marker!
        if(infowindow_list.length !=0){
            for(var j = 0; j < infowindow_list.length; j++){
                infowindow_list[j].close();
            }
        }
        infowindow.open(map,marker);
        infowindow_list.push(infowindow);
    });
}

function resizeIcon(map){
    //when the map zoom changes, resize the icon based on the zoom level so the marker covers the same geographic area
    map.addListener('zoom_changed', function() {
        var pixelSizeAtZoom0 = 40; //the size of the icon at zoom level 0
        var maxPixelSize = 130; //restricts the maximum size of the icon, otherwise the browser will choke at higher zoom levels trying to scale an image to millions of pixels

        var zoom = map.getZoom();
        // alert(zoom);
        var relativePixelSize = Math.round(pixelSizeAtZoom0*Math.pow(1.1,zoom-7)); // use 2 to the power of current zoom to calculate relative pixel size.  Base of exponent is 2 because relative size should double every time you zoom in
        // alert(relativePixelSize);
        if(relativePixelSize > maxPixelSize) //restrict the maximum size of the icon
            relativePixelSize = maxPixelSize;

        //change the size of the icon
        for(var i = 0; i < marker_list.length; i++){
            var marker = marker_list[i]
            marker.setIcon(
                new google.maps.MarkerImage(
                    marker.getIcon().url, //marker's same icon graphic
                    null,//size
                    null,//origin
                    null, //anchor
                    new google.maps.Size(relativePixelSize, relativePixelSize) //changes the scale
                )
            );
        }

    });
}

$( document ).ready(function() {
        document.getElementById('map').style.visibility = "hidden";
        document.getElementById('btn_create').style.visibility = "hidden";
      Instagram.mymedia(function( response ) {
          getImageData(response);
        /**
          To get all images
        **/
        try{
            if(response.pagination.next_url != undefined){
            
            next_url = response.pagination.next_url;
            nextImages(next_url);
            }else{
                //add the finish loading function
                document.getElementById('loader').innerHTML = "";
                document.getElementById('loader').style.display = "none";
                document.getElementById('loadinfo').style.display = "none";
                document.getElementById('map').style.visibility = "visible";
                document.getElementById('btn_create').style.visibility = "visible";
            }
        }catch(err){
            console.log(err.message);
        }          
    });


    //
    // // $( '#form' ).on('submit', function( e ) {
    //     e.preventDefault();
    //
    //     var tagName = $( '#search' ).val();
    //     Instagram.tagsByName(tagName, function( response ) {
    //         var $instagram = $( '#instagram' );
    //             $instagram.html('');
    //
    //         for ( var i = 0; i < response.data.length; i++ ) {
    //             imageUrl = response.data[i].images.low_resolution.url;
    //             $instagram.append( '<img src="' + imageUrl + '" />' );
    //         }
    //     });
    //
    // });

});
