var filter = function ( content, context, next ) {

  var zeroPadding = function ( number, length ) {
    return ( "0" + String( number ) ).substr( length * -1 );
  }

  var getLocalTime = function ( date ) {
    var d = new Date( date );
    return d.getFullYear() + "-" + zeroPadding( d.getMonth() + 1, 2 ) + "-" + zeroPadding( d.getDate(), 2 ) + " " + zeroPadding( d.getHours(), 2 ) + ":" + zeroPadding( d.getMinutes(), 2 );
  }

  // content into template
  fileSystem.open( {
    path: context.globalContext.root.path + "/template.html",
    success: function ( path, template ) {
      next( 
        template.replace( /{title}/, context.title )
                .replace( /{pubdate}/, getLocalTime( context.info.modifiedTime ) )
                .replace( /{body}/, content ) 
      );
    },
    error: function ( path, error ) {
      console.log( path );
      console.log( error );
      next( false );
    }
  } );

}