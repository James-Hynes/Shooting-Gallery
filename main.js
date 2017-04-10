"use strict";

function preload() {
	game = new Game();
	game.loadSpriteSheet('assets/spritesheet_hud.png', 'assets/spritesheet_hud.xml');
	game.loadSpriteSheet('assets/spritesheet_characters.png', 'assets/spritesheet_characters.xml');
	game.loadSpriteSheet('assets/spritesheet_tiles.png', [64, 64, 10]);
}

class Game {
	constructor() {
		this.state = 'inLevel'; /* inLevel, onChooseLevel, onTitle */
		this.debug = false;
		this.sprites = new Group();
		this.bullets = new Group();
		this.spritesheets = {};
		this.player = this.createPlayer(20, 20);
		this.sprites.add(this.player);
		this.sprites.add(this.createEnemy(400, 400, 10, {'move': ['characters', 'manBrown_stand.png'], 'fire': ['characters', 'manBrown_gun.png'], 'reload': ['characters', 'manBrown_reload.png']}));
		// this.sprites.add(new Tile(2, 2, createVector(0, 0)));
		this.level = new Level(LEVEL_ONE);
	}
	
	update() {
		START_BLOCK('Update Sprites');
		if(this.state === 'inLevel') {
			this.sprites.update();
			this.bullets.update();
		} else if(this.state === 'onTitle') {
		}
		END_BLOCK('Update Sprites');
	}

	display() {
		START_BLOCK('Draw Sprites');
		if(this.state === 'inLevel') {
			this.level.display();
			this.sprites.display();
			this.bullets.display();
		} else if(this.state === 'onTitle') {
		}
		END_BLOCK('Draw Sprites');
	}

	loadSpriteSheet(sheet, xml) {
		let spritesheet_reference = {};
		if(xml instanceof Array) {
			spritesheet_reference = {'width': parseInt(xml[0]), 'height': parseInt(xml[1]), 'spacing': parseInt(xml[2])};
		} else {
			let xmlhttp = new XMLHttpRequest();
			xmlhttp.open("GET", xml, false);
			xmlhttp.send();
			for(let texture of xmlhttp.responseXML.getElementsByTagName('SubTexture')) {
				let attr = texture.attributes;
				spritesheet_reference[attr.name.nodeValue] = {'x': parseInt(attr.x.nodeValue), 'y': parseInt(attr.y.nodeValue), 'width': parseInt(attr.width.nodeValue), 'height': parseInt(attr.height.nodeValue)};
			}
		}
		this.spritesheets[sheet.replace('assets/spritesheet_', '').replace('.png', '')] = {'spritesheet': loadImage(sheet), 'xml': spritesheet_reference};
	}

	getTileFromSpritesheet(sheet, x, y) {
		return createVector(( (x * sheet.xml['width']) + (x * sheet.xml['spacing']) ), (y * sheet.xml['height'] + (y * sheet.xml['spacing'])));
	}

	// make drops
	// make level design/outside tiling
	// make minimap
	createBullet(x, y, parent, base_speed) {
		return new Bullet(x, y, parent, base_speed);
	}

	createPlayer(x, y) {
		return new Player(x, y);
	}

	createEnemy(x, y, health, state_images) {
		return new Enemy(x, y, health, state_images);
	}
}

class Level {
	constructor(design) {
		this.design = design['design'];
		this.extended_tiling = design['extended_tiling'];

		this.level = [];
		this.tiles = new Group();
		this.generateLevel();
	}

	generateLevel() {
		for(let row = 0; row < this.design.length; row++) {
			this.level.push([]);
			for(let col = 0; col < this.design[row].length; col++) {
				let t = new Tile(col, row, createVector(this.design[row][col][0], this.design[row][col][1]));
				this.level[row][col] = t;
				this.tiles.add(t);
			}
		}
	}

	display() {
		this.getTilesToDisplay().display();
	}

	getTilesToDisplay() {
		return this.tiles.filter((tile) => {
			return (tile.position.x + 128 > 0 && tile.position.x < width && tile.position.y + 128 > 0 && tile.position.y < height);
		});
	}

	
}

class Tile extends Sprite {
	constructor(tX, tY, imagePos) {
		super(tX * 95, tY * 95, false);
		this.image = imagePos;
	}

	display() {
			let imPos = game.getTileFromSpritesheet(game.spritesheets['tiles'], this.image.x, this.image.y);
			push();
			translate(this.position.x, this.position.y);
			imageMode(CENTER);
			image(game.spritesheets['tiles'].spritesheet, imPos.x, imPos.y, 64, 64, 0, 0, 64 * 1.5, 64 * 1.5);
			pop();
	}
}

class Player extends Sprite {
	constructor(x, y) {
		super(x, y, false, ['characters', 'hitman1_gun.png']);
		this.state = 'move'; /*stand, move*/
		this.state_images = {'move': ['characters', 'hitman1_gun.png'], 'stand': ['characters', 'hitman1_stand.png'], 'reload': ['characters', 'hitman1_reload.png']};
		this.gun = new Gun(10, 2000, 20, 5, this);
		this.health = 100;
		this.keys_pressed = [];
	}

