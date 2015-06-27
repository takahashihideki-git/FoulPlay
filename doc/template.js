var filter = function ( content, context, next ) {

  // content into template
  fileSystem.open( {
    path: context.globalContext.root.path + "/template.html",
    success: function ( path, template ) {
      next( template.replace( /{title}/, context.title ).replace( /{body}/, content ) );
    },
    error: function ( path, error ) {
      console.log( path );
      console.log( error );
      next( false );
    }
  } );

}