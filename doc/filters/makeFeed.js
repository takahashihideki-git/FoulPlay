var filter = function ( content, context, next ) {

console.log( JSON.stringify( context.info ) );

	if ( ! context.globalContext.pages ) {
		context.globalContext.pages = new Array();
	}

	var parser = new DOMParser();
	var dom = parser.parseFromString( content, "text/html" )
	var paragraphs = dom.querySelectorAll( "p" );
	var description = "";
	for ( var i = 0; i < paragraphs.length; i++ ) {
		description += paragraphs[ i ].innerText;
		if ( description.length > 100 ) {
			break;
		}
	}
	description = description.substr( 0, 100 ); 
	var image = dom.querySelector( "img" );
	var imageSrc = "";
	if ( image ) {
		imageSrc = image.getAttribute( "src" );
	}

	context.globalContext.pages.push( {
		title: context.title,
		description: description,
		path: context.path.replace( /\.md$/, ".html" ),
		image: imageSrc,
		update: context.info.birthTime
	} );

	if ( ! context.globalContext.done ) {
		context.globalContext.done = 1;
	}
	else {
		context.globalContext.done++;	
	}

	if ( context.globalContext.done == context.globalContext.filesLength ) {

		var feed = new RSS( {
		    title: 'Foul Play',
		    description: 'SPAs on Foul',
		    feed_url: 'http://takahashihideki-git.github.io/FoulPlay/doc/rss.xml',
		    site_url: 'http://takahashihideki-git.github.io/FoulPlay/doc/index.html',
		    author: 'takahashihideki',
		    copyright: 'takahashihideki',
		} );

		context.globalContext.pages.sort( function ( a, b ) {
			return a.update - b.update;
		} );

		var documentRoot = "http://takahashihideki-git.github.io/FoulPlay/doc/";

		for ( var i = 0; i < context.globalContext.pages.length; i++ ) {

			var imageUrl = "";
			if ( context.globalContext.pages[ i ].image ) {
				imageUrl = documentRoot + context.globalContext.pages[ i ].image;
			}

			feed.item( {
			    title: context.globalContext.pages[ i ].title,
			    description: context.globalContext.pages[ i ].description,
			    url: documentRoot + context.globalContext.pages[ i ].path,
			    date: ( new Date( context.globalContext.pages[ i ].update ) ).toString(),
			    custom_elements:[ { "image": imageUrl } ]
			} );

		}

		var rssPath = PATH.resolve( Pipeline.selector.root.path + "/rss.xml" )

        fileSystem.save( {
            path: rssPath,
            content: feed.xml( "  " ),
            success: function ( path ) {
                Pipeline.log( "Save: " + path ) 
            },
            error: function ( path, error ) {
                Pipeline.error( "Can't save: " + path )
                console.log( error );
            }
        } );

	}

	next( content );

}

var dependencies = [
  "http://takahashihideki-git.github.io/FoulPlay/js/RSS.js"
];