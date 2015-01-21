"use strict";
//Save some useful key codes for later, so I don't  have to remember the random number
var KEYCODE_LEFT = 37;
var KEYCODE_UP = 38;
var KEYCODE_RIGHT = 39;
var KEYCODE_DOWN = 40;
//var KEYCODE_a = 65;
//var KEYCODE_s = 83;
var KEYCODE_ESC = 27;

var canWidth = 800;
var canHeight = 450;
//var fps = 60;

var CyberCloud = {};

function init(){
	var stage = new PIXI.Stage(0x000);
	var renderer = PIXI.autoDetectRenderer(canWidth,canHeight);
	document.body.appendChild(renderer.view);

	var assetsToLoad = ["graphics/playerShipSS.json", "graphics/StarField.png", "graphics/starFieldCloseAlph.png","graphics/Planet.png", "graphics/rock.png"];
	var loader = new PIXI.AssetLoader(assetsToLoad);
	loader.onComplete = onAssetsLoaded;
	loader.load();

	function onAssetsLoaded(){
		var playerShipTextures = [];
		playerShipTextures.push(PIXI.Texture.fromFrame("PlayerShip.png"));
		playerShipTextures.push(PIXI.Texture.fromFrame("PlayerShipGo.png"));

		CyberCloud.background = new PIXI.TilingSprite(PIXI.Texture.fromImage('graphics/StarField.png'),800,500);
		CyberCloud.lessBackBackground = new PIXI.TilingSprite(PIXI.Texture.fromImage('graphics/starFieldCloseAlph.png'),800,500);

		CyberCloud.gameLevel = new PIXI.DisplayObjectContainer();
		CyberCloud.gameLevel.levelWidth = 10000;
		CyberCloud.gameLevel.levelHeight = 10000;

		var planet = new PIXI.Sprite(PIXI.Texture.fromImage('graphics/Planet.png'));
		planet.anchor.x = 0.5;
		planet.anchor.y = 0.5;
		planet.position.x = 1000;
		planet.position.y = 1000;

		CyberCloud.spaceRocks = [];
		createRocks(250);

		var fireWall = new PIXI.Graphics();
		fireWall.lineStyle(15, 0xCC0000);
		fireWall.drawRect(0, 0, CyberCloud.gameLevel.levelWidth, CyberCloud.gameLevel.levelHeight);

		var ship = new PIXI.MovieClip(playerShipTextures);



		ship.anchor.x = 0.5;
		ship.anchor.y = 0.5;
		ship.position.x = canWidth/2;
		ship.position.y = canHeight/2;
		ship.gotoAndStop(0);

		CyberCloud.gameLevel.addChild(planet);
		CyberCloud.gameLevel.addChild(ship);

		for (var rock in CyberCloud.spaceRocks){
			if(CyberCloud.spaceRocks.hasOwnProperty(rock)){
				CyberCloud.gameLevel.addChild(CyberCloud.spaceRocks[rock].sprite);
			}
		}
		CyberCloud.gameLevel.addChild(fireWall);

		stage.addChild(CyberCloud.background);
		stage.addChild(CyberCloud.lessBackBackground);
		stage.addChild(CyberCloud.gameLevel);

		CyberCloud.player = new PlayerShip(ship);

		requestAnimationFrame(animate);
		window.addEventListener('keydown',function(e){
			handleKeyDown(e);
		});
		window.addEventListener('keyup', function(e){
			handleKeyUp(e);
		});

	}
	function animate(){
			calculateDelta();
			var sectors = sortOutWhichThingsAreInWhichSector(CyberCloud.spaceRocks);
			for(var x = 0; x < sectors.length; x++){
				for(var y = 0; y < sectors[x].length; y++){
					for(var thing1 in sectors[x][y]){
						var firstThing = true;
						if(!sectors[x][y][thing1].isColliding){
							for(var thing2 in sectors[x][y]){
								if(sectors[x][y][thing1] !==  sectors[x][y][thing2]){
									if(didCollide(sectors[x][y][thing1],sectors[x][y][thing2])){
										sectors[x][y][thing1].isColliding = true;
										sectors[x][y][thing1].isCollidingWith = sectors[x][y][thing2];
										sectors[x][y][thing2].isColliding = true;
										sectors[x][y][thing2].isCollidingWith = sectors[x][y][thing1];
										calculateCollision(sectors[x][y][thing1],sectors[x][y][thing2]);
									}
								}
							}
						}else if(!didCollide(sectors[x][y][thing1],sectors[x][y][thing1].isCollidingWith)){
							sectors[x][y][thing1].isColliding = false;
							sectors[x][y][thing1].isCollidingWith.isColliding = false;
						}
					}
				}
			}
			for(var rock in CyberCloud.spaceRocks){
				if(CyberCloud.spaceRocks.hasOwnProperty(rock)){
					if(didCollide(CyberCloud.player, CyberCloud.spaceRocks[rock]))
						calculateCollision(CyberCloud.player, CyberCloud.spaceRocks[rock]);
						didItHitAWall(CyberCloud.spaceRocks[rock]);
					}
				}
				didItHitAWall(CyberCloud.player);

		for(var rock in CyberCloud.spaceRocks){
			CyberCloud.spaceRocks[rock].update();
		}
		CyberCloud.player.update();
		renderer.render(stage);
		requestAnimationFrame(animate);
	}

}
CyberCloud.thisFrame = Date.now();
CyberCloud.lastFrame = Date.now();
CyberCloud.delta = 0;
function calculateDelta(){
	CyberCloud.thisFrame = Date.now();
	CyberCloud.delta = (CyberCloud.thisFrame - CyberCloud.lastFrame) / 1000;
	CyberCloud.lastFrame = CyberCloud.thisFrame;
}
function sortOutWhichThingsAreInWhichSector(things){
	var sectors = [];
	for(var x = 0; x <= Math.floor(CyberCloud.gameLevel.levelWidth/1000); x++){
		sectors.push([]);
		for(var y = 0; y <= Math.floor(CyberCloud.gameLevel.levelHeight/1000); y++){
			sectors[x].push([]);
		}
	}
	for(var thing in things){
		things[thing].sector.x = Math.abs(Math.floor(things[thing].sprite.position.x/1000));
		things[thing].sector.y = Math.abs(Math.floor(things[thing].sprite.position.y/1000));
		sectors[things[thing].sector.x][things[thing].sector.y].push(things[thing]);
	}
	return sectors;
}
function createRocks(numberOfRocks){
	console.log('creating rocks');
	for(var r = 0; r < numberOfRocks; r++){
		var rock = new PIXI.Sprite(PIXI.Texture.fromImage('graphics/rock.png'));
		rock.anchor.x = 0.5;
		rock.anchor.y = 0.5;
		rock.position.x = getRandomInt(CyberCloud.gameLevel.levelWidth-50,50);
		rock.position.y = getRandomInt(CyberCloud.gameLevel.levelHeight-50,50);
		var newRock = new FloatingSpaceObject(rock, 50);
		newRock.velocity_x = getRandomInt(0,50);
		newRock.velocity_y = getRandomInt(0,50);
		newRock.mass = getRandomInt(50,300);
		CyberCloud.spaceRocks.push(newRock);

	}
}
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}
function didCollide(thing1, thing2){
	var xDiff = Math.pow(thing2.sprite.position.x-thing1.sprite.position.x,2);
	var yDiff = Math.pow(thing2.sprite.position.y-thing1.sprite.position.y,2);
	var dist = Math.sqrt(xDiff+yDiff);
	var radii = thing1.radius + thing2.radius;
	if(dist <= radii) return true;
		else return false;
}
function calculateCollision(moving,still){
	if(moving.velocity_x === 0 && moving.velocity_y === 0) {
		if(still.velocity_x === 0 && still.velocity_y === 0) {
			return;
		}
		var temp = still;
		still = moving;
		moving = temp;
	}
	//console.log("collision between things!");
	//console.log(moving);
	//console.log(still);
	var deltaX = moving.sprite.position.x - still.sprite.position.x;
	var deltaY = moving.sprite.position.y - still.sprite.position.y;

	var angleStillIsPushedOffIn = Math.atan2(deltaY,deltaX)-1.57079633;

	var angleMovingBouncesOffIn = angleStillIsPushedOffIn;//moving will be pushed off in a right angle to angleStillIsPushedOffIn
	var movingVelocity = Math.sqrt(Math.pow(moving.velocity_x,2)+Math.pow(moving.velocity_y,2));
	var v1 = ((moving.mass - still.mass)*movingVelocity)/(moving.mass+still.mass);//resulting velocity of moving
	var v2 = (2*moving.mass*movingVelocity)/(moving.mass+still.mass);//Resulting velocity of still
	/*
	console.log("Calculate Collision!");
	console.log("angle Ship: "+radiansToDegrees(angleMovingBouncesOffIn)+" Velocity ship is pushed off in: "+v1);
	console.log("angle rock: "+radiansToDegrees(angleStillIsPushedOffIn)+" Velocity rock is pushed off in: "+v2);
	*/

	if(v1 > 10){
		v1 = 10;
	}
	if(v2 > 10){
		v2=10;
	}

	moving.accelerate(angleMovingBouncesOffIn, v1);
	still.accelerate(angleStillIsPushedOffIn, v2);
}
function didItHitAWall(it){
	var wall = {
		sprite:{
			position:{
				x:0,
				y:0
			}
		},
		mass : 1000000,
		accelerate: function(herp,derp){}
	};
	if(it.sprite.position.x < it.radius){
		//console.log('Wall Crash!');
		wall.sprite.position.x = it.sprite.position.x-it.radius;
		wall.sprite.position.y = it.sprite.position.y;
		calculateCollision(it,wall);
	}else if(it.sprite.position.x > CyberCloud.gameLevel.levelWidth - it.radius){
		wall.sprite.position.x = it.sprite.position.x+it.radius;
		wall.sprite.position.y = it.sprite.position.y;
		calculateCollision(it,wall);
	}
	if(it.sprite.position.y < it.radius){
		//console.log('Wall Crash!');
		wall.sprite.position.y = it.sprite.position.y-it.radius;
		wall.sprite.position.x = it.sprite.position.x;
		calculateCollision(it,wall);
	}else if(it.sprite.position.y > CyberCloud.gameLevel.levelHeight - it.radius){
		wall.sprite.position.y = it.sprite.position.y+it.radius;
		wall.sprite.position.x = it.sprite.position.x;
		calculateCollision(it,wall);
	}
}
function FloatingSpaceObject(sprite, radius){
	this.velocity_x = 0;
	this.velocity_y = 0;
	this.radius = radius;
	this.sprite = sprite;
	this.mass = 100;
	this.sector = {x:0,y:0};
	this.isColliding = false;
	this.isCollidingWith = null;

	this.updatePosition = function(){
		this.sprite.position.x += this.velocity_x * CyberCloud.delta;
		this.sprite.position.y += this.velocity_y * CyberCloud.delta;
	};
	this.deg_conv = function(angle){
		if (angle < 0){
			angle += 360;
		}
		else if (angle > 360){
			angle -= 360;
		}
		angle -= 90;
		return angle;
	};
	this.accelerate = function(directionInRadians, acceleration){
		//acceleration = acceleration * CyberCloud.delta;
		var degree = radiansToDegrees(directionInRadians);
		degree = this.deg_conv(degree);

		var diffx = Math.cos(degree * (Math.PI / 180)) * acceleration;
		var diffy = Math.sin(degree * (Math.PI / 180)) * acceleration;
		this.velocity_x += diffx;
		this.velocity_y += diffy;

	};

	this.update = function(){
		this.updatePosition();
	};

}

