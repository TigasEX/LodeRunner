
// GLOBAL VARIABLES
// tente não definir mais nenhuma variável global

let empty, hero, control;


// ACTORS

class Actor {
	constructor(x, y, imageName) {
		this.x = x;
		this.y = y;
		this.imageName = imageName;
		this.show();
	}
	draw(x, y) {
		control.ctx.drawImage(GameImages[this.imageName],
				x * ACTOR_PIXELS_X, y* ACTOR_PIXELS_Y);
	}
	move(dx, dy) {
		this.hide();
		this.x += dx;
		this.y += dy;
		this.show();
	}
	
	isSolid(){return false;}
	
	changeImage(newImage) {
		this.imageName = newImage;
	}
}

class PassiveActor extends Actor {
	show() {
		control.world[this.x][this.y] = this;
		this.draw(this.x, this.y);
	}
	hide() {
		control.world[this.x][this.y] = empty;
		empty.draw(this.x, this.y);
	}
	
	isInvisibleLadder(){return false;}
	
	//Define se pode servir de chão e parede

	
	isWalkable(){return false;}
	
	isDestroyable(){return false;}
	
	isClimbable(){return false;}
	
	canSupport(){return false;}
	
	isValuable(){return false;}
	
	isRequired(){return false;}
	
	isRope(){return false;}
	
	isChimney(){return false;}

}

class ActiveActor extends Actor {
	constructor(x, y, imageName) {
		super(x, y, imageName);
		this.time = 0;	// timestamp used in the control of the animations
		this.speed = 5; // quanto menos melhor
		this.timeToUnstuck = 30;
	}
	show() {
		control.worldActive[this.x][this.y] = this;
		this.draw(this.x, this.y);
	}
	hide() {
		control.worldActive[this.x][this.y] = empty;
		control.world[this.x][this.y].draw(this.x, this.y);
	}
	
	isStuck() {
		if(this.y+1 == WORLD_HEIGHT) {
				this.timeToUnstuck = this.timeToUnstuck -1;
		if(this.timeToUnstuck == 0 && 
		!(control.worldActive[this.x][this.y - 1] instanceof Hero) && 
		!this.isGood())
			this.unstuck();
		return true;
		} else {
			if(this.y+1 != WORLD_HEIGHT) {
		if(control.worldActive[this.x][this.y+1].isWalkable() && 
		control.worldActive[this.x+1][this.y].isSolid()
		&& control.worldActive[this.x-1][this.y].isSolid()) {
		this.timeToUnstuck = this.timeToUnstuck -1;
		if(this.timeToUnstuck == 0 && 
		control.worldActive[this.x][this.y - 1].isGood() && !this.isGood())
			this.unstuck();
		return true;
		}
		}
		}
		return false;
	}
	
	isAirborne() {
		return !control.world[this.x][this.y+1].isWalkable() && 
		!(control.worldActive[this.x][this.y+1] instanceof Robot) && 
		!control.world[this.x][this.y+1].isWalkable();
	}
	
	canUnstuck() {
	if(this.timeToUnstuck == 0) return true; else false;
	}
	
	unstuck() { 
	this.move(0, -1);
	control.world[this.x][this.y + 1].undestroy();
	this.timeToUnstuck = 30;
	}
	
	isGood(){
		return false;
	}
	
	isWalkable() { if (this.isStuck()) return true; else false; }
	
	animation(newImage) {
		this.changeImage(newImage);	
	}
	
	isFiring() {
		if(0 == this.imageName.localeCompare("hero_shoots_left") || 
		0 == this.imageName.localeCompare("hero_shoots_right")) return true;
		else return false;
	}
	
	//Apenas na escada
	canMoveUp() {
		if(this.y == 0) return false;
		return !control.world[this.x][this.y-1].isSolid() && 
		!control.worldActive[this.x][this.y-1].isSolid() && 
		control.world[this.x][this.y].isClimbable();
	}
	
