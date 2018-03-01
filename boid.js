/*
 * Constants
 */
// Visuals
const COLORS = ["#FFFFFF", "#EEEEEE", "#DDDDDD", "#CCCCCC", "#BBBBBB", "#AAAAAA", "#999999", "#888888",
                "#777777", "#666666", "#555555", "#444444", "#333333", "#222222", "#111111", "#000000"];
const MINOR_ANGLE = degreesToRadians(30);
const MIN_SIZE = 20;
const MAX_SIZE = 30;

// Physics
const CANVAS_WIDTH = 1350;
const CANVAS_HEIGHT = 650;
const FRICTION = 1;
const ACCELERATION = 1000000;

// Mechanics
const INDEPENDENCE_LEVELS = COLORS.length;
const MIN_SPEED = 200;
const MAX_SPEED = 400;
const MIN_VISUAL_RADIUS = 50
const MAX_VISUAL_RADIUS = 150;
const MAX_RADIANS_PER_SECOND = Math.PI / 8;
const COLLISION_PREVENTION_DISTANCE = 100;
const COLLISION_PREVENTION_TURN_FACTOR = 16;

// Conditions
const DEBUG = false;

/*
 * Boid definition
 */

/*
 * Boid Entity, demonstrating flocking behavior.
 * When called, randomly generates a size, independence level, and starting (x, y).
 */
function Boid(game) {
    // Randomly choose an independence value between 0 - (INDEPENDENCE_LEVELS - 1)
    // 0 is the least independent, INDEPENDENCE_LEVELS - 1 is the most independent.
    this.independence = randomInteger(0, INDEPENDENCE_LEVELS - 1);
    this.color = COLORS[this.independence];
    
    this.size = randomFloat(MIN_SIZE, MAX_SIZE);

    this.angle = randomFloat(-Math.PI, Math.PI);

    this.speed = randomFloat(MIN_SPEED, MAX_SPEED); 

    // Generate random starting (x, y).
    this.x = randomFloat(this.size, game.surfaceWidth - this.size);
    this.y = randomFloat(this.size, game.surfaceHeight - this.size);
    this.visualRadius = randomInteger(MIN_VISUAL_RADIUS, MAX_VISUAL_RADIUS);

    // Call constructor with arguments (game, x, y)
    Entity.call(this, game, this.x, this.y); 
}

Boid.prototype = new Entity();
Boid.prototype.constructor = Boid;

Boid.prototype.canSee = function (otherBoid) {
    return this.visualRadius + otherBoid.size > distance(this, otherBoid)
}

Boid.prototype.collideLeft = function () {
    return (this.x - this.size) < 0;
};

Boid.prototype.collideRight = function () {
    return (this.x + this.size) > CANVAS_WIDTH;
};

Boid.prototype.collideTop = function () {
    return (this.y - this.size) < 0;
};

Boid.prototype.collideBottom = function () {
    return (this.y + this.size) > CANVAS_HEIGHT;
};

Boid.prototype.facingLeft = function () {
    return this.angle > Math.PI / 2 || this.angle < -(Math.PI / 2);
}

Boid.prototype.facingRight = function () {
    return this.angle < Math.PI / 2 || this.angle > -(Math.PI / 2);
}

Boid.prototype.facingUp = function () {
    return this.angle > 0;
}

Boid.prototype.facingDown = function () {
    return this.angle < 0;
}

Boid.prototype.willCollideLeft = function () {
    return this.x - this.size <= COLLISION_PREVENTION_DISTANCE
           && this.facingLeft();
}

Boid.prototype.willCollideRight = function () {
    return this.x + this.size >= CANVAS_WIDTH - COLLISION_PREVENTION_DISTANCE 
           && this.facingRight();
}

Boid.prototype.willCollideTop = function () {
    return this.y - this.size <= COLLISION_PREVENTION_DISTANCE 
           && this.facingUp();
}

Boid.prototype.willCollideBottom = function () {
    return this.y + this.size >= CANVAS_HEIGHT - COLLISION_PREVENTION_DISTANCE
           && this.facingDown();
}

Boid.prototype.willCollide = function () {
    return this.willCollideLeft() || this.willCollideRight() ||
           this.willCollideTop() || this.willCollideBottom();
}

