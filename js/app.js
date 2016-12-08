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
        var endpoint = this.BASE_URL + '/users/self/media/recent?access_token=' + this.config.access_token;
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
    }
};

Instagram.init({
    client_id: 'dc0e44cb1714408aac0fb713fb888337',
    access_token: ''
    // access_token: '533937403.dc0e44c.30370e6afc0f49da9b9bf425ee11d12f'
});


$( document ).ready(function() {

    Instagram.mymedia(function( response ) {
        var $instagram = $( '#instagram' );
        for ( var i = 0; i < response.data.length; i++ ) {
            imageUrl = response.data[i].images.low_resolution.url;
            $instagram.append( '<img src="' + imageUrl + '" />' );
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