	//Sempre que não haja nada sólido por baixo
	canMoveDown() {
		if(this.y == WORLD_HEIGHT-1) return false;
		return !control.world[this.x][this.y+1].isSolid() && 
		!control.world[this.x][this.y+1].isChimney() && 
		!control.worldActive[this.x][this.y+1].isSolid();
	}
	
	//Escada, Corda, tem chão
	canMoveLeft(){
		if(this.x == 0) return false;
		return !control.world[this.x-1][this.y].isSolid() && 
		!control.worldActive[this.x-1][this.y].isSolid() 
		&& (control.world[this.x][this.y].canSupport() 
		|| (control.worldActive[this.x][this.y+1] instanceof Robot) 
		|| control.world[this.x][this.y+1].isWalkable());
	}
	
	canMoveRight(){
		if(this.x == WORLD_WIDTH-1) return false;
		return !control.world[this.x+1][this.y].isSolid() && 
		!control.worldActive[this.x+1][this.y].isSolid() 
		&& (control.world[this.x][this.y].canSupport() || 
		(control.worldActive[this.x][this.y+1] instanceof Robot) || 
		control.world[this.x][this.y+1].isWalkable());
	}
	
	isLookingLeft() {
		if(0 == this.imageName.localeCompare("hero_falls_left") || 
		0 == this.imageName.localeCompare("hero_on_ladder_left")
			|| 0 == this.imageName.localeCompare("hero_on_rope_left") || 
			0 == this.imageName.localeCompare("hero_runs_left")
			|| 0 == this.imageName.localeCompare("hero_shoots_left") || 
			0 == this.imageName.localeCompare("robot_falls_left")
			|| 0 == this.imageName.localeCompare("robot_on_ladder_left") || 
			0 == this.imageName.localeCompare("robot_on_rope_left")
			|| 0 == this.imageName.localeCompare("robot_runs_left")) 
			return true;
	}
	
	ifIsOnLadder() {
		if(0 == this.imageName.localeCompare("hero_on_ladder_left") || 
		0 == this.imageName.localeCompare("hero_on_ladder_right")
			|| 0 == this.imageName.localeCompare("robot_on_ladder_left") || 
			0 == this.imageName.localeCompare("robot_on_ladder_right")) 
			return true;
	}
	
	ifIsOnRope() {
		if(0 == this.imageName.localeCompare("hero_on_rope_left") || 
		0 == this.imageName.localeCompare("hero_on_rope_right")
			|| 0 == this.imageName.localeCompare("robot_on_rope_left") || 
			0 == this.imageName.localeCompare("robot_on_rope_right")) 
			return true;
	}
	
	catchGold(){
		
	}
}

class Brick extends PassiveActor {
	constructor(x, y) { super(x, y, "brick"); 
	this.destroyed = false;
	}
	
	
	isSolid(){if(!this.destroyed)return true; else return false;}
	
	isWalkable(){if(!this.destroyed)return true; else return false;}
	
	destroy() { this.imageName = "empty"; this.destroyed = true; 
	this.show(); }
	
	undestroy() { this.imageName = "brick"; this.destroyed = false; 
	this.show(); }
	
	isDestroyable(){return true;}
	
}
// não percebo bem para q e q a chamine serve
class Chimney extends PassiveActor {
	constructor(x, y) { super(x, y, "chimney"); }
	isSolid(){return true;}
	isChimney() { return true;}
}

class Empty extends PassiveActor {
	constructor() { super(-1, -1, "empty"); }
	show() {}
	hide() {}
}

class Gold extends PassiveActor {
	constructor(x, y) { super(x, y, "gold"); 
	}

	getCatched(){
		control.world[this.x][this.y] = empty;
	}
	
	getDropped(droppedX, droppedY){
		this.x = droppedX;
		this.y = droppedY;
		control.world[this.x][this.y] = this;
	}
	
	isValuable(){
		return true;
	}
	
	isRequired(){
		return true;
	}
	
	getScoreBonus(){
		return 200;
	}
}

class Invalid extends PassiveActor {
	constructor(x, y) { super(x, y, "invalid"); }
}

class Ladder extends PassiveActor {
	constructor(x, y) {
		super(x, y, "empty");
	}
	makeVisible() {
		this.imageName = "ladder";
		this.show();
	}
	
