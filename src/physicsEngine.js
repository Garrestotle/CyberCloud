function didCollide(thing1, thing2){
	var xDiff = Math.pow(thing2.sprite.position.x-thing1.sprite.position.x,2);
	var yDiff = Math.pow(thing2.sprite.position.y-thing1.sprite.position.y,2);
	var dist = Math.sqrt(xDiff+yDiff);
	var radii = thing1.radius + thing2.radius;
	if(dist <= radii) return true;
		else return false;
}
function calculateCollision(collidingThing1,collidingThing2){
	var nX1 = collidingThing1.sprite.position.x;
	var nY1 = collidingThing1.sprite.position.y;
	var nDistX = collidingThing2.sprite.position.x - nX1;
	var nDistY = collidingThing2.sprite.position.y - nY1;
	var nDistance = Math.sqrt ( nDistX * nDistX + nDistY * nDistY );
	var nNormalX = nDistX/nDistance;
	var nNormalY = nDistY/nDistance;

	if(collidingThing1.type == "projectile" || collidingThing2.type == "projectile"){
		collidingThing1.IDoneBeenShot();
		collidingThing2.IDoneBeenShot();
	}

	var nVector = ( ( collidingThing1.velocity_x - collidingThing2.velocity_x ) * nNormalX )+ ( ( collidingThing1.velocity_y - collidingThing2.velocity_y ) * nNormalY );
	var nVelX = nVector * nNormalX;
	var nVelY = nVector * nNormalY;
	collidingThing1.velocity_x -= nVelX;
	collidingThing1.velocity_y -= nVelY;
	collidingThing2.velocity_x += nVelX;
	collidingThing2.velocity_y += nVelY;
}
function didItHitAWall(it){
	let bounce = it.sprite.width;
	if(it.sprite.position.x < it.radius){
		it.velocity_x = -(it.velocity_x/2);
		it.sprite.position.x = bounce;
	}else if(it.sprite.position.x > CyberCloud.gameLevel.levelWidth - it.radius){
		it.velocity_x = -(it.velocity_x/2);
		it.sprite.position.x = CyberCloud.gameLevel.levelWidth - bounce;
	}
	if(it.sprite.position.y < it.radius){
		it.velocity_y = -(it.velocity_y/2);
		it.sprite.position.y = bounce;
	}else if(it.sprite.position.y > CyberCloud.gameLevel.levelHeight - it.radius){
		it.velocity_y = -(it.velocity_y/2);
		it.sprite.position.y = CyberCloud.gameLevel.levelHeight - bounce;
	}
}

module.exports.setUpSpatialHashMap = function (mapWidth, mapHeight, cellSize){
	let numberOfColumns = mapWidth/cellSize;
	let numberOfRows = mapWidth/cellSize;

	var hashMap = [];
	for(let x = 0; x < numberOfColumns * numberOfRows; x++){
		hashMap.push([]);
	}

	return {
		numberOfColumns : numberOfColumns,
		numberOfRows : numberOfRows,
		cellSize : cellSize,
		hashMap : hashMap
	};
};

function sortOutWhichCellsThisObjectIsIn(spatialHashMapObj, gameObject){
	var x = gameObject.sprite.position.x;
	var y = gameObject.sprite.position.y;

	var column = Math.floor(x / spatialHashMapObj.cellSize);
	var row = Math.floor(y / spatialHashMapObj.cellSize);
	
	var hash = column + (spatialHashMapObj.numberOfColumns * row);

	if(spatialHashMapObj.hashMap[hash] === undefined){
		console.error("hash",hash);
		console.error("gameObject",gameObject);

	}
	spatialHashMapObj.hashMap[hash].push(gameObject);

	return spatialHashMapObj;
}

module.exports.doPhysics = function doPhysics(spatialHashMapObj, gameObjects){

	for(let x = 0; x < gameObjects.length; x++){
		didItHitAWall(gameObjects[x]);
		spatialHashMapObj = sortOutWhichCellsThisObjectIsIn(spatialHashMapObj, gameObjects[x]);
	}
		

	let hashMap = spatialHashMapObj.hashMap;

	for(let x = 0; x < hashMap.length; x++)
		if(hashMap[x].length > 1)
			checkForCollisionsWithinASingleCell(hashMap[x]);

}

function checkForCollisionsWithinASingleCell(cell){
	while(cell.length > 1){
		for(let x = 1; x < cell.length; x++)
			if(didCollide(cell[0], cell[x]))
				calculateCollision(cell[0], cell[x]);
		cell.shift();
	};
}

module.exports.didCollide = didCollide;
module.exports.didItHitAWall = didItHitAWall;
module.exports.calculateCollision = calculateCollision;
