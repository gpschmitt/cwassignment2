const STARTING_BOIDS = 250;


/*
 * Main Code
 */
var canvas = document.getElementById('gameWorld');
var ctx = canvas.getContext('2d');


var gameEngine = new GameEngine();
gameEngine.init(ctx);

var boid = null;
for (var i = 0; i < STARTING_BOIDS; i++) {
    boid = new Boid(gameEngine);
    gameEngine.addEntity(boid);
}

gameEngine.start();