Boid.prototype.collisionDelta = function () {
    var deltaTheta = 0;
    var maxDifference = MAX_RADIANS_PER_SECOND * this.game.clockTick;

    // Check collision detection
    var left = this.willCollideLeft();
    var right = this.willCollideRight();
    var up = this.willCollideTop();
    var down = this.willCollideBottom();

    if ((left && this.facingUp()) || (right && this.facingDown()) || 
        (up && this.facingRight()) || (down && this.facingLeft())) { 
        // Should turn clockwise, so subtract from theta
        deltaTheta = -maxDifference;
    } else if ((left && this.facingDown()) || (right && this.facingUp()) ||
               (up && this.facingLeft()) || (down && this.facingRight())) {
        // Should turn counter-clockwise, so add to theta
        deltaTheta = maxDifference;
    } else {
        // Not already facing in any particular direction, so pick one at random
        if (randomInteger(0, 1)) {
            deltaTheta = -maxDifference;
        } else {
            deltaTheta = maxDifference;
        }
    }

    deltaTheta *= COLLISION_PREVENTION_TURN_FACTOR;

    return deltaTheta;
}

Boid.prototype.flockDelta = function () {
    // Look for other boids
    var thisBoid = this;
    var averageX = 0;
    var averageY = 0;
    var averageAngle = 0;
    var visibleBoids = 0;
    var deltaTheta = 0;

    var maxDifference = MAX_RADIANS_PER_SECOND * this.game.clockTick;
    
    this.game.entities.forEach(function (otherBoid) {
        if (otherBoid !== thisBoid && thisBoid.canSee(otherBoid)) {
            visibleBoids++;

            // Add to average sum
            averageX += otherBoid.x;
            averageY += otherBoid.y;
            // Shift angles from (-pi, pi] to (0, 2*pi]
            averageAngle += otherBoid.angle + Math.PI;
        }
    });

    if (visibleBoids > 0) {
        // Complete average
        averageX /= visibleBoids;
        averageY /= visibleBoids;
        averageAngle /= visibleBoids;

        // Shift angles back
        averageAngle -= Math.PI;

        deltaTheta = smallestDeltaTheta(this.angle, averageAngle);

        // Take into account the independence of the boid
        maxDifference *= INDEPENDENCE_LEVELS - this.independence;

        // Make sure delta is no greater than maxDifference
        if (deltaTheta > maxDifference) {
            deltaTheta = maxDifference;
        } else if (deltaTheta < -maxDifference) {
            deltaTheta = -maxDifference;
        }
    }

    return deltaTheta;
}

Boid.prototype.update = function () {
    Entity.prototype.update.call(this);

    if (this.willCollide()) {
        this.angle += this.collisionDelta();
    } else {
        this.angle += this.flockDelta();
    }

    var distance = this.speed * this.game.clockTick;

    // Bounce off walls
    if (this.collideLeft() || this.collideRight()) {
        this.angle = Math.PI - this.angle;

        // Push back out
        if (this.collideLeft()) {
            this.x += distance;
        } else {
            this.x -= distance;
        } 
    }
    if (this.collideTop() || this.collideBottom()) {
        this.angle *= -1;

        // Push back out
        if (this.collideTop()) {
            this.y += distance;
        } else {
            this.y -= distance;
        }
    }

    // Keep this.angle within [-pi, pi]
    while (this.angle < -Math.PI) {
        this.angle += 2 * Math.PI;
    }
    while (this.angle > Math.PI) {
        this.angle -= 2 * Math.PI;
    }

    // Update x and y based on speed, clockTick, and angle
    this.x += Math.cos(this.angle) * distance;
    this.y -= Math.sin(this.angle) * distance;

};

Boid.prototype.draw = function (ctx) {
    if (DEBUG) {
        // Draw circle
        ctx.beginPath();
        ctx.strokeStyle = "green";
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.stroke();
        ctx.closePath();
    }

    // boid points
    var topPoint = {x: this.x + (this.size * Math.cos(this.angle)),
                    y: this.y + (this.size * -Math.sin(this.angle))};
    
    var leftPoint = {x: this.x + (this.size * Math.cos(this.angle + Math.PI - MINOR_ANGLE)),
                     y: this.y + (this.size * -Math.sin(this.angle + Math.PI - MINOR_ANGLE))};

    var rightPoint = {x: this.x + (this.size * Math.cos(this.angle + Math.PI + MINOR_ANGLE)),
                      y: this.y + (this.size * -Math.sin(this.angle + Math.PI + MINOR_ANGLE))};

    // Draw boid
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.moveTo(topPoint.x, topPoint.y);
    ctx.lineTo(leftPoint.x, leftPoint.y);
    ctx.lineTo(rightPoint.x, rightPoint.y);
    ctx.fill();
    ctx.closePath();

};
