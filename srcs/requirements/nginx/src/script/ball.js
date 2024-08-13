import * as THREE from "three";

export class Ball {
	constructor() {
		const geometry = new THREE.SphereGeometry(0.1, 32, 16);
		const material = new THREE.MeshPhysicalMaterial({ color:0xFFE400 });
		this.mesh = new THREE.Mesh(geometry, material);

		const random = Math.random() * 2 - 1;
		const direction = random > 0 ? 1 : -1;
		this.isStart = false;
		this.reset(direction);

	}

	reset(direction) {
		const randomY = Math.random() * 6.6 - 3.3;
		this.mesh.position.set(0, randomY, 0);

		const angles = [45, 315, 135, 225];
		let index = Math.floor(Math.random() * 2);
		if (direction > 0) {
			index += 2;
		}
		const selectedAngle = angles[index];
		const angleInRadians = selectedAngle * Math.PI / 180;

		const speed = 0.3;
		this.velocity = new THREE.Vector3(
			Math.cos(angleInRadians) * speed,
			Math.sin(angleInRadians) * speed,
			0
		);
		this.isReady = true;
	}

	listenEvent() {
		const input = document.querySelector("#point").querySelector("input");
		window.addEventListener("keydown", (e) => {
			if (e.key === " ") {
				if (!this.isStart && input.value > 0) {
					this.isStart = true;
				}
				if (this.isReady) {
					this.isReady = false;
				}
			}
		});
	}

	move(players, deltatime) {
		const maxX = 7;
		const maxY = 3.5;
		const speed = 30;
		this.mesh.position.add(this.velocity.clone().multiplyScalar(speed * deltatime));
		if (Math.abs(this.mesh.position.x) > maxX) {
			let direction = 1;
			if (this.mesh.position.x < 0) {
				direction = -1;
				players[0].score++;
			} else {
				players[1].score++;
			}
			this.reset(direction);
			return true;
		}
		if (Math.abs(this.mesh.position.y) > maxY) {
			this.velocity.y *= -1;
			this.mesh.position.y = Math.sign(this.mesh.position.y) * maxY;
		}
		players.forEach(player => this.checkCollisionWithPlayer(player));
	}

	checkCollisionWithPlayer(player) {
		const radius = 0.1;
		const box = player.getBoundingBox();
		if (this.mesh.position.x - radius < box.maxX && 
			this.mesh.position.x + radius > box.minX && 
			this.mesh.position.y + radius > box.minY && 
			this.mesh.position.y - radius < box.maxY) {
			this.velocity.x *= -1;
			if (this.velocity.x > 0) {
				this.mesh.position.x = box.maxX + radius;
			} else {
				this.mesh.position.x = box.minX - radius;
			}
			const hitPoint = (this.mesh.position.y - player.mesh.position.y) / (box.maxY - box.minY);
			this.velocity.y = hitPoint * 1;
			const currentSpeed = this.velocity.length();
			this.velocity.normalize().multiplyScalar(currentSpeed);
		}
	}
}