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

function nextImages(next_url){
    Instagram.nextPages(next_url,function( response ) {
        var $instagram = $( '#instagram' );
        for ( var i = 0; i < response.data.length; i++ ) {
            var basic_images = response.data[i];
            imageUrl = basic_images.images.low_resolution.url;
            imageLoc_lat = basic_images.location.latitude;
            imageLoc_lon = basic_images.location.longitude;
            $instagram.append( '<div><img src="' + imageUrl + '" /><p>'
            + imageLoc_lat + ',' + imageLoc_lat +'</p></div>' );
        }
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


$( document ).ready(function() {

      var $instagram = $( '#instagram' );
      Instagram.mymedia(function( response ) {
          for ( var i = 0; i < response.data.length; i++ ) {
              var basic_images = response.data[i];
              imageUrl = basic_images.images.low_resolution.url;
              imageLoc_lat = basic_images.location.latitude;
              imageLoc_lon = basic_images.location.longitude;
              $instagram.append( '<div><img src="' + imageUrl + '" /><p>'
              + imageLoc_lat + ',' + imageLoc_lat +'</p></div>' );
          }
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
