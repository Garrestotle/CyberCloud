const alt = require('./prototypes/classFreedom.js');
const gameLevelProto = require('./prototypes/gameLevel.js')
const PIXI = require("./libs/pixi4.5.4.min.js");
const util = require("./util.js");

let generate = {};

generate.playerShip = function(gameLevel){
	// var playerShipTextures = [];
	// playerShipTextures.push(PIXI.Texture.fromFrame("handShipt.png"));
	// playerShipTextures.push(PIXI.Texture.fromFrame("handShiptGo.png"));

	var shipData = require('./prototypes/shipData.js').handShip;
	var ship = new PIXI.MovieClip(shipData.textures);
	ship.scale = shipData.scale;
	ship.position.x = 100;
	ship.position.y = 100;
	ship.gotoAndStop(0);
	gameLevel.container.addChild(ship);

  
	// var player = Object.create(alt.aiShip);
	var player = Object.create(alt.playerShip);
	player.init({
		sprite : ship,
		mass : shipData.mass,
		playerPerspective : true
	});
	// console.log(player.sprite.width);
	player.radius = 35;
	// player.cycleTargets();player.cycleTargets();
	// console.log(player.target);
	return player;
}

generate.npc = function npc(gameLevel){
  var otherShipTextures = [];
  otherShipTextures.push(PIXI.Texture.fromFrame("OtherShip.png"));
  otherShipTextures.push(PIXI.Texture.fromFrame("OtherShipGo.png"));

  var ship = new PIXI.MovieClip(otherShipTextures);
  ship.anchor.x = 0.5;
  ship.anchor.y = 0.5;
  ship.position.x = util.getRandomInt(gameLevel.levelWidth-50,50);
  ship.position.y = util.getRandomInt(gameLevel.levelHeight-50,50);
  ship.gotoAndStop(0);
  gameLevel.container.addChild(ship);

  let aiShip = Object.create(alt.aiShip);
  aiShip.init({
	  sprite : ship,
	  mass : 10
  });

  return aiShip;
}

generate.rocks = function rocks(numberOfRocks, gameLevel){
  var rocks = [];
	for(var r = 0; r < numberOfRocks; r++){
		var rock = new PIXI.Sprite(PIXI.Texture.fromFrame('rock.png'));
		rock.rotation = util.getRandomFloat(0,6);
		var newRock = Object.create(alt.debris);
		newRock.init({
			sprite : rock,
			radius : 50
		});
		// console.log(newRock.sprite.height);
		newRock.velocity_x = util.getRandomInt(0,100);
		newRock.velocity_y = util.getRandomInt(0,100);
		newRock.mass = util.getRandomInt(50,500);
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
			newRock.sprite.position.x = util.getRandomInt(gameLevel.levelWidth-50,50);
			newRock.sprite.position.y = util.getRandomInt(gameLevel.levelHeight-50,50);
			for(var oldRock in CyberCloud.spaceRocks){
				if(physics.didCollide(newRock,CyberCloud.spaceRocks[oldRock])){
					overlap = true;
				}
			}
		}while(overlap);

		rocks.push(newRock);
	}

  return rocks;
}

generate.gameLevel = function (initialization) {
	var options = initialization? initialization : {};
	console.log(options);
	var numberOfRocks = (options.rocks !== undefined)? options.rocks : util.getRandomInt(0, 700);
	var numberOfNPCs = (options.npcs !== undefined)? options.npcs : util.getRandomInt(1, 5);


	var level = new gameLevelProto();

	var planet = new PIXI.Sprite(PIXI.Texture.fromFrame('Planet.png'));
	planet.anchor.x = 0.5;
	planet.anchor.y = 0.5;
	planet.position.x = 1000;
	planet.position.y = 1000;
	level.container.addChild(planet);

	for(var x = 0; x < numberOfNPCs; x++){
		level.gameObjects.push(generate.npc(level));
	}
	console.log(numberOfRocks);
	spaceRocks = generate.rocks(numberOfRocks, level);
	for (var rock in spaceRocks){
		if(spaceRocks.hasOwnProperty(rock)){
			level.container.addChild(spaceRocks[rock].sprite);
			level.gameObjects.push(spaceRocks[rock]);
		}
	}

	var fireWall = new PIXI.Graphics();
	fireWall.lineStyle(15, 0xCC0000);
	fireWall.drawRect(0, 0, level.levelWidth, level.levelHeight);
	level.container.addChild(fireWall);

	return level;
}
module.exports = generate;