	isInvisibleLadder(){
		return this.imageName === "empty";
		}
	
	isWalkable(){return true;}
	
	isClimbable(){return true;}
	
	canSupport(){return true;}
	
}

class Rope extends PassiveActor {
	constructor(x, y) { super(x, y, "rope"); }
	
	canSupport(){return true;}
	
	isRope() {return true;}	
}

class Stone extends PassiveActor {
	constructor(x, y) { super(x, y, "stone"); }
	
	isSolid(){return true;}
	
	isWalkable(){return true;}
}

class Hero extends ActiveActor {
	constructor(x, y) {
		super(x, y, "hero_runs_left");
	}
	
	
	isGood(){
		return true;
	}
	
	fire() {
		if((!this.isLookingLeft() && 
		control.world[this.x+1][this.y+1] instanceof Brick) 
			|| (this.isLookingLeft() && 
			control.world[this.x-1][this.y+1] instanceof Brick))
			if(this.isLookingLeft()) { 
			control.world[this.x-1][this.y+1].destroy();}
			else { control.world[this.x+1][this.y+1].destroy();}
	}
		
	animation() {
		let k = control.getKey();
		
		if(this.isStuck()) {
			if(this.isLookingLeft()) 
				this.changeImage("hero_falls_left");
			else this.changeImage("hero_falls_right");
		} else {	
		
		if(this.isAirborne() && !this.ifIsOnRope()) {
			if(control.world[this.x][this.y+1].isRope()) {
				if(this.isLookingLeft()) 
					this.changeImage("hero_on_rope_left");
				else this.changeImage("hero_on_rope_right");
			}
			if(this.isLookingLeft()) 
				this.changeImage("hero_falls_left");
			else this.changeImage("hero_falls_right");
			this.move(0,1);
		} else {
		
		if(k!= null) {
			
			let [dx, dy] = k;
			if( dx == 2 && dy == 2) {
				if(this.isLookingLeft()) 
					this.changeImage("hero_shoots_left");
				else this.changeImage("hero_shoots_right");
				this.fire();
				this.show();
			} else {
			
			if(dy == 1 && !this.canMoveDown()) dy=0;
			if(dy == -1 && !this.canMoveUp() || 
			control.world[this.x][this.y].isInvisibleLadder()) dy=0;
			if(dx == 1 && !this.canMoveRight())	dx=0;
			if(dx == -1 && !this.canMoveLeft()) dx=0;
			
			if(dx == 0 && dy == 1 && this.ifIsOnRope()) {
				if(this.isLookingLeft()) 
					this.changeImage("hero_falls_left");
				else this.changeImage("hero_falls_right");
			}
			if(dx == 0 && dy == 1) {
				if(!control.world[this.x][this.y+dy].isClimbable()) {
						if(this.isLookingLeft()) 
							this.changeImage("hero_falls_left");
						else this.changeImage("hero_falls_right");
				} else {
					if(this.isLookingLeft()) 
						this.changeImage("hero_on_ladder_right");
						else this.changeImage("hero_on_ladder_left");
				}
				this.move(0,1);
				if(control.world[this.x][this.y].isWalkable() && 
				control.world[this.x][this.y].isSolid())
					if(this.isLookingLeft()) 
						this.changeImage("hero_runs_left");
					else this.changeImage("hero_runs_right");
			}
			if(dx == 0 && dy == -1) {
				if(this.isLookingLeft()) 
					this.changeImage("hero_on_ladder_right");
				else this.changeImage("hero_on_ladder_left");
				this.move(0,dy);
				if(!control.world[this.x][this.y].isClimbable())
					if(this.isLookingLeft()) 
						this.changeImage("hero_runs_left");
					else this.changeImage("hero_runs_right");	
			}
			if(dx != 0 && dy == 0) {
				if(!control.world[this.x+dx][this.y].isRope()) {
						if(dx != 1) this.changeImage("hero_runs_left");
						else this.changeImage("hero_runs_right");
				}else
					if(dx != 1) this.changeImage("hero_on_rope_left");
					else this.changeImage("hero_on_rope_right");
				this.move(dx, dy);
			}
		}
		}
		}
		if(control.worldActive[this.x][this.y] instanceof Hero) {
	if(this.y+1 != WORLD_HEIGHT && !this.isFiring()) {
	if((control.world[this.x][this.y+1].isSolid() && 
	!control.world[this.x][this.y].isRope()) 
		|| (control.world[this.x][this.y+1].isClimbable() && 
		!control.world[this.x][this.y].isRope() && 
		!control.world[this.x][this.y].isClimbable())) {
		if(this.isLookingLeft()) this.changeImage("hero_runs_left");
					else this.changeImage("hero_runs_right");	
					this.show();
	}
	if(control.world[this.x][this.y].isRope()) {
		if(this.isLookingLeft()) this.changeImage("hero_on_rope_left");
					else this.changeImage("hero_on_rope_right");
		this.show();
	}
	let passiveActorUnder = control.world[this.x][this.y];
		if(passiveActorUnder.isValuable()){
			passiveActorUnder.getCatched();
			control.valuableCatchedByHero(passiveActorUnder.getScoreBonus());		
		}
		}
		if(this.ifIsOnLadder()){
			if(control.canEnd()) {
				let [endX, endY] = control.levelEndCoordinates;
				if(this.x == endX && this.y == endY)
					control.nextLevel(true);
			}
		}
		}
		}
	}
	
