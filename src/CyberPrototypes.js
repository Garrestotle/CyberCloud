function FloatingSpaceObject(sprite, radius){
  this.velocity_x = 0;
  this.velocity_y = 0;
  this.radius = radius;
  this.sprite = sprite;
  this.mass = 100;
  this.sector = {x:0,y:0};
  this.isColliding = false;
  this.isCollidingWith = null;
  this.type = "object";
  this.stillExists = true;

  this.updatePosition = function(xAmount, yAmount){
    if(this.sprite.position.x+xAmount > CyberCloud.gameLevel.levelWidth || this.sprite.position.x+xAmount < 0){
      console.log(this.sprite.position.x);
      console.log(xAmount);
    }else if(this.sprite.position.y+yAmount > CyberCloud.gameLevel.levelHeight || this.sprite.position.y+yAmount < 0){
      console.log(this.sprite.position.y);
      console.log(yAmount);
    }
    this.sprite.position.x += xAmount;
    this.sprite.position.y += yAmount;
  };
  this.IDoneBeenShot = function(){
    this.stillExists = false;
    AlertBox(this.sprite.position.x, this.sprite.position.y);
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
    if(this.velocity_x == NaN)
      console.log(diffx);

  };

  this.update = function(){
    this.updatePosition(this.velocity_x * CyberCloud.delta,this.velocity_y * CyberCloud.delta);
  };

}
function Projectile(shooter){
  this.sprite = new PIXI.Sprite(PIXI.Texture.fromImage('graphics/laserBullet.png'));
  this.sprite.anchor.x = 0.5;
  this.sprite.anchor.y = 0.5;
  this.radius = 4;
  this.type = "projectile";
  this.active = 2;
  this.sprite.position.x = shooter.xPosition + Math.cos(shooter.rotation-Math.PI/2) * Math.abs(shooter.radius);
  this.sprite.position.y = shooter.yPosition + Math.sin(shooter.rotation-Math.PI/2) * Math.abs(shooter.radius);
  CyberCloud.gameLevel.addChild(this.sprite);
  this.velocity_x = shooter.velocity_x;
  this.velocity_y = shooter.velocity_y;
  this.accelerate(shooter.rotation, 300);

  this.IDoneBeenShot = function(){
    this.active = 0;
  }

  this.update = function(){
    this.active -= CyberCloud.delta;
    if(this.active <= 0){
      this.stillExists = false;
    }
    this.updatePosition(this.velocity_x * CyberCloud.delta,this.velocity_y * CyberCloud.delta);
  };
}
Projectile.prototype = new FloatingSpaceObject();
function AlertBox(x,y){
  var sprite = new PIXI.Sprite(PIXI.Texture.fromImage('graphics/alertBox.png'));
  sprite.anchor.x = 0.5;
  sprite.anchor.y = 0.5;
  sprite.position.x = x;
  sprite.position.y = y;

  CyberCloud.gameLevel.addChild(sprite);

  window.setTimeout(function(){
    CyberCloud.gameLevel.removeChild(sprite);
  },2000);
}
function Ship(sprite){
  this.sprite = sprite;
  this.nitroCoolDown = 0;
  this.acceleration_rate = 150;
  this.rotating_l = false;
  this.rotating_r = false;
  this.accelerating = false;
  this.breaking = false;
  this.radius = 22;
  this.mass = 10;
  this.gunCoolDown = 0.5;
  this.shields = 100;
  this.shieldRechargeRate = 3;
  this.shieldCoolDown = 0;

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
      if(this.sprite.rotation < -(Math.PI))
        this.sprite.rotation += 2*Math.PI;
      }
    if (this.rotating_r){
      this.sprite.rotation += 4 * CyberCloud.delta;
      if(this.sprite.rotation > Math.PI)
        this.sprite.rotation -= 2*Math.PI;
      }

  };
  this.nitro = function(){
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
  };
  this.fireLaser = function(){
    if(this.gunCoolDown <= 0){
      this.gunCoolDown = 0.25;
      CyberCloud.gameObjects.push(new Projectile({
        radius: this.radius + 5,
        xPosition: this.sprite.position.x,
        yPosition: this.sprite.position.y,
        rotation: this.sprite.rotation,
        velocity_x: this.velocity_x,
        velocity_y: this.velocity_y
      }));
    }

  };
  this.IDoneBeenShot = function(){
    if(this.shields > 0){
      this.shields-=25;
    }else{
      this.stillExists = false;
      AlertBox(this.sprite.position.x, this.sprite.position.y);
    }
  };
  this.dealWithShields = function(){
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
  };
  this.update = function(){
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
    var velocityX = this.velocity_x * CyberCloud.delta;
    var velocityY = this.velocity_y * CyberCloud.delta;
    this.updatePosition(this.velocity_x * CyberCloud.delta,this.velocity_y * CyberCloud.delta);

  };

}
Ship.prototype = new FloatingSpaceObject();

function PlayerShip(sprite){

  this.sprite = sprite;
  this.nitroCoolDown = 0;
  this.acceleration_rate = 150;
  this.rotating_l = false;
  this.rotating_r = false;
  this.accelerating = false;
  this.breaking = false;
  this.radius = 22;
  this.mass = 10;

  this.updatePosition = function(xAmount, yAmount){
    this.sprite.position.x += xAmount;
    this.sprite.position.y += yAmount;
    CyberCloud.background.tilePosition.x -= xAmount/10;
    CyberCloud.background.tilePosition.y -= yAmount/10;
    CyberCloud.lessBackBackground.tilePosition.x -= xAmount/4;
    CyberCloud.lessBackBackground.tilePosition.y -= yAmount/4;
    CyberCloud.gameLevel.position.x -= xAmount;
    CyberCloud.gameLevel.position.y -= yAmount;
  };
  this.dealWithShields = function(){
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
      this.directionTowardsTarget(CyberCloud.npc.sprite.position);
  };
  this.directionTowardsTarget = function(targetsSpritesPosition){
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
  };

}
PlayerShip.prototype = new Ship();

function AIShip(sprite){


  this.sprite = sprite;
  this.nitroCoolDown = 0;
  this.acceleration_rate = 150;
  this.rotating_l = false;
  this.rotating_r = false;
  this.accelerating = false;
  this.breaking = false;
  this.radius = 22;
  this.mass = 10;

  this.AI = function(){
    var target = CyberCloud.player;

    var xDiff = target.sprite.position.x - this.sprite.position.x;
    var yDiff = target.sprite.position.y - this.sprite.position.y;

    this.turnTowardsTarget(xDiff, yDiff);

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
        if(currentVelocity > 40 && this.nitroCoolDown <= 0){
          this.nitro();
        }
      }else{
        this.breaking = false;
      }
    }
  }
  this.turnTowardsTarget = function(xDiff, yDiff){
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
  }
  this.update = function(){

    this.AI();

    if(this.nitroCoolDown > 0){
      this.nitroCoolDown -= CyberCloud.delta;
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
    var velocityX = this.velocity_x * CyberCloud.delta;
    var velocityY = this.velocity_y * CyberCloud.delta;
    this.updatePosition(this.velocity_x * CyberCloud.delta,this.velocity_y * CyberCloud.delta);
    this.dealWithShields();
  }
}
AIShip.prototype = new Ship();
