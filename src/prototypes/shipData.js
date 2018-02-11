const PIXI = require("../libs/pixi4.5.4.min.js");
module.exports.handShip = {
    textures : [
        PIXI.Texture.fromFrame("handShipt.png"),
        PIXI.Texture.fromFrame("handShiptGo.png")
    ],
    scale : {
        x : 0.1,
        y : 0.1
    },
    mass : 20
};
module.exports.originalShip = {
    textures : [
        PIXI.Texture.fromFrame("PlayerShip.png"),
        PIXI.Texture.fromFrame("PlayerShipGo.png")
    ],
    scale : {
        x : 1,
        y : 1
    },
    mass : 10
};