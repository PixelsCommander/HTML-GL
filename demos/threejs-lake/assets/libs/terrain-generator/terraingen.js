var TERRAINGEN =
{
	/// HELPERS METHODS ///

	/** 
	 * Create a DOM canvas element
	 * @param inWidth Width of the canvas
	 * @param inHeight Height of the canvas
	 * @return The created canvas
	 */
	CreateCanvas: function( inWidth, inHeight ) 
	{
		var canvas = document.createElement( "canvas" );
		canvas.width = inWidth;
		canvas.height = inHeight;
		return canvas;
	},
	
	/**
	 * Create vertices of the terrain from the given canvas and parameters
	 * @param inNoise 2D Canvas that store height informations
	 * @param inGeometry Geometry where fill vertices
	 * @param inDepth Depth of the terrain
	 * @param inWidth Width of the terrain
	 * @param inHeight Height of the terrain
	 */
	CreateVertices: function( inNoise, inGeometry, inDepth, inWidth, inHeight )
	{
		var context = inNoise.getContext('2d'),
			imgData = context.getImageData( 0, 0, inNoise.width, inNoise.height ),
			pixels = imgData.data,
			scaleX = inWidth / ( inNoise.width - 1 ),
			scaleY = inDepth / 255,
			scaleZ= inHeight / ( inNoise.height - 1 ),
			id = 0,
			offsetX = - inNoise.width / 2,
			offsetZ = - inNoise.height / 2;
		
		for( var y = 0; y < inNoise.height; ++y )
		{
			for( var x = 0; x < inNoise.width; ++x )
			{
				inGeometry.vertices.push( new THREE.Vector3( scaleX * ( x + offsetX ), scaleY * ( pixels[id * 4 + 1] ), scaleZ * ( y + offsetZ ) ) );
				++id;
			}
		}
	},
	
	/**
	 * Create faces of the terrain
	 * @param inGeometry Geometry where fill faces
	 * @param inWidth Width of the terrain
	 * @param inHeight Height of the terrain
	 */
	CreateFaces: function( inGeometry, inWidth, inHeight )
	{
		for( var y = 0; y < inHeight - 1; ++y )
		{
			for( var x = 0; x < inWidth - 1; ++x )
			{
				inGeometry.faces.push( new THREE.Face3( 
					y * inWidth + x + 1,
					y * inWidth + x, 
					( y + 1 ) * inWidth + x
				) );
				inGeometry.faces.push( new THREE.Face3( 
					( y + 1 ) * inWidth + x + 1,
					y * inWidth + x + 1,
					( y + 1 ) * inWidth + x
				) );
			}
		}
	},
	
	/**
	 * Create geometry of the terrain from the given canvas and parameters
	 * @param inNoise 2D Canvas that store height informations
	 * @param inWidth Width of the terrain
	 * @param inHeight Height of the terrain
	 * @param inWidthSegments Number of segments on the width
	 * @param inHeightSegments Number of segments on the height
	 * @return The created geometry
	 */
	CreateGeometry: function( inNoise, inDepth, inWidth, inHeight, inWidthSegments, inHeightSegments )
	{
		var geometry = new THREE.Geometry(); 
		
		this.CreateVertices( inNoise, geometry, inDepth, inWidth, inHeight );
		this.CreateFaces( geometry, inWidthSegments, inHeightSegments );
		
		return geometry;
	},
	
	ConstructTerrain: function( inNoise, inParameters )
	{		
		// Create the corresponding geometry
		var geometry = this.CreateGeometry( inNoise, inParameters.depth, inParameters.width, inParameters.height, inParameters.widthSegments, inParameters.heightSegments );
		
		// Apply vertices effect
		for( var i = 0; i < inParameters.effect.length; ++i )
		{
			inParameters.effect[i].Apply( geometry, inParameters );
		}
		
		// Apply post algorithm as color generation
		for( var i = 0; i < inParameters.postgen.length; ++i )
		{
			inParameters.postgen[i].Apply( geometry, inParameters );
		}
		
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
		
		return geometry;
	},
	
	/// ACCESSIBLE METHODS ///
	
	/**
	 * Generate a 2D Canvas from given parameters
	 * @return A canvas that store height map
	 */
	GetCanvas: function( inParameters )
	{
		inParameters = inParameters || {};

		// Manage default parameters
		inParameters.type = inParameters.type || 0;
		inParameters.depth = inParameters.depth || 10;
		inParameters.width = inParameters.width || 100;
		inParameters.height = inParameters.height || 100;
		inParameters.widthSegments = inParameters.widthSegments || 100;
		inParameters.heightSegments = inParameters.heightSegments || 100;
		inParameters.postgen = inParameters.postgen || [];
		inParameters.effect = inParameters.effect || [];
		inParameters.filter = inParameters.filter || [];
		
		if( typeof inParameters.canvas == 'undefined' )
			inParameters.canvas = this.CreateCanvas( inParameters.width, inParameters.height );
		inParameters.canvas.width = inParameters.widthSegments;
		inParameters.canvas.height = inParameters.heightSegments;
		$( inParameters.canvas ).width( inParameters.widthSegments );
		$( inParameters.canvas ).height( inParameters.heightSegments );
		
		var noise = inParameters.generator.Get( inParameters );
		
		// Apply filters
		for( var i = 0; i < inParameters.filter.length; ++i )
		{
			inParameters.filter[i].Apply( noise, inParameters );
		}
		
		return noise;
	},
	
	Get: function ( inParameters )
	{		
		return this.ConstructTerrain( this.GetCanvas( inParameters ), inParameters );
	},
	
	GetFromCanvas: function( inParameters, inCanvas, inX, inY, inWidth, inHeight )
	{
		// Extract a portion of the given canvas into an other
		var noise = this.CreateCanvas( inWidth, inHeight );
		var imageData = inCanvas.getContext("2d").getImageData( inX, inY, inWidth, inHeight );
		noise.getContext("2d").putImageData( imageData, 0, 0, 0, 0, inWidth, inHeight );
		
		var scaleWidth = inWidth / inParameters.widthSegments;
		var scaleHeight = inHeight / inParameters.heightSegments;
		var parameters = Object.create( inParameters );
		parameters.widthSegments = inWidth;
		parameters.heightSegments = inHeight;
		parameters.width = Math.floor( parameters.width * scaleWidth );
		parameters.height = Math.floor( parameters.height * scaleHeight );
		parameters.heightSegments = inHeight;
		
		return this.ConstructTerrain( noise, parameters );
	},
};