	catchValuable(){
		control.updateValuablesSituation();
	}
}

class Robot extends ActiveActor {
	constructor(x, y) {
		super(x, y, "robot_runs_right");
		this.carryingValuable = false;
		this.dropTimer=0;
		this.itemCarried;
		this.gold = false;
	  }
	  
	isSolid(){
		return true;
	}
	 
	distanceSEMARREDONDAMENTO(x1, y1, x2, y2) {
		let distx = Math.abs(x1 - x2);
		let disty = Math.abs(y1 - y2);
		return Math.sqrt(distx*distx + disty*disty);
	}
	animation(){
		
			
			
			
		if(this.isStuck()) {
			if(this.gold) {
				control.world[this.x][this.y-1] = new Gold(this.x, this.y-1);
				this.gold = false;
			}
		}else {
		//procurar alvo
		let target;
		for(let x=0 ; x < WORLD_WIDTH ; x++)
			for(let y=0 ; y < WORLD_HEIGHT ; y++) {
				let nextActive = control.worldActive[x][y];
				if(nextActive != empty){
					if(nextActive.isGood()) target = nextActive;
				}
			}
		
		if(target !== undefined){
		
			let minorDistance = distance(this.x, this.y, target.x, target.y);
			let minorDistanceDirection = [0.0,0.0];
			let optionDistance;
		
			if((control.worldActive[this.x][this.y+1].isSolid() && 
			!(control.worldActive[this.x][this.y+1] instanceof Hero)) 
			|| control.world[this.x][this.y+1].isWalkable() 
			|| control.world[this.x][this.y].canSupport()){
				//delay do inimigo para n ter a mesma velocidade q o heroi
				this.time+=2
			
				if(this.canMoveDown()){
					optionDistance = 
					this.distanceSEMARREDONDAMENTO(this.x,this.y+1, 
					target.x, target.y);
					if( optionDistance < minorDistance){
						minorDistance = optionDistance;
						minorDistanceDirection = [0,1]
					}
				}
		
				if(this.canMoveUp()){
					optionDistance = 
					this.distanceSEMARREDONDAMENTO(this.x,this.y-1, 
					target.x, target.y);
					if( optionDistance < minorDistance){
						minorDistance = optionDistance;
						minorDistanceDirection = [0,-1]
					}
				}
			
				if(this.canMoveLeft()){
					optionDistance = this.distanceSEMARREDONDAMENTO(this.x-1,
					this.y, target.x, target.y);
					if( optionDistance < minorDistance){
						minorDistance = optionDistance;
						minorDistanceDirection = [-1,0]
					}
				}
			
				if(this.canMoveRight()){
					optionDistance = this.distanceSEMARREDONDAMENTO(this.x+1,
					this.y, target.x, target.y);
					if( optionDistance < minorDistance){
						minorDistance = optionDistance;
						minorDistanceDirection = [1,0]
					}
				}
				
				let passiveActorUnder = control.world[this.x + 
				minorDistanceDirection[0]]
				[this.y + minorDistanceDirection[1]];
			
			
				if(minorDistanceDirection[0] == -1 ||
				minorDistanceDirection[1] == 1) {
				if(passiveActorUnder.isWalkable()) {
					if(this.isLookingLeft()) 
						this.changeImage("robot_falls_left");
					else this.changeImage("robot_falls_right");
				}
				else {
					if(this.isLookingLeft()) 
						this.changeImage("robot_runs_left");
					else this.changeImage("robot_runs_right");
				}
				}
			
				if(minorDistanceDirection[0] == -1){
				if(passiveActorUnder.isRope())  
					this.changeImage("robot_on_rope_left");
				else this.changeImage("robot_runs_left");
				}
				if(minorDistanceDirection[0] == 1) {
				if(passiveActorUnder.isRope())  
					this.changeImage("robot_on_rope_right");
				else this.changeImage("robot_runs_right");
				}
				if(passiveActorUnder.isClimbable() && 
				!control.world[this.x + 
				minorDistanceDirection[0]][this.y].isInvisibleLadder()){
				if(this.isLookingLeft()) 
					this.changeImage("robot_on_ladder_right");
				else this.changeImage("robot_on_ladder_left");
				}
				
				this.move(minorDistanceDirection[0], 
				minorDistanceDirection[1]);
			
				} else {
					if(!(control.worldActive[this.x][this.y+1]
					instanceof Robot)) {
					if(this.isLookingLeft()) 
						this.changeImage("robot_falls_left");
					else this.changeImage("robot_falls_right");
					this.move(0,1);
					}
					}
		
			}
		}
		let passiveActorUnder = control.world[this.x][this.y];
		if(passiveActorUnder.isValuable() && !this.gold){
			passiveActorUnder.getCatched();
			control.valuableCatchedByRobot();	
			this.gold = true;
		}
		}
}


