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
		createRocks(1000);

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
		requestAnimationFrame(animate);
		/*
		var spaceRocksToCheck = [];
		for(var rock in CyberCloud.spaceRocks){
			spaceRocksToCheck.push(CyberCloud.spaceRocks[rock]);
		}
		*/
		for(var rock in CyberCloud.spaceRocks){
			if(CyberCloud.spaceRocks.hasOwnProperty(rock)){
				if(didCollide(CyberCloud.player, CyberCloud.spaceRocks[rock]))
					calculateCollision(CyberCloud.player, CyberCloud.spaceRocks[rock]);
				didItHitAWall(CyberCloud.spaceRocks[rock]);/*
				for (var otherRock in spaceRocksToCheck){
					if(didCollide(spaceRocksToCheck[otherRock], CyberCloud.spaceRocks[rock]))
						calculateCollision(spaceRocksToCheck[otherRock], CyberCloud.spaceRocks[rock]);
				}
				spaceRocksToCheck.splice(rock,1);
				*/
				CyberCloud.spaceRocks[rock].update();
			}
		}

		CyberCloud.player.update();
		didItHitAWall(CyberCloud.player);

		renderer.render(stage);
	}

}
function createRocks(numberOfRocks){
	console.log('creating rocks');
	for(var r = 0; r < numberOfRocks; r++){
		var rock = new PIXI.Sprite(PIXI.Texture.fromImage('graphics/rock.png'));
		rock.anchor.x = 0.5;
		rock.anchor.y = 0.5;
		rock.position.x = getRandomInt(CyberCloud.gameLevel.levelWidth-50,50);
		rock.position.y = getRandomInt(CyberCloud.gameLevel.levelHeight-50,50);
		CyberCloud.spaceRocks.push(new FloatingSpaceObject(rock, 50));
		//console.log('Space rock created');
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
		var temp = still;
		still = moving;
		moving = temp;
	}
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

	this.updatePosition = function(){
		this.sprite.position.x += this.velocity_x;
		this.sprite.position.y += this.velocity_y;
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

	this.acceleration_rate = 0.1;
	this.rotating_l = false;
	this.rotating_r = false;
	this.accelerating = false;
	this.breaking = false;
	this.radius = 22;
	this.mass = 10;

	this.update_position = function(){
		this.sprite.position.x += this.velocity_x;
		this.sprite.position.y += this.velocity_y;
		CyberCloud.background.tilePosition.x -= this.velocity_x/10;
		CyberCloud.background.tilePosition.y -= this.velocity_y/10;
		CyberCloud.lessBackBackground.tilePosition.x -= this.velocity_x/5;
		CyberCloud.lessBackBackground.tilePosition.y -= this.velocity_y/5;
		CyberCloud.gameLevel.position.x -= this.velocity_x;
		CyberCloud.gameLevel.position.y -= this.velocity_y;
	};
this.apply_breaks = function(){
	if (this.velocity_x > -1 && this.velocity_x < 1){
		this.velocity_x = 0;
	}
	if (this.velocity_y > -1 && this.velocity_y < 1){
		this.velocity_y = 0;
	}
	if ( 0 > this.velocity_x){
		this.velocity_x += this.acceleration_rate;
	}
	else if ( 0 < this.velocity_x){
		this.velocity_x -= this.acceleration_rate;
	}
	if ( 0 > this.velocity_y){
		this.velocity_y += this.acceleration_rate;
	}
	else if ( 0 < this.velocity_y){
		this.velocity_y -= this.acceleration_rate;
	}
};
this.spin_ship = function(){
	if (this.rotating_l){
		this.sprite.rotation -= 0.1;
	}
	if (this.rotating_r){
		this.sprite.rotation += 0.1;
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
		this.accelerate(this.sprite.rotation, this.acceleration_rate);
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
