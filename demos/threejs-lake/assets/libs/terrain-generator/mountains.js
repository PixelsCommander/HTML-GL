var MOUNTAINS_COLORS =
{
	Apply: function( inGeometry, inParameters )
	{
		var step = 1000;
		
		for( var i = 0; i < inGeometry.faces.length; i+=2 )
		{
			var vertex = inGeometry.vertices[inGeometry.faces[i].a],
				depth = Math.min( 1, 0.2 + ( 0.85 + 0.3 * inParameters.alea.Random() ) * 0.8 * Math.round( step * vertex.y / inParameters.depth ) / step ),
				r = 255 * depth * depth,
				g = 255 * depth,
				b = 255 * depth * depth * depth,
				color = new THREE.Color( (r << 16) + (g << 8) + b );
			
			inGeometry.faces[i].color = color;
			inGeometry.faces[i+1].color = color;
		}
	},
	
};