// GAME CONTROL

class GameControl {
	constructor() {
		control = this;
		this.levelEndCoordinates = [-1,-1];
		this.currLevel=1;
		this.key = 0;
		this.time = 0;
		this.target;
		this.timer = 100;
		this.score = 0;
		this.requirementsLeft = 0;
		this.ctx = document.getElementById("canvas1").getContext("2d");
		empty = new Empty();	// only one empty actor needed
		this.world = this.createMatrix();
		this.worldActive = this.createMatrix();
		this.loadLevel(this.currLevel);
		this.setupEvents();
		

	}
	createMatrix() { // stored by columns
		let matrix = new Array(WORLD_WIDTH);
		for( let x = 0 ; x < WORLD_WIDTH ; x++ ) {
			let a = new Array(WORLD_HEIGHT);
			for( let y = 0 ; y < WORLD_HEIGHT ; y++ )
				a[y] = empty;
			matrix[x] = a;
		}
		return matrix;
	}
	
	loadLevel(level) {
		if( level < 1 || level > MAPS.length )
			fatalError("Invalid level " + level)
		let map = MAPS[level-1];  // -1 because levels start at 1
		for(let x=0 ; x < WORLD_WIDTH ; x++)
			for(let y=0 ; y < WORLD_HEIGHT ; y++) {
					// x/y reversed because map stored by lines
				GameFactory.actorFromCode(map[y][x], x, y);
			}
		
		for(let x=0 ; x < WORLD_WIDTH ; x++)
			for(let y=0 ; y < WORLD_HEIGHT ; y++) {
				 if(control.world[x][y].isRequired()) this.requirementsLeft++;
			}
	}
			
