var DESTRUCTURE_EFFECT =
{
	Apply: function( inGeometry, inParameters )
	{
		var densityWidth = inParameters.width / inParameters.widthSegments,
			densityHeight = inParameters.height / inParameters.heightSegments,
			densityDepth = inParameters.depth / 255,
			param = 1;
		
		for( var i = 0; i < inGeometry.vertices.length; ++i )
		{
			var vertex = inGeometry.vertices[i];
			
			vertex.x += inParameters.alea.Random() * densityWidth * param;
			vertex.y += inParameters.alea.Random() * densityDepth * param;
			vertex.z += inParameters.alea.Random() * densityHeight * param;
		}
	},
	
};