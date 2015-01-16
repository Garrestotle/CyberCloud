//Save some useful key codes for later, so I don't  have to remember the random number
var KEYCODE_LEFT = 37;
var KEYCODE_UP = 38;
var KEYCODE_RIGHT = 39;
var KEYCODE_DOWN = 40;
var KEYCODE_a = 65;
var KEYCODE_s = 83;
var KEYCODE_ESC = 27;

var canWidth = 800;
var canHeight = 450;

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

		background = new PIXI.TilingSprite(PIXI.Texture.fromImage('graphics/StarField.png'),800,500);
		lessBackBackground = new PIXI.TilingSprite(PIXI.Texture.fromImage('graphics/starFieldCloseAlph.png'),800,500);

		var planet = new PIXI.Sprite(PIXI.Texture.fromImage('graphics/Planet.png'));
		planet.anchor.x = 0.5;
		planet.anchor.y = 0.5;
		planet.position.x = 1000;
		planet.position.y = 1000;

		rock = new PIXI.Sprite(PIXI.Texture.fromImage('graphics/rock.png'));

		rock.anchor.x = 0.5;
		rock.anchor.y = 0.5;
		rock.position.x = canWidth/2;
		rock.position.y = -100;
		//rock.radius = 50;

		spaceRock = new floatingSpaceObject(rock, 50);

		gameLevel = new PIXI.DisplayObjectContainer();
		//gameLevel.width = 10000;
		//gameLevel.height = 10000;

		ship = new PIXI.MovieClip(playerShipTextures);

		ship.anchor.x = 0.5;
		ship.anchor.y = 0.5;
		ship.position.x = canWidth/2;
		ship.position.y = canHeight/2;

		ship.gotoAndStop(0);
		gameLevel.addChild(planet);
		gameLevel.addChild(ship);
		gameLevel.addChild(rock);


		stage.addChild(background);
		stage.addChild(lessBackBackground);
		stage.addChild(gameLevel);

		player = new playerShip(ship);

		requestAnimationFrame(animate);
		window.addEventListener('keydown',function(e){
			handleKeyDown(e,player);
		});
		window.addEventListener('keyup', function(e){
			handleKeyUp(e,player);
		});
	}

	function animate(){
		requestAnimationFrame(animate);
		player.update();
		spaceRock.update();
		if(didCollide(player.radius, player.sprite.position.x, player.sprite.position.y, spaceRock.radius, spaceRock.sprite.position.x, spaceRock.sprite.position.y)) calculateCollision(player, spaceRock);
		renderer.render(stage);
	}

}

function didCollide(radius1, x1, y1, radius2, x2, y2){
	var dist = Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
	var radii = radius1 + radius2;
	//console.log(Math.pow(x2-x1,2)-Math.pow(y2-y1,2));
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
	console.log("Calculate Collision!");
	console.log("angle Ship: "+radiansToDegrees(angleMovingBouncesOffIn)+" Velocity ship is pushed off in: "+v1);
	console.log("angle rock: "+radiansToDegrees(angleStillIsPushedOffIn)+" Velocity rock is pushed off in: "+v2);
	moving.accelerate(angleMovingBouncesOffIn, v1);
	still.accelerate(angleStillIsPushedOffIn, v2);
}

function floatingSpaceObject(sprite, radius){
	this.velocity_x = 0;
	this.velocity_y = 0;
	this.radius = radius;
	this.sprite = sprite;
	this.mass = 50;

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

function playerShip(sprite){

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
		background.tilePosition.x -= this.velocity_x/10;
		background.tilePosition.y -= this.velocity_y/10;
		lessBackBackground.tilePosition.x -= this.velocity_x/5;
		lessBackBackground.tilePosition.y -= this.velocity_y/5;
		gameLevel.position.x -= this.velocity_x;
		gameLevel.position.y -= this.velocity_y;
	};
	/*
	this.screen_wrap = function(){
	if (this.sprite.position.x > canWidth+10) {
	this.sprite.position.x = 0;
}
else if (this.sprite.position.x < -10){
this.sprite.position.x = canWidth;
}
if (this.sprite.position.y > canHeight+10) {
this.sprite.position.y = 0;
}
else if (this.sprite.position.y < -10) {
this.sprite.position.y = canHeight;
}
};
*/
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
playerShip.prototype = new floatingSpaceObject();
function radiansToDegrees(radians){
	return radians*(180/Math.PI);
}
function handleKeyDown(e,player) {
	switch (e.keyCode) {
		case KEYCODE_RIGHT:
			player.rotating_r = true;
		break;
		case KEYCODE_LEFT:
			player.rotating_l = true;
		break;
		case KEYCODE_UP:
			player.accelerating = true;
		break;
		case KEYCODE_DOWN:
			player.breaking = true;
		break;
		case KEYCODE_ESC:
			//pauseMenu();
		break;
	}
}
//Do different things when a button is released
function handleKeyUp(e,player) {
	switch (e.keyCode) {
		case KEYCODE_RIGHT:
			player.rotating_r = false;
		break;
		case KEYCODE_LEFT:
			player.rotating_l = false;
		break;
		case KEYCODE_UP:
			player.accelerating = false;
		break;
		case KEYCODE_DOWN:
			player.breaking = false;
		break;
	}
}
document.addEventListener('DOMContentLoaded', init );
