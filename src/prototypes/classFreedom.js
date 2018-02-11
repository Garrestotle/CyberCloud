const PIXI = require("../libs/pixi4.5.4.min.js");
const util = require("../util.js");

function AlertBox(x,y){
  var sprite = new PIXI.Sprite(PIXI.Texture.fromFrame('alertBox.png'));
  sprite.anchor.x = 0.5;
  sprite.anchor.y = 0.5;
  sprite.position.x = x;
  sprite.position.y = y;

  CyberCloud.gameLevel.container.addChild(sprite);

  window.setTimeout(function(){
    CyberCloud.gameLevel.container.removeChild(sprite);
  },2000);
}

var spaceObject = {
    sprite : undefined,
    radius : undefined,
    velocity : {
        x : 0,
        y : 0
    },
    velocity_x : 0,
    velocity_y : 0,
    mass : 1,
    isColliding : false,
    isCollidingWith : undefined,
    IDoneBeenShot(){
        this.stillExists = false;
        AlertBox(this.sprite.position.x, this.sprite.position.y);
    },
    sector : {
        x : 0,
        y : 0
    },
    stillExists : true,
    targetable : false,
    playerPerspective : false,
    type : "object",
    init(iv){
        this.sprite = iv.sprite;
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        this.radius = iv.radius || iv.sprite.width/2;
        this.mass = iv.mass || 100;
        this.playerPerspective = iv.playerPerspective || false;

    },
    updatePosition(){
        var xAmount = this.velocity_x * CyberCloud.delta;
        var yAmount = this.velocity_y * CyberCloud.delta;
        if(this.sprite.position.x+xAmount > CyberCloud.gameLevel.levelWidth || this.sprite.position.x+xAmount < 0){
            CyberCloud.debug(this.sprite.position.x);
            CyberCloud.debug(xAmount);
        }else if(this.sprite.position.y+yAmount > CyberCloud.gameLevel.levelHeight || this.sprite.position.y+yAmount < 0){
            CyberCloud.debug(this.sprite.position.y);
            CyberCloud.debug(yAmount);
        }
        if(this.playerPerspective){
            CyberCloud.background.tilePosition.x -= xAmount/10;
            CyberCloud.background.tilePosition.y -= yAmount/10;
            CyberCloud.lessBackBackground.tilePosition.x -= xAmount/4;
            CyberCloud.lessBackBackground.tilePosition.y -= yAmount/4;
            CyberCloud.gameLevel.container.position.x = CyberCloud.canvasWidth/2 - this.sprite.position.x;
            CyberCloud.gameLevel.container.position.y = CyberCloud.canvasHeight/2 - this.sprite.position.y;
        }
        this.sprite.position.x += xAmount;
        this.sprite.position.y += yAmount;
    },
    accelerate (directionInRadians, acceleration){
        var degree = util.radiansToDegrees(directionInRadians);
        degree = util.deg_conv(degree);

        var diffx = Math.cos(degree * (Math.PI / 180)) * acceleration;
        var diffy = Math.sin(degree * (Math.PI / 180)) * acceleration;
        this.velocity_x += diffx;
        this.velocity_y += diffy;
        if(this.velocity_x == NaN)
            CyberCloud.debug(diffx);
    }
};

var debris = {
    IDoneBeenShot(){
        this.stillExists = false;
        AlertBox(this.sprite.position.x, this.sprite.position.y);
    },
    update(){
        this.updatePosition();
    }
}
Object.setPrototypeOf(debris, spaceObject);

var projectile = {
    active : 2,
    fire(shooter){
        var projectileSprite = new PIXI.Sprite(PIXI.Texture.fromFrame('laserBullet.png'));
        this.type = "projectile";
        projectileSprite.position.x = shooter.xPosition + Math.cos(shooter.rotation-Math.PI/2) * Math.abs(shooter.radius + 5);
        projectileSprite.position.y = shooter.yPosition + Math.sin(shooter.rotation-Math.PI/2) * Math.abs(shooter.radius + 5);
        CyberCloud.gameLevel.container.addChild(projectileSprite);
        this.velocity_x = shooter.velocity.x;
        this.velocity_y = shooter.velocity.y;
        this.accelerate(shooter.rotation, 600);
        this.init({
            sprite : projectileSprite,
            mass : 5
        });
    },
    IDoneBeenShot(){
        this.active = 0;
    },
    update(){
        this.active -= CyberCloud.delta;
        if(this.active <= 0){
            this.stillExists = false;
        }
        this.updatePosition();
    }
}
Object.setPrototypeOf(projectile, spaceObject);


