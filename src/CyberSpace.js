"use strict";
//Save some useful key codes for later, so I don't  have to remember the random number
var KEYCODE_LEFT = 37;
var KEYCODE_UP = 38;
var KEYCODE_RIGHT = 39;
var KEYCODE_DOWN = 40;
//var KEYCODE_a = 65;
//var KEYCODE_s = 83;
var KEYCODE_ESC = 27;
var KEYCODE_CTRL = 17;
var KEYCODE_SPACE = 32;

var hasGamePad = false;
var gamePad;

var canWidth = 800;
var canHeight = 450;

var CyberCloud = {};
CyberCloud.gameObjects = [];

function init(){

	window.addEventListener("gamepadconnected", function(e) {
	  console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
	    e.gamepad.index, e.gamepad.id,
	    e.gamepad.buttons.length, e.gamepad.axes.length);
		alert("Gamepad successfully connected.");
		hasGamePad = true;
		gamePad = navigator.getGamepads()[e.gamepad.index];
	});

	window.addEventListener("gamepaddisconnected", function(e) {
	  console.log("Gamepad disconnected from index %d: %s",
	    e.gamepad.index, e.gamepad.id);
		alert("Gamepad disconnected.");
		hasGamePad = false;
	});

	var stage = new PIXI.Stage(0x000);
	var renderer = PIXI.autoDetectRenderer(canWidth,canHeight);
	document.body.appendChild(renderer.view);
	createHUD();

	var assetsToLoad = ["graphics/playerShipSS.json","graphics/otherShipSS.json", "graphics/StarField.png", "graphics/starFieldCloseAlph.png","graphics/Planet.png", "graphics/rock.png", "graphics/laserBullet.png", 'graphics/alertBox.png'];
	var loader = new PIXI.AssetLoader(assetsToLoad);
	loader.onComplete = onAssetsLoaded;

	loader.load();

	function onAssetsLoaded(){
		var playerShipTextures = [];
		playerShipTextures.push(PIXI.Texture.fromFrame("PlayerShip.png"));
		playerShipTextures.push(PIXI.Texture.fromFrame("PlayerShipGo.png"));
		var otherShipTextures = [];
		otherShipTextures.push(PIXI.Texture.fromFrame("OtherShip.png"));
		otherShipTextures.push(PIXI.Texture.fromFrame("OtherShipGo.png"));

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
		createRocks(294);//Tested up to 1000

		var fireWall = new PIXI.Graphics();
		fireWall.lineStyle(15, 0xCC0000);
		fireWall.drawRect(0, 0, CyberCloud.gameLevel.levelWidth, CyberCloud.gameLevel.levelHeight);

		var ship = new PIXI.MovieClip(playerShipTextures);
		ship.anchor.x = 0.5;
		ship.anchor.y = 0.5;
		ship.position.x = canWidth/2;
		ship.position.y = canHeight/2;
		ship.gotoAndStop(0);
		var otherShip = new PIXI.MovieClip(otherShipTextures);
		otherShip.anchor.x = 0.5;
		otherShip.anchor.y = 0.5;
		otherShip.position.x = getRandomInt(CyberCloud.gameLevel.levelWidth-50,50);
		otherShip.position.y = getRandomInt(CyberCloud.gameLevel.levelHeight-50,50);
		otherShip.gotoAndStop(0);

		CyberCloud.gameLevel.addChild(planet);
		CyberCloud.gameLevel.addChild(ship);
		CyberCloud.gameLevel.addChild(otherShip);

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
		CyberCloud.npc = new AIShip(otherShip);
		CyberCloud.gameObjects = CyberCloud.spaceRocks.concat(CyberCloud.player, CyberCloud.npc);
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
		var sectors = sortOutWhichThingsAreInWhichSector(CyberCloud.gameObjects);

		for(var x = 0; x < sectors.length; x++){
			for(var y = 0; y < sectors[x].length; y++){
				for(var thing1 in sectors[x][y]){
					if(!sectors[x][y][thing1].isColliding){
						for(var thing2 in sectors[x][y]){
							if(sectors[x][y][thing1] !==  sectors[x][y][thing2]){
								if(didCollide(sectors[x][y][thing1],sectors[x][y][thing2])){
									if(sectors[x][y][thing1].type == "projectile" || sectors[x][y][thing2].type == "projectile"){
										sectors[x][y][thing1].IDoneBeenShot();
										sectors[x][y][thing2].IDoneBeenShot();
									}
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

		for(var thing in CyberCloud.gameObjects){
			if(!CyberCloud.gameObjects[thing].stillExists){
				CyberCloud.gameLevel.removeChild(CyberCloud.gameObjects[thing].sprite);
				CyberCloud.gameObjects.splice(thing,1);
			}else{
				//didItHitAWall(CyberCloud.gameObjects[thing]);
				CyberCloud.gameObjects[thing].update();
				didItHitAWall(CyberCloud.gameObjects[thing]);
			}
		}

		if(hasGamePad){
			CyberCloud.player.handleGamePad(gamePad);
		}

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
		things[thing].sector.x = Math.floor(things[thing].sprite.position.x/1000);
		things[thing].sector.y = Math.floor(things[thing].sprite.position.y/1000);
		if(sectors[things[thing].sector.x] === undefined){
			console.log(things[thing].sector.x);
			console.log(things[thing]);
		}
		if(sectors[things[thing].sector.x][things[thing].sector.y] === undefined){
			console.log(things[thing].sector.y);
			console.log(things[thing]);
		}
		sectors[things[thing].sector.x][things[thing].sector.y].push(things[thing]);
	}
	return sectors;
}
function createRocks(numberOfRocks){
	for(var r = 0; r < numberOfRocks; r++){
		var rock = new PIXI.Sprite(PIXI.Texture.fromImage('graphics/rock.png'));
		rock.anchor.x = 0.5;
		rock.anchor.y = 0.5;
		rock.rotation = getRandomFloat(0,6);
		var newRock = new FloatingSpaceObject(rock, 50);
		newRock.velocity_x = getRandomInt(0,100);
		newRock.velocity_y = getRandomInt(0,100);
		newRock.mass = getRandomInt(50,500);
		if(newRock.mass < 125){
			newRock.sprite.scale = {x:0.5,y:0.5};
			newRock.radius = newRock.radius/2;
		}else if(newRock.mass > 400){
			newRock.sprite.scale = {x:1.5,y:1.5};
			newRock.radius = newRock.radius*1.5;
		}
		var overlap;
		do{
			overlap = false;
			newRock.sprite.position.x = getRandomInt(CyberCloud.gameLevel.levelWidth-50,50);
			newRock.sprite.position.y = getRandomInt(CyberCloud.gameLevel.levelHeight-50,50);
			for(var oldRock in CyberCloud.spaceRocks){
				if(didCollide(newRock,CyberCloud.spaceRocks[oldRock])){
					overlap = true;
				}
			}
		}while(overlap);

		CyberCloud.spaceRocks.push(newRock);

	}
}
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}
function getRandomFloat(min, max) {
	return Math.random() * (max - min) + min;
}
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

	var nVector = ( ( collidingThing1.velocity_x - collidingThing2.velocity_x ) * nNormalX )+ ( ( collidingThing1.velocity_y - collidingThing2.velocity_y ) * nNormalY );
	var nVelX = nVector * nNormalX;
	var nVelY = nVector * nNormalY;
	collidingThing1.velocity_x -= nVelX;
	collidingThing1.velocity_y -= nVelY;
	collidingThing2.velocity_x += nVelX;
	collidingThing2.velocity_y += nVelY;
}
function didItHitAWall(it){
	if(it.sprite.position.x < it.radius){
		it.velocity_x = -(it.velocity_x/2);
		it.updatePosition((it.radius-it.sprite.position.x+1),0);
	}else if(it.sprite.position.x > CyberCloud.gameLevel.levelWidth - it.radius){
		it.velocity_x = -(it.velocity_x/2);
		it.updatePosition(-(it.sprite.position.x-(CyberCloud.gameLevel.levelWidth - it.radius)+1),0);
	}
	if(it.sprite.position.y < it.radius){
		it.velocity_y = -(it.velocity_y/2);
		it.updatePosition(0,(it.radius-it.sprite.position.y+1));
	}else if(it.sprite.position.y > CyberCloud.gameLevel.levelHeight - it.radius){
		it.velocity_y = -(it.velocity_y/2);
		it.updatePosition(0,-(it.sprite.position.y-(CyberCloud.gameLevel.levelHeight - it.radius)+1));
	}
}
function radiansToDegrees(radians){
	return radians*(180/Math.PI);
}
function createHUD(){
	var hud = document.createElement("div");
	hud.innerHTML = "<p id='playerShields'>Shields:<derp id='shieldPercentage'></derp>% Direction to Target: <herp id='directionToTarget'></herp></p>";

	document.body.appendChild(hud);

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
			console.log(CyberCloud.player.velocity_y);
		break;
		case KEYCODE_CTRL:
			CyberCloud.player.nitro();
		break;
		case KEYCODE_SPACE:
			CyberCloud.player.fireLaser();
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
