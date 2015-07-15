var filter = function ( content, context, next ) {

	if ( ! context.globalContext.done ) {
		context.globalContext.done = 1;
	}
	else {
		context.globalContext.done++;	
	}

	if ( context.globalContext.done == context.globalContext.filesLength ) {
		console.log( "all files filterd." );
	}

	next( content );

}