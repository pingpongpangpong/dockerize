import * as THREE from "three";
import { Player } from "./player.js";
import { Ball } from "./ball.js";
import { UI } from "./ui.js";
import { lang, langIndex } from "./lang.js";
import { local } from "./content.js";

export class Game {
	constructor() {
		this.role = 'NONE';
		this.status = 'NONE';
		this.scoreChanged = false;

		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.renderer.setSize(800, 600);

		content.appendChild(this.renderer.domElement);

		this.light = new THREE.PointLight(0xffffff, 500);
		this.light.position.set(0, 0, 10);
		this.scene.add(this.light);

		this.camera.position.set(0, 0, 5);
		this.gamePoint = 10;
	}

	async init() {
		this.player1 = new Player(-4.5, 0, "w", "s", 0xFF2135);
		this.player2 = new Player(4.5, 0, "ArrowUp", "ArrowDown", 0x1AAACF);
		this.ball = new Ball();
		this.ui = new UI();

		this.scene.add(this.player1.mesh);
		this.scene.add(this.player2.mesh);
		this.scene.add(this.ball.mesh);
		await this.ui.loadFont();
		await this.createScoreMeshes();

		this.player1.listenEvent();
		this.player2.listenEvent();
		
		const pointInput = document.querySelector("#point").querySelector("input");
		window.addEventListener("keydown", (e) => {
			if (e.key === "Escape") {
				local();
			} else if (e.key === " " && pointInput.value > 0) {
				this.gamePoint = pointInput.value;
			}
		});
		
		this.ball.listenEvent();
	}

	async initHost() {
		this.player1 = new Player(-4.5, 0, "ArrowUp", "ArrowDown", 0xFF2135);
		this.player2 = new Player(4.5, 0, "", "", 0x1AAACF);
		this.ball = new Ball();
		this.ui = new UI();

		this.scene.add(this.player1.mesh);
		this.scene.add(this.player2.mesh);
		this.scene.add(this.ball.mesh);
		await this.ui.loadFont();
		await this.createScoreMeshes();

		this.player1.listenEvent();
		
		const pointInput = document.querySelector("#point").querySelector("input");
		window.addEventListener("keydown", (e) => {
			if (e.key === " " && pointInput.value > 0) {
				this.gamePoint = pointInput.value;
			}
		});
		
		this.ball.listenEvent();
	}

	async initClient() {
		this.player1 = new Player(-4.5, 0, "", "", 0xFF2135);
		this.player2 = new Player(4.5, 0, "", "", 0x1AAACF);
		this.ball = new Ball();
		this.ui = new UI();

		this.scene.add(this.player1.mesh);
		this.scene.add(this.player2.mesh);
		this.scene.add(this.ball.mesh);
		await this.ui.loadFont();
		await this.createScoreMeshes();
		
		const pointInput = document.querySelector("#point").querySelector("input");
		window.addEventListener("keydown", (e) => {
			if (e.key === " " && pointInput.value > 0) {
				this.gamePoint = pointInput.value;
			}
		});
	}

	async createScoreMeshes() {
		const { score1Mesh, score2Mesh } = await this.ui.createScoreMeshes(this.player1.score, this.player2.score);
		this.score1Mesh = score1Mesh;
		this.score2Mesh = score2Mesh;
		this.scene.add(this.score1Mesh);
		this.scene.add(this.score2Mesh);
	}

	game() {
		let lastTime = performance.now();
		const animate = (currentTime) => {
			requestAnimationFrame(animate);
			const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
			lastTime = currentTime;
			this.player1.move(deltaTime);
			this.player2.move(deltaTime);
			if (this.ball.isStart && !this.ball.isReady) {
				this.scoreChanged = this.ball.move([this.player1, this.player2], deltaTime);
				if (this.scoreChanged) {
					this.updateUI();
				}
			}
			if (this.player1.score >= this.gamePoint || this.player2.score >= this.gamePoint) {
				this.ball.isStart = false;
				this.ball.isReady = true;
				this.ball.reset();
				this.scoreChanged = true;
				this.player1.score = 0;
				this.player2.score = 0;
				this.updateUI();
			}
			this.renderer.render(this.scene, this.camera);
		};
		animate(0);
	}

	gameHost(wsocket) {
		let lastTime = performance.now();
		const animate = (currentTime) => {
			requestAnimationFrame(animate);
			const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
			lastTime = currentTime;
			this.player1.move(deltaTime);
			this.player2.move(deltaTime);
			if (this.ball.isStart && !this.ball.isReady) {
				this.scoreChanged = this.ball.move([this.player1, this.player2], deltaTime);
				if (this.scoreChanged) {
					this.updateUI();
				}
			}
			if (this.player1.score >= this.gamePoint || this.player2.score >= this.gamePoint) {
				this.ball.isStart = false;
				this.ball.isReady = true;
				this.scoreChanged = true;
				this.ball.reset();
				this.player1.score = 0;
				this.player2.score = 0;
				this.updateUI();
				wsocket.send(JSON.stringify({
					'msgType': 'FINISH'
				}));
			}
			wsocket.send(JSON.stringify({
				'msgType': 'SYNC',
				'player1': {
					'x': this.player1.mesh.position.x,
					'y': this.player1.mesh.position.y,
					'score': this.player1.score
				},
				'player2': {
					'x': this.player2.mesh.position.x,
					'y': this.player2.mesh.position.y,
					'score': this.player2.score
				},
				'ball': {
					'x': this.ball.mesh.position.x,
					'y': this.ball.mesh.position.y
				},
				'scoreChanged': String(this.scoreChanged)
			}));
			this.renderer.render(this.scene, this.camera);
		};
		animate(0);
	}

	gameClient(wsocket) {
		let lastTime = performance.now();
		window.addEventListener("keyup", (e) => {
			if (e.key === "ArrowUp") {
				this.player2.keyboard.up = false;
			} else if (e.key === "ArrowDown") {
				this.player2.keyboard.down = false;
			}
			wsocket.send(JSON.stringify({
				'msgType': 'INPUT',
				'keyboardUp': String(this.player2.keyboard.up),
				'keyboardDown': String(this.player2.keyboard.down)
			}));
		});
		window.addEventListener("keydown", (e) => {
			if (e.key === "ArrowUp") {
				this.player2.keyboard.up = true;
			} else if (e.key === "ArrowDown") {
				this.player2.keyboard.down = true;
			}
			wsocket.send(JSON.stringify({
				'msgType': 'INPUT',
				'keyboardUp': String(this.player2.keyboard.up),
				'keyboardDown': String(this.player2.keyboard.down)
			}));
		});
		const animate = (currentTime) => {
			requestAnimationFrame(animate);
			lastTime = currentTime;
			if (this.scoreChanged) {
				this.updateUI();
			}
			this.renderer.render(this.scene, this.camera);
		};
		animate(0);
	}

	updateUI() {
		this.ui.updateScoreMesh(this.score1Mesh, this.player1.score);
		this.ui.updateScoreMesh(this.score2Mesh, this.player2.score);
	}
}