	update() {
		super.update();
		this.checkBulletCollision();
		this.image = this.state_images[this.state];
	}
	display() {
		push();
		translate(this.position.x, this.position.y);
		imageMode(CENTER);
		rotate(Math.atan2(mouseY - this.position.y, mouseX - this.position.x));
		image(game.spritesheets[this.image[0]].spritesheet, game.spritesheets[this.image[0]].xml[this.image[1]].x, game.spritesheets[this.image[0]].xml[this.image[1]].y, game.spritesheets[this.image[0]].xml[this.image[1]].width, game.spritesheets[this.image[0]].xml[this.image[1]].height, 0, 0, game.spritesheets[this.image[0]].xml[this.image[1]].width, game.spritesheets[this.image[0]].xml[this.image[1]].height);
		// image(game.spritesheets[this.image[0]].spritesheet, 0, 0, , game.spritesheets[this.image[0]].xml[this.image[1]].height, [game.spritesheets[this.image[0]].xml[this.image[1]].x, game.spritesheets[this.image[0]].xml[this.image[1]].y]) // game.spritesheets[this.image[0]].xml.this.image[1].width, game.spritesheets[this.image[0]].xml.this.image[1].height, 0, 0, game.spritesheets[this.image[0]].xml.this.image[1].width, game.spritesheets[this.image[0]].xml.this.image[1].height, game.spritesheets[this.image[0]].xml.this.image[1].x, game.spritesheets[this.image[0]].xml.this.image[1].y, game.spritesheets[this.image[0]].xml.this.image[1].width, game.spritesheets[this.image[0]].xml.this.image[1].height);
		pop();
	}

	handleMousePress() {
		if(this.state === 'stand' || this.state === 'move') {
			this.gun.fireBullet();
		}
	}

	handleKeyPress(_kc, _kup) {
		switch(_kc) {
			// WASD and arrow keys
			case 37:
			case 65:
				this.speed.x += ((_kup) ? -1 : 1) * (-4); // add 4 or -4 to speed depending on keyup/down
				((_kup) ? this.keys_pressed.splice(this.keys_pressed.indexOf(_kc), 1) : this.keys_pressed.push(_kc)); // add or remove the key to keys pressed
				if(!this.state === 'reload') this.state = 'move'; // set state to move
				break;
			case 38:
			case 87:
				this.speed.y += ((_kup) ? -1 : 1) * (-4);
				((_kup) ? this.keys_pressed.splice(this.keys_pressed.indexOf(_kc), 1) : this.keys_pressed.push(_kc));
				if(!this.state === 'reload') this.state = 'move';
				break;
			case 39:
			case 68:
				this.speed.x += ((_kup) ? -1 : 1) * (4);
				((_kup) ? this.keys_pressed.splice(this.keys_pressed.indexOf(_kc), 1) : this.keys_pressed.push(_kc));
				if(!this.state === 'reload') this.state = 'move';
				break;
			case 40:
			case 83:
				this.speed.y += ((_kup) ? -1 : 1) * (4);
				((_kup) ? this.keys_pressed.splice(this.keys_pressed.indexOf(_kc), 1) : this.keys_pressed.push(_kc));
				if(!this.state === 'reload') this.state = 'move';
				break;
		}
		if(Math.abs(this.speed.x) > 4) this.speed.x = ((this.speed.x < 0) ? -4 : 4); // limit x speed to 4/-4
		if(Math.abs(this.speed.y) > 4) this.speed.y = ((this.speed.y < 0) ? -4 : 4); // limit y speed to 4/-4

		if(this.keys_pressed.length === 0) {this.speed.x = 0; this.speed.y = 0}; // if no keys pressed, set speed to 0;
	}	

	takeDamage(damage) {
		this.health -= damage;
		if(this.health <= 0) {
			this.doDeath();
		}
	}

	doDeath() {
		game.sprites.remove(this);
	}

	checkBulletCollision() {
		for(let bullet of game.bullets) {
			if(bullet.isColliding(this) && !(bullet.parent.parent instanceof Player) ) {
				this.takeDamage(bullet.damage);
				game.bullets.remove(bullet);
			}
		}
	}
}

class Enemy extends Sprite {
	constructor(x, y, health, state_images) {
		super(x, y, false, ['characters', 'zombie2_stand.png']);
		this.state_images = state_images;
		this.health = health;
		this.minfromplayer = 300;
		this.state = 'move';
		this.gun = new Gun(1, 500, 20, 10, this);
	}

	display() {
		push();
		imageMode(CENTER);
		translate(this.position.x, this.position.y);
		rotate(Math.atan2(game.player.position.y - this.position.y, game.player.position.x - this.position.x));
		image(game.spritesheets[this.image[0]].spritesheet, game.spritesheets[this.image[0]].xml[this.image[1]].x, game.spritesheets[this.image[0]].xml[this.image[1]].y, game.spritesheets[this.image[0]].xml[this.image[1]].width, game.spritesheets[this.image[0]].xml[this.image[1]].height, 0, 0, game.spritesheets[this.image[0]].xml[this.image[1]].width, game.spritesheets[this.image[0]].xml[this.image[1]].height);
		pop();
	}

