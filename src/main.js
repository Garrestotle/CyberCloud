const PIXI = require("./libs/pixi4.5.4.min.js");
const util = require("./util.js");
const menu = require("./menu.js");


window.CyberCloud = {};
CyberCloud.canvasWidth = 1200;
CyberCloud.canvasHeight = 700;
CyberCloud.lastFrame = Date.now();
CyberCloud.delta = 0;
CyberCloud.stage;
CyberCloud.renderer;

CyberCloud.debug = function(message){
	if(/debug/.test(window.location.hash)){
		console.log(message);
	}
}

function init(){

	CyberCloud.stage = new PIXI.Stage(0x000);
	CyberCloud.renderer = PIXI.autoDetectRenderer(CyberCloud.canvasWidth,CyberCloud.canvasHeight);
	CyberCloud.pause = false;
	document.body.appendChild(CyberCloud.renderer.view);
	createHUD();

	PIXI.loader
    .add('assets/graphics/spriteSheetData.json')
    .load(onAssetsLoaded);

}
function onAssetsLoaded(){

	CyberCloud.background = new PIXI.extras.TilingSprite(PIXI.Texture.fromFrame('StarField.png'),CyberCloud.canvasWidth,700);
	CyberCloud.lessBackBackground = new PIXI.TilingSprite(PIXI.Texture.fromFrame('starFieldCloseAlph.png'),CyberCloud.canvasWidth,700);

	CyberCloud.stage.addChild(CyberCloud.background);
	CyberCloud.stage.addChild(CyberCloud.lessBackBackground);
	
	menu.main();
}

function createHUD(){
	var hud = document.createElement("div");
	hud.innerHTML = "<p id='playerShields'>Shields:<derp id='shieldPercentage'></derp>% Target: <herp id='target'></herp> <herp id='directionToTarget'></herp></p>";

	document.body.appendChild(hud);
}

document.addEventListener('DOMContentLoaded', init );
