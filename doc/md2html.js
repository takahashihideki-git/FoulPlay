var filter = function ( content, context, next ) {

  // first h1 is the title
  var title = "";
  if ( content.match( /^#\s*(.*)\s*$/m ) ) {
    title = RegExp.$1;
  }

  context.title = title;
  
  next( marked( content ) );

}

var dependencies = [
  "https://cdnjs.cloudflare.com/ajax/libs/marked/0.3.2/marked.min.js"
];