	unloadLevel() {
		for(let x=0 ; x < WORLD_WIDTH ; x++)
			for(let y=0 ; y < WORLD_HEIGHT ; y++) {
					// x/y reversed because map stored by lines
				this.world[x][y].hide();
				this.worldActive[x][y].hide();
			}
			
		this.levelEndCoordinates = [-1,-1];
	}
	getKey() {
		let k = control.key;
		control.key = 0;
		switch( k ) {
			case 37: case 79: case 74: return [-1, 0]; //  LEFT, O, J
			case 38: case 81: case 73: return [0, -1]; //    UP, Q, I
			case 39: case 80: case 76: return [1, 0];  // RIGHT, P, L
			case 40: case 65: case 75: return [0, 1];  //  DOWN, A, K
			case 70: return [2, 2]; // FIRE (F)
			case 0: return null;
			default: return String.fromCharCode(k);
// http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
		};	
	}
	setupEvents() {
		this.timer = this.timer - 1;
		addEventListener("keydown", this.keyDownEvent, false);
		addEventListener("keyup", this.keyUpEvent, false);
		setInterval(this.animationEvent, 1000 / 
		ANIMATION_EVENTS_PER_SECOND);
	}
	animationEvent() {
		control.time++;
		for(let x=0 ; x < WORLD_WIDTH ; x++)
			for(let y=0 ; y < WORLD_HEIGHT ; y++) {
				let a = control.worldActive[x][y];
				if( a.time < control.time ) {
					a.time = control.time;
					a.animation();
				}
			}
	}
	keyDownEvent(k) {
		control.key = k.keyCode;
	}
	keyUpEvent(k) {
	}
	
	valuableCatchedByRobot() {
	}
	
	valuableCatchedByHero(scoreBonus){
		this.score += scoreBonus;
		updateScore();
		console.log(this.score);
		this.requirementsLeft--;

			
		if(this.requirementsLeft == 0){
			let highestInvisibleLadderCoordinates = [-1,WORLD_HEIGHT];
			for(let x=0 ; x < WORLD_WIDTH ; x++)
				for(let y=0 ; y < WORLD_HEIGHT ; y++) {
					let nextPassiveActor = control.world[x][y];
					if(nextPassiveActor.isInvisibleLadder()){
						if(nextPassiveActor.y < 
						highestInvisibleLadderCoordinates[1]){ 
						//y mais altos são posicoes mais baixas
			highestInvisibleLadderCoordinates[0] = nextPassiveActor.x;
			highestInvisibleLadderCoordinates[1] = nextPassiveActor.y;						
						}
						nextPassiveActor.makeVisible();
					}
				}
			this.levelEndCoordinates = highestInvisibleLadderCoordinates;
		}
	}

	canEnd() { if(this.requirementsLeft == 0) 
		return true; else return false; }
	
	nextLevel(legit){
		this.unloadLevel();
		if(legit) {
			this.score = this.score + 300;
			updateScore();
		}
		if(this.currLevel==16) {
			end();
			this.currLevel = 0;
			this.loadLevel(++this.currLevel);
			updateLevel();
		} else {
		this.loadLevel(++this.currLevel);
		updateLevel();
		}
	}
	
	restartLevel(){
		this.unloadLevel();
		this.loadLevel(this.currLevel);
	}
	
	restartGame() {
		this.currLevel=1;
		this.score = 0;
		updateScore();
		this.time = 0;
		this.unloadLevel();
		this.loadLevel(this.currLevel);
		updateLevel();
	}
}


// HTML FORM

function onLoad() {
  // Asynchronously load the images an then run the game
	GameImages.loadAll(function() { new GameControl(); });
}

function b1() { control.restartGame(); }
function b2() { control.restartLevel(); }
function b3() { control.nextLevel(false); }
function updateLevel() { 
var updatedMessage = "Level = " + control.currLevel;
document.getElementById("currLevel").innerHTML = updatedMessage;
}
function updateScore() { 
var updatedMessage = "Score = " + control.score;
document.getElementById("score").innerHTML = updatedMessage;
}
function end() {
  var updatedMessage = "Congrats, you finished, the game!";
document.getElementById("end").innerHTML = updatedMessage;
}



