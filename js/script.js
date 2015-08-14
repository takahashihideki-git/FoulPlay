( function ( namespace ) {

  window[ namespace ] = function ( url, callback, preproc, postproc ) {
    window[ namespace ].prototype.load( url, function ( xhr ) {

      if ( preproc ) {
        eval( preproc );
      }

      eval( xhr.response );

      if ( postproc ) {
        eval ( postproc );
      }

      if ( callback ) {
        callback( xhr );
      }

    } );
  }
  window[ namespace ].prototype = {
    load: function ( url, callback ) {

      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) { // DONE
          if (xhr.status == 200) { // OK
            try {
              eval.call( window, xhr.responseText );
            }
            catch ( e ) {
              console.log( e );
            }
          }
          if ( callback ) {
            callback( xhr );
          }
        }
      }
      xhr.open( "GET", url );
      xhr.send();

    }
  }

} )( "Script" );
