const generate = require("./generate.js");
const PIXI = require("./libs/pixi4.5.4.min.js");
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

var main = function(){
    var readyToStart = false;
    var container = new PIXI.DisplayObjectContainer();
    var selectedOption = 0;

    var subtitle = new PIXI.Text('Enter the',{fontFamily : 'Lucida Console', fontSize: 24, fill : 'green', align : 'center' });
        subtitle.x = CyberCloud.canvasWidth/2;
        subtitle.y = CyberCloud.canvasHeight/2 - 75;
        subtitle.anchor.set(.5,.5);
    var title = new PIXI.Text('CYB3R CL0UD',{fontFamily : 'Lucida Console', fontSize: 164, fill : 'green', align : 'center' });
        title.x = CyberCloud.canvasWidth/2;
        title.y = CyberCloud.canvasHeight/2;
        title.anchor.set(.5,.5);
    var options = [
        new PIXI.Text('Start',{fontFamily : 'Lucida Console', fontSize: 21, fill : 'green', align : 'center' }),
        new PIXI.Text('Controls',{fontFamily : 'Lucida Console', fontSize: 21, fill : 'green', align : 'center' })
    ];
    let startingHeight = CyberCloud.canvasHeight/2 + 175;
    for(let x = 0; x < options.length; x++){
        options[x].x = CyberCloud.canvasWidth/2;
        options[x].y = startingHeight + (25 * x);
        options[x].anchor.set(.5,.5);
        container.addChild(options[x]);
    }
    options[0].doThing = ()=>{
        readyToStart = true;
    };
    options[1].doThing = ()=>{
        alert("Just press some buttons, you'll figure it out");
    };
    
    container.addChild(subtitle);
    container.addChild(title);
    CyberCloud.stage.addChild(container);

    window.addEventListener('keydown',handleMainMenuKeyDown);
    requestAnimationFrame(animate);

    function startGame(){
        CyberCloud.stage.removeChild(container);
        window.removeEventListener('keydown',handleMainMenuKeyDown);

        CyberCloud.gameLevel = generate.gameLevel({
            rocks : undefined,
            npcs : 1
        });
        CyberCloud.stage.addChild(CyberCloud.gameLevel.container);

        CyberCloud.player = generate.playerShip(CyberCloud.gameLevel);
        CyberCloud.gameLevel.gameObjects.push(CyberCloud.player);
            
        CyberCloud.gameLevel.start();

    }

    function animate(){
        var scrollSpeed = 20;
        CyberCloud.background.tilePosition.x -= scrollSpeed/20;
        CyberCloud.background.tilePosition.y += scrollSpeed/10;
        CyberCloud.lessBackBackground.tilePosition.x -= scrollSpeed/8;
        CyberCloud.lessBackBackground.tilePosition.y += scrollSpeed/4;
        for(let x = 0; x < options.length; x++){
            options[x].setStyle({
                fill : 'green'
            });
        }
        options[selectedOption].setStyle({
            fill : 'lime'
        });
        CyberCloud.renderer.render(CyberCloud.stage);
        if(readyToStart){
            startGame();
        }else
            requestAnimationFrame(animate);
    }

    function handleMainMenuKeyDown(e) {
            switch (e.keyCode) {

                case KEYCODE_UP:
                    selectedOption++;
                    if(selectedOption >= options.length) selectedOption = 0;
                break;
                case KEYCODE_DOWN:
                    selectedOption--;
                    if(selectedOption < 0) selectedOption = options.length - 1;
                break;
                case KEYCODE_ESC:
                    
                break;

                case KEYCODE_SPACE:
                    options[selectedOption].doThing();
                break;
            }
        }


};

module.exports.main = main;