	update() {
		this.setState();
		this.image = this.state_images[this.state];
		this.findPath();
		this.checkBulletCollision();
		super.update();
	}

	takeDamage(damage) {
		this.health -= damage;
		if(this.health <= 0) {
			this.doDeath();
		}
	}

	setState() {
		if(this.isInRange()) {
			this.state = 'fire';
		} else {
			this.state = 'move';
		}
	}

	doDeath() {
		game.sprites.remove(this);
	}

	isInRange() {
		return ( (Math.abs(this.position.x - game.player.position.x) + Math.abs(this.position.y - game.player.position.y)) < this.minfromplayer);
	}

	findPath() {
		if(this.state === 'move') {
			let angle = Math.atan2(game.player.position.y - this.position.y, game.player.position.x - this.position.x);
			this.speed.x = cos(angle) * 2;
			this.speed.y = sin(angle) * 2;
		} else {
			this.gun.fireBullet();
			this.speed.mult(0);
		}
	}

	checkBulletCollision() {
		for(let bullet of game.bullets) {
			if(bullet.isColliding(this) && !(bullet.parent.parent instanceof Enemy) ) {
				this.takeDamage(bullet.damage);
				game.bullets.remove(bullet);
			}
		}
	}
}

class Gun {
	constructor(maxBullets, reloadTime, fireRate, bulletSpeed, parent) {
		this.maxBullets = maxBullets;
		this.currentBullets = maxBullets;
		this.reloadTime = reloadTime;
		this.fireRate = fireRate;
		this.bulletSpeed = bulletSpeed;

		this.state = 'normal';
		this.parent = parent;

	}

	fireBullet() {
		if(this.currentBullets > 0 && this.state === 'normal') {
			this.currentBullets--;
			game.bullets.push(game.createBullet(this.parent.position.x, this.parent.position.y, this, this.bulletSpeed));
			this.state = 'fire';
			setTimeout(() => {
				if(this.state !== 'reload') {
					this.state = 'normal';
				}
			}, this.fireRate);
		} else if(this.state !== 'fire') {
			this.reload();
		}
	}

	reload() {
		if(this.state !== 'reload' && !(this.currentBullets === this.maxBullets)) {
			this.state = 'reload';
			this.parent.state = 'reload';
			setTimeout(() => {
					this.state = 'normal';
					this.parent.state = 'move';
					this.currentBullets = this.maxBullets;
			}, this.reloadTime)
		}
	}
}

class Bullet extends Sprite {
	constructor(x, y, parent, _speed) {
		super(x, y, true, ['characters', 'weapon_gun.png']);
		this.parent = parent;
		if(this.parent.parent instanceof Player) {
			this.angle = Math.atan2(mouseY - this.position.y, mouseX - this.position.x);
		} else if(this.parent.parent instanceof Enemy) {
			this.angle = Math.atan2(game.player.position.y - this.position.y, game.player.position.x - this.position.x);
		}
		this.speed = createVector(cos(this.angle) * _speed, sin(this.angle) * _speed);
		this.damage = 1;
	}

	display() {
		push();
		translate(this.position.x, this.position.y);
		imageMode(CENTER);
		rotate(this.angle);
		image(game.spritesheets[this.image[0]].spritesheet, game.spritesheets[this.image[0]].xml[this.image[1]].x, game.spritesheets[this.image[0]].xml[this.image[1]].y, game.spritesheets[this.image[0]].xml[this.image[1]].width, game.spritesheets[this.image[0]].xml[this.image[1]].height, 0, 0, game.spritesheets[this.image[0]].xml[this.image[1]].width, game.spritesheets[this.image[0]].xml[this.image[1]].height);
		pop();
	}
}

class Group extends Array {
	display() {
		this.forEach((s) =>{s.display()});
	}
	update() {
		this.forEach((s) => {s.update()});
	}
	add(s) {
		if(s instanceof Sprite) {
			this.push(s);
		}
	}
	remove(s) {
		this.splice(this.indexOf(s), 1);
	}
}

let game;

function setup() {
	createCanvas(windowWidth, windowHeight);
}

function draw() {
	clear();
	START_BLOCK('gameLoop');
	game.update();
	game.display();
	END_BLOCK('gameLoop');
	if(game.debug) drawTable();
}


function mousePressed() {
	if(game.state === 'inLevel') {
		game.player.handleMousePress();
	}
}

function keyPressed() {
	switch(keyCode) {
		case 37:
		case 38:
		case 39:
		case 40:
		case 87:
		case 83:
		case 65:
		case 68:
			game.player.handleKeyPress(keyCode, false);
			break;
        case 192:
            game.debug = (game.debug === true) ? false : true; 
            break;
		case 82:
			game.player.gun.reload();
			break;
		case 27:
			if(game.debug) takeSnapshot();
			break;
    }
}

function keyReleased() {
	switch(keyCode) {
		case 37:
		case 38:
		case 39:
		case 40:
		case 87:
		case 83:
		case 65:
		case 68:
			game.player.handleKeyPress(keyCode, true);
			break;
	}
}
