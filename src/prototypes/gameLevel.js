const PIXI = require("../libs/pixi4.5.4.min.js");
const physics = require("../physicsEngine.js");

//Save some useful key codes for later, so I don't  have to remember the random number
const KEYCODE_LEFT = 37;
const KEYCODE_UP = 38;
const KEYCODE_RIGHT = 39;
const KEYCODE_DOWN = 40;
//var KEYCODE_a = 65;
//var KEYCODE_s = 83;
const KEYCODE_t = 84;
const KEYCODE_ESC = 27;
const KEYCODE_CTRL = 17;
const KEYCODE_SPACE = 32;

const gameLevel = function(){
    //Public Properties
	this.container = new PIXI.DisplayObjectContainer();
	this.levelWidth = 10000;
    this.levelHeight = 10000;
    this.sectorSize = 1000;
    this.gameObjects = [];
    this.spatialHashMap = undefined;
    //Public Methods
    this.animate = function animate(){
        calculateDelta();

        physics.doPhysics(physics.setUpSpatialHashMap(this.levelWidth, this.levelHeight, this.sectorSize), this.gameObjects);

        for(var thing in this.gameObjects){
            if(!this.gameObjects[thing].stillExists){
                this.container.removeChild(this.gameObjects[thing].sprite);
                this.gameObjects.splice(thing,1);
            }else
                this.gameObjects[thing].update();
        }

        CyberCloud.renderer.render(CyberCloud.stage);
        if(CyberCloud.pause){   
            stopAndDoSomethingElse(gameMenu);
        }else{
            requestAnimationFrame(()=>{
                this.animate();
            });
        }
    };
    
    this.start = function(){
        this.spatialHashMap = physics.setUpSpatialHashMap(this.levelWidth, this.levelHeight, this.sectorSize);
        console.log(this.spatialHashMap);
        console.log(this.gameObjects.length);
        requestAnimationFrame(()=>{
            this.animate();
        });
        window.addEventListener('keydown',handleInLevelKeyDown);
        window.addEventListener('keyup', handleInLevelKeyUp);
    }
    //Private Methods
    var stopAndDoSomethingElse = (somethingElse) => {
        window.removeEventListener('keydown',handleInLevelKeyDown);
        window.removeEventListener('keyup', handleInLevelKeyUp);
        somethingElse();
    };
   
    function handleInLevelKeyDown(e) {
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
                CyberCloud.pause = true;
            break;
            case KEYCODE_CTRL:
                CyberCloud.player.nitro();
            break;
            case KEYCODE_SPACE:
                CyberCloud.player.fireLaser();
            break;
            case KEYCODE_t:
                
                CyberCloud.player.cycleTargets();
                console.log(CyberCloud.player.target);
            break;
        }
    }
    //Do different things when a button is released
    function handleInLevelKeyUp(e) {
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
    function calculateDelta(){
        let thisFrame = Date.now(); 
        CyberCloud.delta = (thisFrame - CyberCloud.lastFrame) / 1000;
        CyberCloud.lastFrame = thisFrame;
    }
    function gameMenu(){

        var text = new PIXI.Text('PAUSE',{fontFamily : 'Arial', fontSize: 128, fill : 'green', align : 'center' });
        text.x = CyberCloud.canvasWidth/2;
        text.y = CyberCloud.canvasHeight/2;
        text.anchor.set(.5,.5);
        CyberCloud.stage.addChild(text);
        CyberCloud.renderer.render(CyberCloud.stage);
        window.addEventListener('keydown',handleInMenuKeyDown);

        function closeMenu(){
            CyberCloud.pause = false;
            CyberCloud.stage.removeChild(text);
            window.removeEventListener('keydown',handleInMenuKeyDown);
            window.addEventListener('keydown',handleInLevelKeyDown);
            window.addEventListener('keyup', handleInLevelKeyUp);
            calculateDelta();
            CyberCloud.gameLevel.animate();
        }


        function handleInMenuKeyDown(e) {
            switch (e.keyCode) {

                case KEYCODE_UP:
                    // CyberCloud.player.accelerating = true;
                break;
                case KEYCODE_DOWN:
                    // CyberCloud.player.breaking = true;
                break;
                case KEYCODE_ESC:
                    closeMenu();
                break;

                case KEYCODE_SPACE:
                    // CyberCloud.player.fireLaser();
                break;
            }
        }
    }
};



module.exports = gameLevel;