function PlayerShip(sprite){

	this.sprite = sprite;

	this.acceleration_rate = 150;
	this.rotating_l = false;
	this.rotating_r = false;
	this.accelerating = false;
	this.breaking = false;
	this.radius = 22;
	this.mass = 10;

	this.update_position = function(){
		var velocityX = this.velocity_x * CyberCloud.delta;
		var velocityY = this.velocity_y * CyberCloud.delta;
		this.sprite.position.x += velocityX;
		this.sprite.position.y += velocityY;
		CyberCloud.background.tilePosition.x -= velocityX/10;
		CyberCloud.background.tilePosition.y -= velocityY/10;
		CyberCloud.lessBackBackground.tilePosition.x -= velocityX/5;
		CyberCloud.lessBackBackground.tilePosition.y -= velocityY/5;
		CyberCloud.gameLevel.position.x -= velocityX;
		CyberCloud.gameLevel.position.y -= velocityY;
	};
this.apply_breaks = function(){
	var breakSpeed = this.acceleration_rate * CyberCloud.delta * 2;
	if (this.velocity_x > -(breakSpeed) && this.velocity_x < breakSpeed){
		this.velocity_x = 0;
	}
	if (this.velocity_y > -(breakSpeed) && this.velocity_y < breakSpeed){
		this.velocity_y = 0;
	}
	if ( 0 > this.velocity_x){
		this.velocity_x += breakSpeed;
	}
	else if ( 0 < this.velocity_x){
		this.velocity_x -= breakSpeed;
	}
	if ( 0 > this.velocity_y){
		this.velocity_y += breakSpeed;
	}
	else if ( 0 < this.velocity_y){
		this.velocity_y -= breakSpeed;
	}
};
this.spin_ship = function(){
	if (this.rotating_l){
		this.sprite.rotation -= 4 * CyberCloud.delta;
	}
	if (this.rotating_r){
		this.sprite.rotation += 4 * CyberCloud.delta;
	}

};
this.update = function(){

	if(this.rotating_l || this.rotating_r){
		this.spin_ship();
	}
	if(this.breaking){
		this.apply_breaks();
	}
	if(this.accelerating){
		this.accelerate(this.sprite.rotation, this.acceleration_rate * CyberCloud.delta);
		this.sprite.gotoAndStop(1);
	}
	else this.sprite.gotoAndStop(0);
	this.update_position();
	//this.screen_wrap();

};
}
PlayerShip.prototype = new FloatingSpaceObject();
function radiansToDegrees(radians){
	return radians*(180/Math.PI);
}
function handleKeyDown(e) {
	switch (e.keyCode) {
		case KEYCODE_RIGHT:
			CyberCloud.player.rotating_r = true;
		break;
		case KEYCODE_LEFT:
			CyberCloud.player.rotating_l = true;
		break;
		case KEYCODE_UP:
			CyberCloud.player.accelerating = true;
		break;
		case KEYCODE_DOWN:
			CyberCloud.player.breaking = true;
		break;
		case KEYCODE_ESC:
			//pauseMenu();
		break;
	}
}
//Do different things when a button is released
function handleKeyUp(e) {
	switch (e.keyCode) {
		case KEYCODE_RIGHT:
			CyberCloud.player.rotating_r = false;
		break;
		case KEYCODE_LEFT:
			CyberCloud.player.rotating_l = false;
		break;
		case KEYCODE_UP:
			CyberCloud.player.accelerating = false;
		break;
		case KEYCODE_DOWN:
			CyberCloud.player.breaking = false;
		break;
	}
}
document.addEventListener('DOMContentLoaded', init );
