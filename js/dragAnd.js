( function ( namespace ) {

window[ namespace ] = new Object();
var DragAnd = window[ namespace ];

/**
Drop Class
*/
DragAnd.Drop = function () {

	this.draggables = new Array();
	this.droppables = new Array();

}
DragAnd.Drop.prototype = {

	draggables: null,
	droppables: null,

	addDraggable: function ( element, model ) {
		var draggable = new Draggable( element, model );
		draggable.addListener( this );
		this.draggables.push( draggable )
	},

	addDroppable: function ( element ) {
		this.droppables.push( new Droppable( element ) )
	},

	notify: function ( draggable, event ) {
		//console.log( "notify:" + event.type );
		for ( var i = 0; i < this.droppables.length; i++ ) {
			if ( event.type == "dragstart" ) {
				this.droppables[ i ].element.dispatchEvent( 
					new CustomEvent( 
						'dragstart', 
						{ 'detail': { 
								'draggable': draggable,
								'event': event
							} 
						} 
					) 
				);
			}
			if ( event.type == "dragend" ) {
				if ( this.droppables[ i ].isDroppable ) {
					this.droppables[ i ].element.dispatchEvent( 
						new CustomEvent( 
							'drop', 
							{ 'detail': { 
									'draggable': draggable,
									'event': event 
								} 
							} 
						) 
					);
				}
				else {
					this.droppables[ i ].element.dispatchEvent( 
						new CustomEvent( 
							'dragend', 
							{ 'detail': { 
									'draggable': draggable,
									'event': event
								}
							}
						)
					);
				}
			}
		}

	}

};
/**
 Draggable Class 
*/
var Draggable = function ( element, model ) {

	this.element = element;
	this.model = model;
	this.listeners = new Array();

	var draggable = this;

	this.element.setAttribute( "draggable", true );

	this.element.addEventListener( "dragstart", function ( e ) {
//		console.log( "draggable:dragstart" );
		e.stopPropagation();
		e.dataTransfer.effectAllowed = 'move';
		for ( var i = 0; i < draggable.listeners.length; i++ ) {
			draggable.listeners[ i ].notify( draggable, e );
		}
	} );
	this.element.addEventListener( "dragend", function ( e ) {
//		console.log( "draggable:dragend" );
		e.stopPropagation();
		for ( var i = 0; i < draggable.listeners.length; i++ ) {
			draggable.listeners[ i ].notify( draggable, e );
		}
	} );

}
Draggable.prototype = {

	element: null,
	model: null,
	listeners: null,

	addListener: function ( listener ) {
		this.listeners.push( listener );
	}

};
/**
Droppable Class 
*/
var Droppable = function ( element ) {

	this.element = element;

	var droppable = this;
	this.element.addEventListener( "dragstart", function ( e ) {
//		console.log( droppable.element.getAttribute( "class" ) + " " + "droppable:dragstart" );
		setTimeout( function() { droppable.activate( e.detail.draggable.element ) }, 0 );
	} );
	this.element.addEventListener( "dragenter", function ( e ) {
//		console.log( droppable.element.getAttribute( "class" ) + " " + "droppable:dragenter" );
		droppable.droppable( true );
	} );
	this.element.addEventListener( "dragover", function ( e ) {
//		console.log( droppable.element.getAttribute( "class" ) + " " + "droppable:dragover" );
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	} );
	this.element.addEventListener( "dragleave", function ( e ) {
//		console.log( droppable.element.getAttribute( "class" ) + " " + "droppable:dragleave" );
		droppable.droppable( false );
	} );
	this.element.addEventListener( "drop", function ( e ) {
//		console.log( droppable.element.getAttribute( "class" ) + " " + "droppable:drop" );
		if ( e instanceof CustomEvent ) {
			droppable.droppable( false );
			droppable.inactivate();
		}
	} );
	this.element.addEventListener( "dragend", function ( e ) {
//		console.log( droppable.element.getAttribute( "class" ) + " " + "droppable:dragend" );
		droppable.droppable( false );
		droppable.inactivate();
	} );

}
Droppable.prototype = {

	element: null,
	isDroppable: false,

	droppable: function ( status ) {
//		console.log( "---" + this.element.getAttribute( "class" ) + " isDroppable:" + status );
		this.isDroppable = status;
	},

	activate: function ( draggable ) {
		var droppable = this;
		var children = this.element.querySelectorAll( "*" );
		for ( var i = 0; i < children.length; i++ ) {
			if ( children[ i ] == draggable ) { // parent of the draggable is  the droppable for a draggable
				droppable.droppable( true );
			}
			children[ i ].style.pointerEvents = "none";
		}
	},

	inactivate: function () {
		var children = this.element.querySelectorAll( "*" );
		for ( var i = 0; i < children.length; i++ ) {
			children[ i ].style.pointerEvents = "auto";
		}
	}

};
/**
Sort Class
*/
DragAnd.Sort = function () {
	this.startX = 0;
	this.startY = 0;
	this.dragAndDrop = new DragAnd.Drop();
	this.sortables = new Array();
	this.dragging = false;
}
DragAnd.Sort.prototype = {

	startY: 0,
	dragAndDrop: null,
	container: null,
	sortables: null,
	onsort: null,

	setContainer: function ( element, callback ) {

		var sorter = this;

		this.dragAndDrop.addDroppable( element );
		this.container = element;
		this.onsort = callback;

		element.addEventListener( "dragstart", function ( e ) {
			if ( sorter.isSortable( e.detail.draggable.element ) ) {
				sorter.startY = e.detail.event.screenY;
			}
		} );

		element.addEventListener( "drop", function ( e ) {

			if ( ! sorter.isSortable( e.detail.draggable.element ) ) {
				return;
			}

			var dropped = e.detail.draggable;

			var distance = e.detail.event.screenY - sorter.startY;
			var sorted = false;
			var sortedSortables = new Array()

			for ( var i = 0; i < sorter.sortables.length; i++ ) {
				if ( sorter.sortables[ i ].element == dropped.element ) {
					continue;
				}
				if ( ! sorted && dropped.element.getBoundingClientRect().top + distance < sorter.sortables[ i ].element.getBoundingClientRect().top ) {
					sorter.container.insertBefore( dropped.element, sorter.sortables[ i ].element );
					sortedSortables.push( dropped );
					sorted = true;
				}

				sortedSortables.push( sorter.sortables[ i ] );

			}
			if ( ! sorted ) {
				sorter.container.insertBefore( dropped.element, null );
				sortedSortables.push( dropped );
			}

			sorter.sortables = sortedSortables;

			if ( sorter.onsort ) {
				sorter.onsort( sorter );
			}

		} );

	},

	addSortable: function ( element, model ) {

		this.dragAndDrop.addDraggable( element, model );
		this.sortables.push( { element: element, model: model } );

	},

	removeSortable: function ( element ) {

		var newSortables = new Array();

		for ( var i = 0; i < this.sortables.length; i++ ) {
			if ( element != this.sortables[ i ].element ) {
				newSortables.push( this.sortables[ i ] );
			}
		}

		this.sortables = newSortables;

	},

	isSortable: function ( element ) {
		for ( var i = 0; i < this.sortables.length; i++ ) {
			if ( element == this.sortables[ i ].element ) {
				return true;
			}
		}
		return false;
	}

};

} )( "DragAnd" );