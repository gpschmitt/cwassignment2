/*
 * Utility Functions
 */

/*
 * This function was given in Dr. Marriott's tag.zip.
 * It returns the distance between two objects that each have an x and y value.
 */
function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/*
 * This code was stolen and slightly modified from the "Getting a random integer between two values" 
 * example code on the Mozilla Developer Network page for Math.random().
 * It now returns a random integer in the inclusive range between min and max.
 * The following is a link to the MDN Math.random page:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 */
function randomInteger(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max) + 1;
    return Math.floor(randomFloat(min, max));
}

function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

/*
 * Returns the angle in radians of theta given rise (opposite) and run (adjacent).
 */
function angleRadians(rise, run) {
    return Math.atan2(rise, run);
}

/*
 * Converts radians to degrees.
 * For example, radiansToDegrees(0) returns 0, radiansToDegrees(Math.pi) returns 180.
 */
function radiansToDegrees(radians) {
    var degrees = radians * (180 / Math.PI);
	if (degrees < 0){
		degrees += 360;
	}
    return degrees;
}

/*
 * Converts degrees to radians.
 * For example, degreesToRadians(0) returns 0, degreesToRadians(180) returns Math.pi.
 */
function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}
