import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';
import { Player } from './player.js';
import { Ball } from './ball.js';
import { lang, langIndex } from '../lang.js';
import { fillRoomList } from '../content/feature.js';

const player1Score = document.getElementById('l-player');
const player2Score = document.getElementById('r-player');
const painGamePoint = document.getElementById('show-gp');
let animatedId;
export let winner;

export class Game {
	constructor(gamePoint) {
		this.scene = new THREE.Scene();
		
		this.camera = new THREE.PerspectiveCamera(75, 950 / 600, 0.1, 1000);
		this.camera.position.set(0, 0, 5);

		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize(950, 600);
		this.renderer.domElement.id = 'game';
		document.getElementById('content').appendChild(this.renderer.domElement);

		const light = new THREE.PointLight(0xFFFFFF, 90);
		light.position.set(0, 0, 5);
		this.scene.add(light);
	
		this.gamePoint = gamePoint;
		painGamePoint.innerHTML = '게임 포인트: ' + gamePoint;
		this.scoreChanged = false;
	}
	awakeHost(name1, name2) {
		this.player1 = new Player(-4.8, 0xFF2135, name1, 'ArrowUp', 'ArrowDown');
		this.player2 = new Player(4.8, 0x1AAACF, name2, '', '');
		this.ball = new Ball();

		this.scene.add(this.player1.mesh);
		this.scene.add(this.player2.mesh);
		this.scene.add(this.ball.mesh);

		this.player1.input();
	}

	awakeClient(name1, name2) {
		this.player1 = new Player(-4.8, 0xFF2135, name1, '', '');
		this.player2 = new Player(4.8, 0x1AAACF, name2, '', '');
		this.ball = new Ball();

		this.scene.add(this.player1.mesh);
		this.scene.add(this.player2.mesh);
		this.scene.add(this.ball.mesh);
	}

	awake(name1, name2) {
		this.player1 = new Player(-4.8, 0xFF2135, name1, 'w', 's');
		this.player2 = new Player(4.8, 0x1AAACF, name2, 'ArrowUp', 'ArrowDown');
		this.ball = new Ball();

		this.scene.add(this.player1.mesh);
		this.scene.add(this.player2.mesh);
		this.scene.add(this.ball.mesh);

		this.player1.input();
		this.player2.input();
	}

	updateHost(websocket) {
		this.updateScore();
		let lasttime = performance.now();
		const animate = (currenttime) => {
			const deltatime = Math.min((currenttime - lasttime) / 1000, 0.1);
			lasttime = currenttime;
			this.player1.move(deltatime);
			this.player2.move(deltatime);
			if (this.ball.move(this.player1, this.player2, deltatime)) {
				this.scoreChanged = true;
				this.updateScore();
			}
			if (this.player1.score >= this.gamePoint || this.player2.score >= this.gamePoint) {
				winner = this.player1.score > this.player2.score ? this.player1.name: this.player2.name;
				if (websocket) {
					websocket.send(JSON.stringify({
						'msgType': 'FINISH',
						'winner': winner,
					}));
				}
				fillRoomList(1);
				document.getElementById('online').style.display = 'block';
				websocket.close();
				this.end(winner);
			} else {
				if (websocket) {
					websocket.send(JSON.stringify({
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
					if (this.scoreChanged)
						this.scoreChanged = false;
				}
				animatedId = requestAnimationFrame(animate);
				this.renderer.render(this.scene, this.camera);
			}
		}
		animate(0);
	}

	updateClient() {
		this.updateScore();
		const animate = () => {
			if (this.scoreChanged) {
				this.updateScore();
			}
			animatedId = requestAnimationFrame(animate);
			this.renderer.render(this.scene, this.camera);
		}
		animate();
	}

	update() {
		return new Promise((resolve) => {
			this.updateScore();
			let lasttime = performance.now();
			const animate = (currenttime) => {
				const deltatime = Math.min((currenttime - lasttime) / 1000, 0.1);
				lasttime = currenttime;
				this.player1.move(deltatime);
				this.player2.move(deltatime);
				if (this.ball.move(this.player1, this.player2, deltatime)) {
					this.updateScore();
				}
				if (this.player1.score >= this.gamePoint || this.player2.score >= this.gamePoint) {
					winner = this.player1.score > this.player2.score ? this.player1.name: this.player2.name;
					this.end(winner);
					resolve();
				} else {
					animatedId = requestAnimationFrame(animate);
					this.renderer.render(this.scene, this.camera);
				}
			}
			animate(0);
		});
	}

	updateScore() {
		player1Score.innerHTML = `${this.player1.name}: ${this.player1.score}`;
		player2Score.innerHTML = `${this.player2.name}: ${this.player2.score}`;
	}

	end(winner) {
		this.init();
		alert(`${winner}${lang[langIndex].win}`);
		exit();
	}

	init() {
		while(this.scene.children.length > 0) { 
			this.scene.remove(this.scene.children[0]); 
		}
		if (this.renderer) {
			this.renderer.dispose();
			this.renderer.forceContextLoss();
			this.renderer.context = null;
			this.renderer.domElement = null;
		}
		this.scene = null;
		this.camera = null;
		this.renderer = null;
		this.player1 = null;
		this.player2 = null;
		this.ball = null;
	}
}

export function exit() {
	cancelAnimationFrame(animatedId);

	const gameContainer = document.querySelector('#game');
	if (gameContainer) {
		gameContainer.remove();
	}

	player1Score.innerHTML = '';
	player2Score.innerHTML = '';
	painGamePoint.innerHTML = `${lang[langIndex].gamePoint}: `;
}