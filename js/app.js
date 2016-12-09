/**
    for Instagram
**/
var location_img_list = [];

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
            $instagram.append( '<div class="row"><div class="col-md-6 "><img src="' + imageUrl + '" /><p>'
            + imageLoc_lat + ',' + imageLoc_lat +'</p></div></div>' );
            location_img_list.push([imageUrl,imageLoc_lat,imageLoc_lon,imageLoc_name]);
            // alert(location_img_list);
        }else{
            $instagram.append( '<div class="row><div class="col-md-6"><img src="' + imageUrl + '" /></div></div>' );
        }
    }
}

function nextImages(next_url){
    Instagram.nextPages(next_url,function( response ) {
        getImageData(response);

        if(response.pagination.length != 0){
            next_url = response.pagination.next_url;
            nextImages(next_url);
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
    },

    /**
     * Get a list of popular media.
     */
    mymedia: function( callback ) {
        var endpoint = this.BASE_URL + '/users/self/media/recent?access_token=' + this.config.access_token + '&count=10';
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
    var mapCanvas = document.getElementById("map");
    var myCenter = new google.maps.LatLng(location_img_list[0][1],location_img_list[0][2]); 
    var mapOptions = {
        center: new google.maps.LatLng(23.79, 120.79),
        zoom: 7
    }
    var map = new google.maps.Map(mapCanvas,mapOptions);
    // var marker = new google.maps.Marker({
    //   position: myCenter,
    //   icon: location_img_list[0][0]
    // });
    // marker.setMap(map);
    var arrayLength = location_img_list.length;
    for(var i = 0; i < arrayLength; i++){
        placeMarker(map,location_img_list[i]);
    }
      
}

function placeMarker(map, img_info) {
    var imgCenter = new google.maps.LatLng(img_info[1],img_info[2]);
    var image = {
        url: img_info[0],
        // This marker is 20 pixels wide by 32 pixels high.
        // size: new google.maps.Size(32, 32),
        // The origin for this image is (0, 0).
        // origin: new google.maps.Point(0, 0),
        // The anchor for this image is the base of the flagpole at (0, 32).
        // anchor: new google.maps.Point(0, 32)
        scaledSize: new google.maps.Size(40, 40)
    };
    var marker = new google.maps.Marker({
    position: imgCenter,
    icon: image, 
    map: map
    });
    var infowindow = new google.maps.InfoWindow({
        content: img_info[3]
    });
    infowindow.open(map,marker);
    // marker.setMap(map);
}
$( document ).ready(function() {
      Instagram.mymedia(function( response ) {
          getImageData(response);
        /**
          To get all images
        **/
          if(response.pagination.length != 0){
              next_url = response.pagination.next_url;
              nextImages(next_url);
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
