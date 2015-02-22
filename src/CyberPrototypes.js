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
    //acceleration = acceleration * CyberCloud.delta;
    var degree = radiansToDegrees(directionInRadians);
    degree = this.deg_conv(degree);

    var diffx = Math.cos(degree * (Math.PI / 180)) * acceleration;
    var diffy = Math.sin(degree * (Math.PI / 180)) * acceleration;
    this.velocity_x += diffx;
    this.velocity_y += diffy;

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
        var velocityX = this.velocity_x * CyberCloud.delta;
        var velocityY = this.velocity_y * CyberCloud.delta;
        this.updatePosition(velocityX,velocityY);

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
          //console.log(Math.atan2(xDiff,-yDiff));
          if(Math.abs(Math.atan2(xDiff,-yDiff) - Math.atan2((this.sprite.position.x + this.velocity_x * CyberCloud.delta)-this.sprite.position.x ,-((this.sprite.position.y + this.velocity_y * CyberCloud.delta)-this.sprite.position.y))) > 0.5){
            //console.log("SCREEEEEECH!");
            this.breaking = true;
          }else{
            this.breaking = false;
          }
          if(Math.abs(distanceToTarget - currentVelocity) > 2000 && this.nitroCoolDown <= 0){
            this.nitro();
            //console.log("NITROOOOOOO!");
          }
        }else{
          this.accelerating = false;
          if(currentVelocity > 0){
            this.breaking = true;
            if(currentVelocity > 40 && this.nitroCoolDown <= 0){
              this.nitro();
              //console.log("STOOOOOOOOOOP!");
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
        this.updatePosition(velocityX,velocityY);
      }
    }
    AIShip.prototype = new Ship();
