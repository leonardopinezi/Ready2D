document.querySelector("*").setAttribute("style", `
	*:focus {
		outline: none;
		box-shadow: none;
	}
  *{
    user-select: none;
  }
  canvas {
    transition: 1s;
  }
`);

const _engineTransitions = Object.freeze({
  "linear": (element, element1)=> {
    element.style.opacity = 0;
    element1.style.opacity = 1;
  },
  "fade": (element, element1)=> {
    element.style.opacity = 0;
    element1.style.opacity = 1;
  }
});

document.body.setAttribute("ondragstart", "return false");
document.body.setAttribute("ondrop", "return false");

const _splashScreen = document.createElement("div");
_splashScreen.setAttribute("style", `
  position: fixed;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 100%;
  background-color: #111;
  z-index: 9999;
  font-family: monospace;
  font-size: 20pt;
  color: #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  text-align: center;
  transition: .5s;
`);
const _splashScreenText = document.createElement("h1");
_splashScreen.appendChild(_splashScreenText);
_splashScreenText.innerText = "Made in Ready2D";
_splashScreenText.id = "splash_screen_text";
document.body.appendChild(_splashScreen);

const css_engine = document.createElement("style");
document.head.appendChild(css_engine);
css_engine.textContent = `
  #splash_screen_text {
    transition: 1s;
    color: #5f5;
    animation: show-text 1s ease-in-out;
    text-shadow: 0px 0px 10px #5f55;
  }

  @keyframes show-text {
    0% {
      color: #ccc;
      opacity: 0;
      letter-spacing: 20px;
      transform: translateY(50vh) rotate(5deg);
      text-shadow: 0px 0px 0px #5f55;
    }
    50% {
      opacity: 1;
      letter-spacing: 5px;
      transform: translateY(-10vh) rotate(-3deg);
    }
    100% {
      color: #5f5;
    }
  }
`;

_splashScreen.addEventListener("click", (e)=>{
  _splashScreen.style.opacity = 0;
  _splashScreen.style.zIndex = "-1";
  _splashScreen.style.transform = "scale(0.5)"
});

addEventListener("contextmenu", (e)=>{
	e.preventDefault();
});

var _actualEngine = undefined;
class Engine {
	constructor(data) {
		this.data = data || {
			title : "Ready2D Project",
			width : innerWidth,
			height : innerHeight,
			background : "#111"
		};

		this.active = true;

		this.sprites = [];

		this.onCall = ()=>{};

		this.canvas = document.createElement("canvas");
		document.title = this.data.title || "Ready2D Project";
		this.canvas.width = this.data.width || innerWidth;
		this.canvas.height = this.data.height || innerHeight;
		this.canvas.style.backgroundColor = this.data.background || "#111";
		this.canvas.style.position = "fixed";
		this.canvas.style.left = "0px";
		this.canvas.style.top = "0px";
		this.canvas.style.width = "100%";
		this.canvas.style.height = "100%";
    this.canvas.style.zIndex = "-1";
		this.ctx = this.canvas.getContext("2d");

		this.tick = ()=> {
			requestAnimationFrame(this.tick);
			this.onCall();
			this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
			if(true) {
				for(let x in this.sprites) {
					this.ctx.fillStyle = this.sprites[x].color;
					if(Camera.point == this) {
						if(this.sprites[x].color) this.ctx.fillRect(this.canvas.width/2 - this.sprites[x].width/2, this.canvas.height/2 - this.sprites[x].height/2, this.sprites[x].width, this.sprites[x].height);
						if(this.sprites[x].sprite) this.ctx.drawImage(this.sprites[x].img, this.canvas.width/2 - this.sprites[x].width/2, this.canvas.height/2 - this.sprites[x].height/2, this.sprites[x].width, this.sprites[x].height);
					} else {
						if(this.sprites[x].color) this.ctx.fillRect(this.canvas.width /2  + this.sprites[x].x - this.sprites[x].width/2 + (Camera.point.x*-1), this.canvas.height / 2 + this.sprites[x].y - this.sprites[x].height/2 + (Camera.point.y*-1), this.sprites[x].width, this.sprites[x].height);
						if(this.sprites[x].sprite) this.ctx.drawImage(this.sprites[x].img, this.canvas.width /2  + this.sprites[x].x - this.sprites[x].width/2 + (Camera.point.x*-1), this.canvas.height / 2 + this.sprites[x].y - this.sprites[x].height/2 + (Camera.point.y*-1), this.sprites[x].width, this.sprites[x].height);
					}
				}
			}
		}
		this.tick();
	}

