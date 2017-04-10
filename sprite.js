class Sprite {
	constructor(x, y, _ofskill, image) {
		/*_ofskill*/
		this.ofskill = _ofskill || false;
		this.position = createVector(x, y);
		this.speed = createVector(0, 0);
		this.image = image;
	}

	update() {
		if(this.ofskill) this.killOffScreen();
		this.position.add(this.speed);
	}

	display() {
		push();
		translate(this.position.x, this.position.y);
		image(game.spritesheets[this.image[0]].spritesheet, game.spritesheets[this.image[0]].xml[this.image[1]].x, game.spritesheets[this.image[0]].xml[this.image[1]].y, game.spritesheets[this.image[0]].xml[this.image[1]].width, game.spritesheets[this.image[0]].xml[this.image[1]].height, 0, 0, game.spritesheets[this.image[0]].xml[this.image[1]].width, game.spritesheets[this.image[0]].xml[this.image[1]].height);
		pop();
	}

	killOffScreen() {
		if(this.position.x > width + this.image.width || this.position.x < -1 * this.image.width) {
			game.sprites.remove(this);
		}
		if(this.position.y > height + this.image.height || this.position.y < -1 * this.image.height) {
			game.sprites.remove(this);
		}
	}

	isColliding(s) {
		return (   this.position.x < s.position.x + game.spritesheets[s.image[0]].xml[s.image[1]].width 
				&& this.position.x + game.spritesheets[this.image[0]].xml[this.image[1]].width > s.position.x 
				&& this.position.y < s.position.y + game.spritesheets[s.image[0]].xml[s.image[1]].height
				&& this.position.y + game.spritesheets[this.image[0]].xml[this.image[1]].height > s.position.y
			   )
	}

	isCollidingGroup(g) {
		return g.filter((s) => {
			return this.isColliding(s);
		});
	}
}