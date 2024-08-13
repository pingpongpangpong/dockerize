import * as THREE from "three";

export class Player {
	name = "";
	constructor(x, y, up, down, color) {
		const geometry = new THREE.BoxGeometry(0.1, 0.8, 0.1);
		const material = new THREE.MeshPhysicalMaterial({ color: color });
		this.mesh = new THREE.Mesh(geometry, material);
		this.mesh.position.set(x, y, 0);
		this.up = up;
		this.down = down;
		this.keyboard = {
			up: false,
			down: false
		};
		this.velocity = 0;
		this.maxVelocity = 15;
		this.acceleration = 10;
		this.deceleration = 10;
		this.currentAcceleration = 0;
		this.maxAcceleration = this.acceleration;
		this.accelerationRate = 2;
		this.score = 0;
	}

	listenEvent() {
		window.addEventListener("keydown", (e) => {
			if (e.key === this.up) {
				this.keyboard.up = true;
			} else if (e.key === this.down) {
				this.keyboard.down = true;
			}
		});
		window.addEventListener("keyup", (e) => {
			if (e.key === this.up) {
				this.keyboard.up = false;
			} else if (e.key === this.down) {
				this.keyboard.down = false;
			}
		});
	}

	move(deltaTime) {
		const limit = 3.3;
		if (this.keyboard.up && this.mesh.position.y < limit) {
			this.currentAcceleration = Math.min(this.currentAcceleration + this.accelerationRate * deltaTime, this.maxAcceleration);
			this.velocity = Math.min(this.velocity + this.acceleration, this.maxVelocity);
		} else if (this.keyboard.down && this.mesh.position.y > -limit) {
			this.currentAcceleration = Math.min(this.currentAcceleration + this.accelerationRate * deltaTime, this.maxAcceleration);
			this.velocity = Math.max(this.velocity - this.acceleration, -this.maxVelocity);
		} else if (Math.abs(this.velocity) > 0) {
			this.currentAcceleration = 0;
			this.velocity *= 0.9;
			if (Math.abs(this.velocity) < 0.001) {
				this.velocity = 0;
			}
		}
		this.mesh.position.y += this.velocity * deltaTime;
		if (this.mesh.position.y > limit) {
			this.mesh.position.y = limit;
			this.velocity = 0;
		} else if (this.mesh.position.y < -limit) {
			this.mesh.position.y = -limit;
			this.velocity = 0;
		}
	}

	getBoundingBox() {
		const halfWidth = 0.05;
		const halfHeight = 0.4;
		return {
			minX: this.mesh.position.x - halfWidth,
			maxX: this.mesh.position.x + halfWidth,
			minY: this.mesh.position.y - halfHeight,
			maxY: this.mesh.position.y + halfHeight
		};
	}
}
