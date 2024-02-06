// GLOBALS
const FPS = 30 // frames per second
const FRICTION = 0.6; // friction coeffictient of space (0 = no friction, 1 = high friction)
const LASER_DIST = 0.5; // max distance laser can travel, as fraction of screen width
const LASER_EXPLODE_DURATION = 0.3; // duration of lasrers explosion in seconds
const LASER_MAX = 10; // maximum number of lasers on screen at once
const LASER_SPD = 500; // speed of lasers in pixels per second
const ROIDS_NUM = 7; // starting number of asteroids
const ROIDS_JAG = 0.4; // jaggedness of asteroids (0 = none, 1 = lots)
const ROIDS_SIZE= 100; // starting size of asteroids in pixels
const ROIDS_SPD = 50; // max starting speed in pixels per second
const ROIDS_VERT = 10; // average number of vertices on each asteroid
const SHIP_BLINK_DUR = 0.1; // duration of ships blink during invis in seconds
const SHIP_EXPLODE_DURATION = 0.3; // duration of ships explosion
const SHIP_INV_DUR = 3; // duration of ships invis/invuln in seconds
const SHIP_SIZE = 30; // ship height in pixels
const SHIP_THRUST = 5; // acceleration of ship in pixels per second per second
const TURN_SPEED = 360; // turn speed in deg per second
const SHOW_BOUNDING = false; // show or hide collision bounding
const SHOW_CENTRE_DOT = false; // show centre dot

const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")

// spaceship 
let ship = newShip();

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

        // random position on screen, not on spaceship

        do {
            x = Math.floor(Math.random() * canvas.width);
            y = Math.floor(Math.random() * canvas.height);
        } while (distBetweenPoints(ship.x, ship.y, x, y) < ROIDS_SIZE * 2 + ship.r)

        // add to list of asteroids
        roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 2)));
    }
};


function destroyAsteroid(index) {
    const x = roids[index].x;
    const y = roids[index].y;
    const r = roids[index].r;

    // split the asteroid in two if necessary
    if (r == Math.ceil(ROIDS_SIZE / 2)) {
        roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 4)));
        roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 4)));
    } else if (r == Math.ceil(ROIDS_SIZE / 4)) {
        roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 8)));
        roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 8)));
    }

    // destroy asteroid
    roids.splice(index, 1)
}

function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

function explodeShip() {
    ship.explodeTime = Math.ceil(SHIP_EXPLODE_DURATION * FPS);
};

