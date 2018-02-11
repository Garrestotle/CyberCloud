function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}
function getRandomFloat(min, max) {
	return Math.random() * (max - min) + min;
}
function radiansToDegrees(radians){
	return radians*(180/Math.PI);
}
function deg_conv(angle){
	if (angle < 0){
		angle += 360;
	}
	else if (angle > 360){
		angle -= 360;
	}
	angle -= 90;
	return angle;
};
module.exports.getRandomFloat = getRandomFloat;
module.exports.getRandomInt = getRandomInt;
module.exports.radiansToDegrees = radiansToDegrees;
module.exports.deg_conv = deg_conv;