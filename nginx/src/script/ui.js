import * as THREE from "three";
import { FontLoader, TextGeometry } from "three/addons/Addons.js";

export class UI {
	constructor() {
		this.loader = new FontLoader();
		this.font = null;
	}

		async loadFont() {
		return new Promise((resolve) => {
			this.loader.load("../font/DungGeunMo.json", (f) => {
				this.font = f;
				resolve();
			});
		});
	}

	createScoreMeshes(score1, score2) {
		const createScoreMesh = (score, x) => {
			const geometry = new TextGeometry(score.toString(), {
				font: this.font,
				size: 0.5,
				depth: 0.1,
				curveSegments: 12,
				bevelEnabled: true,
				bevelThickness: 0.03,
				bevelSize: 0.02,
				bevelOffset: 0,
				bevelSegments: 5
			});
			const material = new THREE.MeshPhysicalMaterial({ color: 0xF3FFE2 });
			const mesh = new THREE.Mesh(geometry, material);
			mesh.position.set(x, 2.8, 0);
			return mesh;
		};

		const score1Mesh = createScoreMesh(score1, -2.5);
		const score2Mesh = createScoreMesh(score2, 2);

		return { score1Mesh, score2Mesh };
	}

	updateScoreMesh(mesh, score) {
		if (mesh.geometry) mesh.geometry.dispose();
		mesh.geometry = new TextGeometry(score.toString(), {
			font: this.font,
			size: 0.5,
			depth: 0.1,
			curveSegments: 12,
			bevelEnabled: true,
			bevelThickness: 0.03,
			bevelSize: 0.02,
			bevelOffset: 0,
			bevelSegments: 5
		});
	}
}