function keyDown(e) {
    switch(e.keyCode) {
        case 32: // space bar - shoot laser
            shootLaser();
            break;
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
        case 32: // space bar - allow shooting again
            ship.canShoot = true;
            break;
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

function newAsteroid(x, y, r) {
    const roid = {
        x: x,
        y: y,
        xv: Math.random() * ROIDS_SPD / FPS *(Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * ROIDS_SPD / FPS *(Math.random() < 0.5 ? 1 : -1),
        r: r,
        a: Math.random() * Math.PI * 2, // convert to radians
        vert: Math.floor(Math.random() * (ROIDS_VERT + 1) + ROIDS_VERT / 2 ),
        offset: []
    };

    // create the vertex offsets array
    for (let i = 0; i < roid.vert; i++){
        roid.offset.push(Math.random() * ROIDS_JAG * 2 + 1 - ROIDS_JAG)
    }

    return roid
}

function shootLaser() {
    // create laser object
    if (ship.canShoot && ship.lasers.length < LASER_MAX) {
        ship.lasers.push({ // from the tip of the ship
            x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
            y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
            xv: LASER_SPD * Math.cos(ship.a) / FPS,
            yv: -LASER_SPD * Math.sin(ship.a) / FPS,
            dist: 0,
            explodeTime: 0
        });
    }
    // prevent further shooting
    ship.canShoot = false;
}

function newShip(){
    return {
        x: canvas.width / 2,
        y: canvas.height / 2,
        r:  SHIP_SIZE / 2,
        a: 90 / 180 * Math.PI, // angle in radianss
        blinkNum: Math.ceil(SHIP_INV_DUR / SHIP_BLINK_DUR),
        blinkTime: Math.ceil(SHIP_BLINK_DUR * FPS),
        canShoot: true,
        explodeTime: 0,
        lasers: [],
        rot: 0,
        thrusting: false,
        thrust: {
            x: 0,
            y: 0
        }   
    }
}

function update() {
    const blinkOn = ship.blinkNum % 2 == 0;
    let exploding = ship.explodeTime > 0;

    // draw space
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // thrust the ship
    if(ship.thrusting) {
        ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS
        ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS

        // draw thruster
        if(!exploding && blinkOn){

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
        }
    } else {
        ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
        ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
    }

    // draw ship
    if(!exploding) {
        if(blinkOn){
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
        }

        // handle blinking
        if(ship.blinkNum > 0){

            // reduce blinkTime
            ship.blinkTime--;

            // reduce blinkNum
            if (ship.blinkTime == 0){
                ship.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS)
                ship.blinkNum--;
            }
        }
    } else {

        // draw explosion
        ctx.fillStyle = 'darkRed';
        ctx.strokeStyle = 'darkRed';
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'red';
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.3, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'orange';
        ctx.strokeStyle = 'orange';
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.0, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'yellow';
        ctx.strokeStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.7, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.4, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.stroke();
    }

    // ship bounding
    if(SHOW_BOUNDING == true){
        ctx.strokeStyle = 'lime';
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
        ctx.stroke();
    }
    
    // draw the asteroids
    let x, y, r, a, vert, offset;
    for (let i = 0; i < roids.length; i++) {
        ctx.strokeStyle = "slategrey";
        ctx.lineWidth = SHIP_SIZE / 20;
        
        // get the asteroid properties
        x = roids[i].x;
        y = roids[i].y;
        r = roids[i].r;
        a = roids[i].a;
        vert = roids[i].vert;
        offset = roids[i].offset;

        // draw a path
        ctx.beginPath();
        ctx.moveTo(
            x + r * offset[0] * Math.cos(a),
            y + r * offset[0] * Math.sin(a)
        );
            
        // draw a polygon
        for( let j = 1; j < vert; j++) {
            ctx.lineTo(
                x + r * offset[j] * Math.cos(a + j * Math.PI * 2 / vert),
                y + r * offset[j] * Math.sin(a + j * Math.PI * 2 / vert),
            );
        };
        ctx.closePath();
        ctx.stroke();

        if(SHOW_BOUNDING){
            ctx.strokeStyle = 'lime';
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2, false);
            ctx.stroke();
        }


    }

    // centre dot
    if(SHOW_CENTRE_DOT == true) {
        ctx.fillStyle = "chartreuse";
        ctx.fillRect(ship.x - 1, ship.y -1, 3, 3)
    }

    // draw lasers
    for (let i = 0; i < ship.lasers.length; i++) {
        if (ship.lasers[i].explodeTime == 0) {
            ctx.fillStyle = "white"
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, SHIP_SIZE / 15, 0, Math.PI * 2, false);
            ctx.fill()
        } else {
            // draw the explosion
            ctx.fillStyle = "orangered"
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.75, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "salmon"
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.5, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "pink"
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.25, 0, Math.PI * 2, false);
            ctx.fill();
        }
    }

    // detect laser collision on asteroids
    let ax, ay, ar, lx, ly;
    for (let i = roids.length -1; i >= 0; i--) {

        // grab asteroid properties
        ax = roids[i].x;
        ay = roids[i].y;
        ar = roids[i].r;

        // loop over the lasers
        for (let j = ship.lasers.length -1; j >= 0; j--){
            
            // grab laser properties
            lx = ship.lasers[j].x;
            ly = ship.lasers[j].y;

            // detect hits
            if (ship.lasers[j].explodeTime == 0 && distBetweenPoints(ax, ay, lx, ly,) < ar) {

                // destroy the asteroid and activate the laser explosion
                destroyAsteroid(i);
                ship.lasers[j].explodeTime = Math.ceil(LASER_EXPLODE_DURATION * FPS)

                break;
            }
        }
    }

    // check for asteroid collision (when not exploding)
    if(!exploding){

        if(ship.blinkNum == 0) {

            for(let i = 0; i < roids.length; i++){
                if (distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) < ship.r + roids[i].r){
                    explodeShip();
                    destroyAsteroid(i);
                    break;
                }
            }
        }

        // rotate ship
        ship.a += ship.rot;
        
        // move the ship
        ship.x += ship.thrust.x;
        ship.y += ship.thrust.y;
    } else {
        ship.explodeTime--;
        if(ship.explodeTime == 0) {
            ship = newShip();
        }
    }
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

        // create the lasers
        for (let i = ship.lasers.length - 1; i >= 0; i--){

            // check distance travelled
            if (ship.lasers[i].dist > LASER_DIST * canvas.width){
                ship.lasers.splice(i, 1);
                continue;
            }

            // handle explosion
            if (ship.lasers[i].explodeTime > 0) {

                ship.lasers[i].explodeTime--;

                // destroy laser after duration is up
                if (ship.lasers[i].explodeTime == 0) {
                    ship.lasers.splice(i, 1)
                    continue;
                }

            } else {

                // move the laser
                ship.lasers[i].x += ship.lasers[i].xv;
                ship.lasers[i].y += ship.lasers[i].yv;

                // calculate the dist travelled
                ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2));
            }
            // handle edge of screen
            if (ship.lasers[i].x < 0) {
                ship.lasers[i].x = canvas.width;
            } else if (ship.lasers[i].x > canvas.width) {
                ship.lasers[i].x = 0;
            }
            if (ship.lasers[i].y < 0) {
                ship.lasers[i].y = canvas.height;
            } else if (ship.lasers[i].y > canvas.height) {
                ship.lasers[i].y = 0;
            }
        }

        // move the asteroid
        for(let i = 0; i < roids.length; i++){
            roids[i].x += roids[i].xv;
            roids[i].y += roids[i].yv;
            
            // handle edge of screen
            if (roids[i].x < 0 - roids[i].r) {
                roids[i].x = canvas.width + roids[i].r;
            } else if (roids[i].x > canvas.width + roids[i].r) {
                roids[i].x = 0 - roids[i].r;
            }
        
            if (roids[i].y < 0 - roids[i].r) {
                roids[i].y = canvas.height + roids[i].r;
            } else if (roids[i].y > canvas.height + roids[i].r) {
                roids[i].y = 0 - roids[i].r;
            }
        }
    
    
}