	add(sprite) {
		this.sprites.push(sprite);
    sprite.clone = ()=>{
      let data = {};
      Object.keys(sprite).forEach((key, index)=> {
        if(key != ("clone")) data[key] = sprite[key];
      });

      data.clone = true;

      let sclone = new Sprite(data);
      this.sprites.push(sclone);
      sclone.physic = data.physic;
      if(sclone.physic != undefined) data.physic.add(sclone);
    }
	}

	remove(sprite) {
		if(this.sprites.includes(sprite)) {
			this.sprites.splice(this.sprites.indexOf(sprite), 1);
			sprite  = undefined;
		}
	}
}

class Sprite {
	constructor(data) {
		this.x = data.x || 0;
		this.y = data.y || 0;
		this.width = data.width || 50;
		this.height = data.height || 50;
		this.color = data.color || "transparent";
		this.sprite = data.sprite || "";
    this.flip = {
      x : false,
      y : false
    },
    this.physic = undefined;

		this.img = new Image();
		this.img.src = this.sprite;

		this.vX = 0;
		this.vY = 0;
		this.fixed = false;
	}
}

class Physics {
	constructor(enter) {
		this.gravity = enter || [0, 0.1];
		this.bodies = [];

    this.add = (sprite)=> {
      this.bodies.push(sprite);
      sprite.physic = this;
    }
	}

	update() {
		for(let x in this.bodies) {
			if(!this.bodies[x].fixed) {
				this.bodies[x].vX += this.gravity[0];
				this.bodies[x].vY += this.gravity[1];
				this.bodies[x].x += this.bodies[x].vX;
				this.bodies[x].y += this.bodies[x].vY;
				if(this.bodies[x].vX > 0) this.bodies[x].vX-=0.01;
				else if(this.bodies[x].vX < 0) this.bodies[x].vX+=0.01;
			}
			for(let y in this.bodies) {
				if(this.bodies[x] != this.bodies[y]) {
					reflect_if_colliding(this.bodies[x], this.bodies[y]);
				}
			}
		}
	}
}

const testCollision = (rect1, rect2, fat=0)=> {
  return (
    rect1.x + fat < rect2.x + fat + rect1.width + fat &&
    rect1.x + fat + rect2.width + fat + fat > rect2.x + fat &&
    rect1.y + fat < rect2.y + fat + rect2.height + fat &&
    rect1.y + fat + rect1.height + fat + fat > rect2.y + fat
  );
}

const reflect_if_colliding = (rectangle1, rectangle2)=> {
  const dx = rectangle1.x - rectangle2.x;
  const dy = rectangle1.y - rectangle2.y;

  const overlapX = (rectangle1.width/2 + rectangle2.width/2) - Math.abs(dx);
  const overlapY = (rectangle1.height/2 + rectangle2.height/2) - Math.abs(dy);

  if(!rectangle1.fixed) if (overlapX > 0 && overlapY > 0) {
    if (overlapX > overlapY) {
      if (dy > 0) {
        rectangle1.y += overlapY;
      } else {
        rectangle1.y -= overlapY;
      }
    } else {
      if (dx > 0) {
        rectangle1.x += overlapX;
      } else {
        rectangle1.x -= overlapX;
      }

      rectangle1.y += (overlapX*overlapX)+rectangle1.vY;
      rectangle1.vX = -rectangle1.vX*2;
    }
    rectangle1.vY = -rectangle1.vY/(1000);
    
  }
}

const Camera = {
	point : {x : 0, y : 0}
}

class KeyInput {
	constructor(key, code=()=>{}) {
		this.key = key;
		this.down = false;
		this.event = code;

		addEventListener("keypress", (e)=>{
			if(e.key == this.key) this.event();
		});

		addEventListener("keydown", (e)=>{
			if(e.key == this.key) this.down = true;
		});

		addEventListener("keyup", (e)=>{
			if(e.key == this.key) this.down = false;
		});
	}
}