var shipObject = {
    nitroCoolDown : 0,
    acceleration_rate : 400,
    rotating_l : false,
    rotating_r : false,
    accelerating : false,
    breaking : false,
    gunCoolDown : 0.5,
    shields : 100,
    shieldRechargeRate : 4,
    shieldCooldDown : 0,
    target : undefined,
    targetable : true,
    apply_breaks(){
        var breakSpeed = this.acceleration_rate * CyberCloud.delta * 3;
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
    },
    spin_ship(){
        if (this.rotating_l){
        this.sprite.rotation -= 4 * CyberCloud.delta;
        if(this.sprite.rotation < -(Math.PI))
            this.sprite.rotation += 2*Math.PI;
        }
        if (this.rotating_r){
        this.sprite.rotation += 4 * CyberCloud.delta;
        if(this.sprite.rotation > Math.PI)
            this.sprite.rotation -= 2*Math.PI;
        }
    },
    nitro(){
        if(this.nitroCoolDown <= 0){
            if(this.breaking){
                this.nitroCoolDown = 5;
                this.velocity_x = 0;
                this.velocity_y = 0;
            }else if(this.accelerating){
                this.nitroCoolDown = 5;
                this.accelerate(this.sprite.rotation,this.acceleration_rate*5);
            }
        }
    },
    fireLaser(){
        if(this.gunCoolDown <= 0){
            this.gunCoolDown = 0.25;
            let shooterData = {
                radius: this.radius + 5,
                xPosition: this.sprite.position.x,
                yPosition: this.sprite.position.y,
                rotation: this.sprite.rotation,
                velocity : {
                    x : this.velocity_x,
                    y : this.velocity_y
                }
            };
            var laser = Object.create(projectile);
            laser.fire(shooterData);
            CyberCloud.gameLevel.gameObjects.push(laser);
        }
    },
    IDoneBeenShot(){
        if(this.shields > 0){
            this.shields-=25;
        }else{
            this.stillExists = false;
            AlertBox(this.sprite.position.x, this.sprite.position.y);
        }
    },
    dealWithShields(){
        if(this.shields < 100){
        if(this.shields < 0){
            this.shields = 0;
            this.shieldCoolDown = 10;
        }
        if(this.shieldCoolDown > 0){
            this.shieldCoolDown -= CyberCloud.delta;
        }else{
            this.shields += CyberCloud.delta * this.shieldRechargeRate;
        }
        }else if(this.shields > 100){
            this.shields = 100;
        }
    },
    updateShip(){
        if(this.nitroCoolDown > 0){
            this.nitroCoolDown -= CyberCloud.delta;
        }
        if(this.gunCoolDown > 0){
            this.gunCoolDown -= CyberCloud.delta;
        }
        if(this.rotating_l || this.rotating_r){
            this.spin_ship();
        }
        if(this.breaking){
            this.apply_breaks();
        }
        if(this.accelerating){
            this.accelerate(this.sprite.rotation, this.acceleration_rate * CyberCloud.delta);
            this.sprite.gotoAndStop(1);
        }else this.sprite.gotoAndStop(0);
        this.dealWithShields();
        this.updatePosition();
        if(this.playerPerspective)
            this.updateHud();
    },
    cycleTargets(){
      var goneThroughAlready = false;
        var foundSuitableTarget = false;
      for(var x = CyberCloud.gameLevel.gameObjects.findIndex(isSameAsTarget) != -1? this.target : 0; x < CyberCloud.gameLevel.gameObjects.length && !foundSuitableTarget; x++){
        if(CyberCloud.gameLevel.gameObjects[x].targetable && x != this.target){
            this.target = CyberCloud.gameLevel.gameObjects[x];
            foundSuitableTarget = true;
        }else if(x == CyberCloud.gameLevel.gameObjects.length && !goneThroughAlready)
          x = 0;
        if(x == 0)
          goneThroughAlready = true;
      }
      if(!foundSuitableTarget)
        this.target = undefined;
      function isSameAsTarget(obj){
        return Object.is(this.target, obj);
      }
    },
    updateHud(){
        if(document.getElementById('shieldPercentage').textContent != Math.floor(this.shields)){
        if(this.shields > 60){
            document.getElementById('playerShields').style.color = 'green';
        }else if(this.shields > 30){
            document.getElementById('playerShields').style.color = '#550';
        }else{
            document.getElementById('playerShields').style.color = 'red';
        }
        }
        document.getElementById('shieldPercentage').textContent = Math.floor(this.shields);

        if(this.target === undefined){
            document.getElementById('target').textContent = "No Target";
            document.getElementById('directionToTarget').textContent = "";
        }else{
            document.getElementById('target').textContent = this.target;
            var targetsSpritesPosition = this.target.sprite.position;
            var xDiff = '!';
            var yDiff = '!';

            if(targetsSpritesPosition.x > this.sprite.position.x + 150){
            xDiff = 'East';
            }else if(targetsSpritesPosition.x < this.sprite.position.x - 150){
            xDiff = 'West';
            }
            if(targetsSpritesPosition.y > this.sprite.position.y + 150){
            yDiff = 'South';
            }else if(targetsSpritesPosition.y < this.sprite.position.y - 150){
            yDiff = 'North';
            }
            if(document.getElementById('directionToTarget').textContent != yDiff + xDiff){
            document.getElementById('directionToTarget').textContent = yDiff + xDiff
            }
        }
    }
    
};
Object.setPrototypeOf(shipObject, spaceObject);

