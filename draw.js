//net effect
let physics_accuracy  = 10,
    mouse_influence   = 20,
    mouse_cut         = 5,
    gravity           = 1400,
    cloth_height      = 130,
    cloth_width       = 145,
    start_y           = 20,
    spacing           = 7,
    tear_distance     = 60;


window.requestAnimFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 1000 / 60);
};

let canvas,
    ctx,
    cloth,
    boundsx,
    boundsy,
    mouse = {
        down: false,
        button: 1,
        x: 0,
        y: 0,
        px: 0,
        py: 0
    };

let Point = function (x, y) {
    this.x      = x;
    this.y      = y;
    this.px     = x;
    this.py     = y;
    this.vx     = 0;
    this.vy     = 0;
    this.pin_x  = null;
    this.pin_y  = null;

    this.constraints = [];
};

Point.prototype.update = function (delta) {
    if (mouse.down) {
        let diff_x = this.x - mouse.x,
            diff_y = this.y - mouse.y,
            dist = Math.sqrt(diff_x * diff_x + diff_y * diff_y);

        if (mouse.button == 1) {
            if (dist < mouse_influence) {
                this.px = this.x - (mouse.x - mouse.px) * 1.8;
                this.py = this.y - (mouse.y - mouse.py) * 1.8;
            }

        } else if (dist < mouse_cut) this.constraints = [];
    }

    this.add_force(0, gravity);

    delta *= delta;
    nx = this.x + ((this.x - this.px) * .99) + ((this.vx / 2) * delta);
    ny = this.y + ((this.y - this.py) * .99) + ((this.vy / 2) * delta);

    this.px = this.x;
    this.py = this.y;

    this.x = nx;
    this.y = ny;

    this.vy = this.vx = 0
};

Point.prototype.draw = function () {
    if (!this.constraints.length) return;

    let i = this.constraints.length;
    while (i--) this.constraints[i].draw();
};

Point.prototype.resolve_constraints = function () {
    if (this.pin_x != null && this.pin_y != null) {
        this.x = this.pin_x;
        this.y = this.pin_y;
        return;
    }

    let i = this.constraints.length;
    while (i--) this.constraints[i].resolve();

    this.x > boundsx ? this.x = 2 * boundsx - this.x : 1 > this.x && (this.x = 2 - this.x);
    this.y < 1 ? this.y = 2 - this.y : this.y > boundsy && (this.y = 2 * boundsy - this.y);
};

Point.prototype.attach = function (point) {
    this.constraints.push(
        new Constraint(this, point)
    );
};

Point.prototype.remove_constraint = function (constraint) {
    this.constraints.splice(this.constraints.indexOf(constraint), 1);
};

Point.prototype.add_force = function (x, y) {
    this.vx += x;
    this.vy += y;

    let round = 400;
    this.vx = ~~(this.vx * round) / round;
    this.vy = ~~(this.vy * round) / round;
};

Point.prototype.pin = function (pinx, piny) {
    this.pin_x = pinx;
    this.pin_y = piny;
};

let Constraint = function (p1, p2) {
    this.p1     = p1;
    this.p2     = p2;
    this.length = spacing;
};

Constraint.prototype.resolve = function () {
    let diff_x  = this.p1.x - this.p2.x,
        diff_y  = this.p1.y - this.p2.y,
        dist    = Math.sqrt(diff_x * diff_x + diff_y * diff_y),
        diff    = (this.length - dist) / dist;

    if (dist > tear_distance) this.p1.remove_constraint(this);

    let px = diff_x * diff * 0.5;
    let py = diff_y * diff * 0.5;

    this.p1.x += px;
    this.p1.y += py;
    this.p2.x -= px;
    this.p2.y -= py;
};

Constraint.prototype.draw = function () {
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
};

let Cloth = function () {
    this.points = [];

    let start_x = canvas.width / 2 - cloth_width * spacing / 2;

    for (let y = 0; y <= cloth_height; y++) {
        for (let x = 0; x <= cloth_width; x++) {
            let p = new Point(start_x + x * spacing, start_y + y * spacing);

            x != 0 && p.attach(this.points[this.points.length - 1]);
            y == 0 && p.pin(p.x, p.y);
            y != 0 && p.attach(this.points[x + (y - 1) * (cloth_width + 1)])

            this.points.push(p);
        }
    }
};

Cloth.prototype.update = function () {
    let i = physics_accuracy;

    while (i--) {
        var p = this.points.length;
        while (p--) this.points[p].resolve_constraints();
    }

    i = this.points.length;
    while (i--) this.points[i].update(.016);
};

Cloth.prototype.draw = function () {
    ctx.beginPath();

    let i = cloth.points.length;
    while (i--) cloth.points[i].draw();

    ctx.stroke();
};

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    cloth.update();
    cloth.draw();

    requestAnimFrame(update);
}

