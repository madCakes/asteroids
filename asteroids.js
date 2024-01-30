// GLOBALS
const FPS = 30 // frames per second
const FRICTION = 0.6; // friction coeffictient of space (0 = no friction, 1 = high friction)
const ROIDS_NUM = 3; // starting number of asteroids
const ROIDS_SIZE= 100; // starting size of asteroids in pixels
const ROIDS_SPD = 50; // max starting speed in pixels per second
const ROIDS_VERT = 10; // average number of vertices on each asteroid
const SHIP_SIZE = 30; // ship height in pixels
const SHIP_THRUST = 5; // acceleration of ship in pixels per second per second
const TURN_SPEED = 360; // turn speed in deg per second

const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")

// spaceship 
const ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r:  SHIP_SIZE / 2,
    a: 90/180 * Math.PI, // angle in radianss
    rot: 0,
    thrusting: false,
    thrust: {
        x: 0,
        y: 0
    }
}

// asteroids
    let roids = [];
    createAsteroidBelt();

// set up event handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

// update position / game loop
setInterval(update, 1000/ FPS);

function createAsteroidBelt() {
    roids = [];
    let x, y;
    for (let i = 0; i < ROIDS_NUM; i++){
        // random position on screen
        x = Math.floor(Math.random() * canvas.width);
        y = Math.floor(Math.random() * canvas.height);
        // add to list of asteroids
        roids.push(newAsteroid(x, y));
    }
};

function keyDown(e) {
    switch(e.keyCode) {
        case 37: // left arrow rotate anti-clowckwise
            ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
            break;
        case 38: // up arrow thrust 
            ship.thrusting = true
            break;
        case 39: // right arrow rotate clowckwise
            ship.rot = - TURN_SPEED / 180 * Math.PI / FPS;
            break;
    }
}

function keyUp(e) {
    switch(e.keyCode) {
        case 37: //  left arrow stop rotating anti-clowckwise
            ship.rot = 0
            break;
        case 38: // up arrow thrust 
        ship.thrusting = false

            break;
        case 39: // right arrow stop rotating clowckwise
            ship.rot = 0
            break;
    }
}

function newAsteroid(x, y) {
    const roid = {
        x: x,
        y: y,
        xv: Math.random() * ROIDS_SPD / FPS *(Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * ROIDS_SPD / FPS *(Math.random() < 0.5 ? 1 : -1),
        r: ROIDS_SIZE / 2,
        a: Math.random() * Math.PI * 2, // convert to radians
        vert: Math.floor(Math.random() * (ROIDS_VERT + 1) + ROIDS_VERT / 2 )
    }
    return roid
}

function update() {
    // draw space
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // thrust the ship
    if(ship.thrusting) {
        ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS
        ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS

        // draw thruster
        // draw ship
            ctx.fillStyle = "chartreuse"
            ctx.strokeStyle = "orange"
            ctx.lineWidth = SHIP_SIZE / 10;
            ctx.beginPath();
            ctx.moveTo( // rear left
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a)),
            )
            ctx.lineTo( // rear centre behind the ship
                ship.x - ship.r * (5 / 3 * Math.cos(ship.a)),
                ship.y + ship.r * (5 / 3 * Math.sin(ship.a)),
            )
            ctx.lineTo( // rear right
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a)),
            )
            ctx.closePath();
            ctx.fill()
            ctx.stroke();
    } else {
        ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
        ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
    }

    // draw ship
    ctx.strokeStyle = "white"
    ctx.lineWidth = SHIP_SIZE / 20;
    ctx.beginPath();
    ctx.moveTo( // tip of the ship
        ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
        ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
    )
    ctx.lineTo( // rear left
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a)),
    )
    ctx.lineTo( // rear right
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a)),
    )
    ctx.closePath();
    ctx.stroke();
    
    // draw the asteroids
    ctx.strokeStyle = "slategrey";
    ctx.lineWidth = SHIP_SIZE / 20;
    let x, y, r, a, vert;
    for (let i = 0; i < roids.length; i++) {
        
        // get the asteroid properties
        x = roids[i].x;
        y = roids[i].y;
        r = roids[i].r;
        a = roids[i].a;
        vert = roids[i].vert;

        // draw a path
        ctx.beginPath();
        ctx.moveTo(
            x + r * Math.cos(a),
            y + r * Math.sin(a)
        );
            
        // draw a polygon
        for( let j = 0; j < vert; j++) {
            ctx.lineTo(
                x + r * Math.cos(a + j * Math.PI * 2 / vert),
                y + r * Math.sin(a + j * Math.PI * 2 / vert),
            );
        };
        ctx.closePath();
        ctx.stroke();
        // move the asteroid

        // handle edge of screen
    }

    // rotate ship
    ship.a += ship.rot;

    // move the ship
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;

    // handle edge of screen
    if (ship.x < 0 - ship.r) {
        ship.x = canvas.width + ship.r;
    } else if (ship.x > canvas.width + ship.r) {
        ship.x = 0 - ship.r;
    }

    if (ship.y < 0 - ship.r) {
        ship.y = canvas.height + ship.r;
    } else if (ship.y > canvas.height + ship.r) {
        ship.y = 0 - ship.r;
    }

 
    // centre dot
    ctx.fillStyle = "chartreuse";
    ctx.fillRect(ship.x - 1, ship.y -1, 3, 3)
}