var playerShip = Object.create(shipObject);
playerShip.update = function(){
    this.updateShip();
};

var aiShip = Object.create(shipObject);
aiShip.ai = function () {

    if(this.target === undefined)
        this.target = CyberCloud.player;
    if(!this.target.stillExists)
        this.cycleTargets();
    var xDiff = this.target.sprite.position.x - this.sprite.position.x;
    var yDiff = this.target.sprite.position.y - this.sprite.position.y;

    this.turnTowardsTarget(xDiff + (this.target.velocity_x* 100 * CyberCloud.delta), yDiff + (this.target.velocity_y * 100 * CyberCloud.delta));

    var distanceToTarget = Math.sqrt(Math.pow(yDiff,2) + Math.pow(xDiff,2));
    var currentVelocity = Math.sqrt(Math.pow(this.velocity_x, 2) + Math.pow(this.velocity_y, 2));

    if(distanceToTarget > 200){
      this.accelerating = true;
      if(Math.abs(Math.atan2(xDiff,-yDiff) - Math.atan2((this.sprite.position.x + this.velocity_x * CyberCloud.delta)-this.sprite.position.x ,-((this.sprite.position.y + this.velocity_y * CyberCloud.delta)-this.sprite.position.y))) > 0.5){
        this.breaking = true;
      }else{
        this.breaking = false;
      }
      if(Math.abs(distanceToTarget - currentVelocity) > 2000 && this.nitroCoolDown <= 0){
        this.nitro();
      }
    }else{
      this.accelerating = false;
      
      if(currentVelocity > 0){
        this.breaking = true;
        if(currentVelocity > 200 && this.nitroCoolDown <= 0){
          this.nitro();
        }
      }else{
        this.breaking = false;
      }
    }

    if(distanceToTarget < 700)
      this.fireLaser();
};
aiShip.turnTowardsTarget = function(xDiff, yDiff){
    var radiansToTarget = Math.atan2(xDiff,-yDiff);

    if(this.sprite.rotation > radiansToTarget+.15){
      if(Math.abs(radiansToTarget-this.sprite.rotation)>Math.PI){
        this.rotating_l = false;
        this.rotating_r = true;
      }else{
        this.rotating_l = true;
        this.rotating_r = false;
      }
    }else if(this.sprite.rotation < radiansToTarget-.15){
      if(Math.abs(radiansToTarget-this.sprite.rotation)>Math.PI){
        this.rotating_l = true;
        this.rotating_r = false;
      }else{
        this.rotating_l = false;
        this.rotating_r = true;
      }
    }else{
      this.rotating_l = false;
      this.rotating_r = false;
    }
};
aiShip.update = function(){
    this.ai();
    this.updateShip();
};

module.exports.debris = debris;
module.exports.playerShip = playerShip;
module.exports.aiShip = aiShip;