function start() {
    canvas.onmousedown = function (e) {
        mouse.button  = e.which;
        mouse.px      = mouse.x;
        mouse.py      = mouse.y;
        let rect      = canvas.getBoundingClientRect();
        mouse.x       = e.clientX - rect.left,
        mouse.y       = e.clientY - rect.top,
        mouse.down    = true;
        e.preventDefault();
    };

    canvas.onmouseup = function (e) {
        mouse.down = false;
        e.preventDefault();
    };

    canvas.onmousemove = function (e) {
        mouse.px  = mouse.x;
        mouse.py  = mouse.y;
        let rect  = canvas.getBoundingClientRect();
        mouse.x   = e.clientX - rect.left,
        mouse.y   = e.clientY - rect.top,
        e.preventDefault();
    };

    canvas.oncontextmenu = function (e) {
        e.preventDefault();
    };

    boundsx = canvas.width - 1;
    boundsy = canvas.height - 1;

    ctx.strokeStyle = 'black';
    ctx.stokeWeight = 0.1;

    cloth = new Cloth();

    update();
}



window.onload=()=>{

  //start
  canvas  = document.getElementById('c');
  ctx     = canvas.getContext('2d');

  canvas.width  = 1000;
  canvas.height = 1000;

  start();


  const canvas2 = document.getElementById('canvas');
  const ctx2 = canvas2.getContext('2d');
  w = canvas2.width = window.innerWidth;
  h = canvas2.height = window.innerHeight;

  //interactive mousemove
  let particleArray = [];
  // get mouse positionsß
  const mouse = {
    x: null,
    y: null
  }

  //setting the mousemove positions
  window.addEventListener('mousemove', function(event) {
    mouse.x = event.x;
    mouse.y = event.y;
    //console.log(mouse);
  });
  setInterval(function() {
    mouse.x = undefined;
    mouse.y = undefined;
  }, 200);

//"X" hidden function
  document.querySelector('#btn-close').addEventListener('click',()=>{
    console.log('ok1');
    document.querySelector('#start').classList.add('hidden')
  })


  // create particle object
  class Particle {
    //define objects' sizes, colors,etc
    constructor(x, y, size, color, weight) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.minSize = size;
      this.color = color;
      this.weight = weight;
    }
    //draw the lines
    draw() {
      ctx2.beginPath();
      ctx2.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
      ctx2.fillStyle = this.color;
      ctx2.fill();

    }
    //setting line positions with mouse movement
    update() {
      this.size -= 0.5;
      if (this.size < 0) {
        this.x = (mouse.x + ((Math.random() * 20) - 10));
        this.y = (mouse.y + ((Math.random() * 20) - 10));
        this.size = (Math.random() * 50) + 10;
        this.weight = (Math.random() * 2) - 0.5;
      }
      this.y += this.weight;
      this.weight += 0.05;

      // if it reaches bottom bounce
      if (this.y > canvas2.height - this.size) {
        this.weight *= -.5;
      };
    }
  }

  function init() {
    particleArray = [];
    //loop for continous line positions
    for (let i = 0; i < 100; i++) {
      let size = (Math.random() * 10) + 1;
      let x = Math.random() * (innerWidth - size * 0.5) + size;
      let y = canvas2.height - 100;
      let color = 'w';
      let weight = 5;
      particleArray.push(new Particle(x, y, size, color, weight));
    }

  }

  function animate() {

    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

    //loop for contious lines appearing
    for (let i = 0; i < particleArray.length; i++) {
      particleArray[i].update();
      //particleArray[i].draw();
    }
    connect();
    requestAnimationFrame(animate);
  }
  init();
  animate();

  function connect() {
    
    let opacityValue = 10;
    // check if particles are close enough to draw line between them
    for (let a = 0; a < particleArray.length; a++) {
      for (let b = a; b < particleArray.length; b++) {
        let distance = ((particleArray[a].x - particleArray[b].x) * (particleArray[a].x - particleArray[b].x)) +
          ((particleArray[a].y - particleArray[b].y) * (particleArray[a].y - particleArray[b].y));
        if (distance < (canvas2.width / 7) * (canvas2.height / 7)) {
          opacityValue = 1 - (distance / 4000);
          // ctx.strokeStyle = 'rgba(0, 19, 219, 0.74),' + opacityValue + ')';
          ctx2.strokeStyle = `${strokeColor}`;
          ctx2.beginPath();
          ctx2.lineWidth = 0.05;
          ctx2.moveTo(particleArray[a].x, particleArray[a].y);
          ctx2.lineTo(particleArray[b].x, particleArray[b].y);
          ctx2.stroke();

        }
      }
    }
    //resize the canvas to continue the animation
    window.addEventListener('resize', function(e) {
      canvas2.width = window.innerWidth;
      canvas2.height = window.innerHeight;
    });
  }

}