class Joystick {
  constructor(x, y, size) {
    this.center = { x, y };
    this.radius = size / 2;
    this.direction = { x: 0, y: 0 };
    this.activeTouches = {}; // Armazena toques ativos
    this.down = false;

    // Criar base do joystick
    this.base = document.createElement("div");
    Object.assign(this.base.style, {
      position: "fixed",
      left: `${x - this.radius}px`,
      top: `${y - this.radius}px`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "50%",
      background: "#0005",
      touchAction: "none", // Evita zoom e comportamento padrão no mobile
    });

    // Criar stick do joystick
    this.stick = document.createElement("div");
    Object.assign(this.stick.style, {
      position: "absolute",
      left: "50%",
      top: "50%",
      width: `${this.radius}px`,
      height: `${this.radius}px`,
      borderRadius: "50%",
      background: "#5f5",
      transform: "translate(-50%, -50%)",
      cursor: "pointer",
      touchAction: "none", // Evita conflitos de toque
    });

    this.base.appendChild(this.stick);
    document.body.appendChild(this.base);

    // Adicionar eventos de mouse e toque
    this.addEvents();
  }

  addEvents() {
    // Listener para início do movimento (mouse ou toque)
    this.stick.addEventListener("pointerdown", (e) => {
      this.down = true;
      this.activeTouches[e.pointerId] = e; // Registrar toque/cursor
    });

    // Listener para movimentação (mouse ou toque)
    document.addEventListener("pointermove", (e) => {
      if (this.down && this.activeTouches[e.pointerId]) {
        this.move(e);
      }
    });

    // Listener para término do movimento (mouse ou toque)
    document.addEventListener("pointerup", (e) => {
      if (this.activeTouches[e.pointerId]) {
        delete this.activeTouches[e.pointerId];
        if (Object.keys(this.activeTouches).length === 0) {
          this.reset();
        }
      }
    });
  }

  move(e) {
    let dx = e.clientX - this.center.x;
    let dy = e.clientY - this.center.y;

    // Limitar dentro do círculo
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > this.radius) {
      let angle = Math.atan2(dy, dx);
      dx = Math.cos(angle) * this.radius;
      dy = Math.sin(angle) * this.radius;
    }

    this.stick.style.left = `${50 + (dx / this.radius) * 50}%`;
    this.stick.style.top = `${50 + (dy / this.radius) * 50}%`;

    // Normalizar direção (-1 a 1)
    this.direction.x = (dx / this.radius).toFixed(2);
    this.direction.y = (dy / this.radius).toFixed(2);
  }

  reset() {
    this.down = false;
    this.stick.style.left = "50%";
    this.stick.style.top = "50%";
    this.direction = { x: 0, y: 0 };
  }
}

class Gui {
  constructor(x, y, w, h, c) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.color = c;

    this.element = document.createElement("div");
    document.body.appendChild(this.element);

    this.element.style.position = "fixed";
    this.element.style.left = this.x + "px";
    this.element.style.top = this.y + "px";
    this.element.style.width = this.width + "px";
    this.element.style.height = this.height + "px";
    this.element.style.backgroundColor = this.color;
    this.element.style.color = "#fff";
    this.element.style.display = "flex";
    this.element.style.textAlign = "center";
    this.element.style.justifyContent = "center";
    this.element.style.alignItems = "center";
    this.element.style.fontFamily = "arial";
    this.element.style.cursor = "default";
  }

  setText(text){
    this.element.textContent = text;
  }

  hide() {
    this.element.style.display = "none";
  }

  show() {
    this.element.style.display = "block";
  }

  onClick(event){
    this.clicked = false;
    this.touched = false;
    this.touch = 0;
    this.element.addEventListener("mousedown",(e)=>{
      event();
      this.clicked = true;
    });

    this.element.addEventListener("mouseup",(e)=>{
      this.clicked = false;
    });

    this.element.addEventListener("touchstart",(e)=>{
      [...e.touches].forEach((touch) => {
        this.touch = touch;
      });
      this.touched = true;
      event();
    });

    this.element.addEventListener("touchend",(e)=>{
      [...e.touches].forEach((touch) => {
        if(this.touch == touch) {
          this.touched = false;
          this.touch = 0;
        }
      });
    });

    this.element.style.cursor = "pointer";
  }
}

const makeARequest = async (url)=> {
  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
  } catch (error) {
      console.error("Error fetching data:", error);
  }
}

const changeSceneTo = (scene, _animation="linear")=> {
  if(_actualEngine != undefined) _actualEngine.active = false;
  _actualEngine = scene;
  _actualEngine.active = true;
  _engineTransitions[_animation](_actualEngine.canvas, scene.canvas);
  document.body.childNodes.forEach((key, index)=>{
    if(key.nodeName == "CANVAS") document.body.removeChild(key);
  });
  document.body.appendChild(scene.canvas);
  setTimeout(()=>{
    
  },1000);
  _actualEngine.onCall();
}