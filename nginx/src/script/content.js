import { Game } from "./game.js";

const localBtn = document.querySelector("#local");
const tournamentBtn = document.querySelector("#tournament");
const multiBtn = document.querySelector("#multi");
const content = document.querySelector("#content");
const mutliDisplay = window.getComputedStyle(multiBtn);

local();
localBtn.addEventListener("click", local);
tournamentBtn.addEventListener("click", tournamentPlay);
multiBtn.addEventListener("click", multiPlay);
window.addEventListener("keydown", (e) => {
	if (e.key === "l") {
		local();
	} else if (e.key === "t") {
		tournamentPlay();
	} else if (e.key === "m" && mutliDisplay.display === "block") {
		multiPlay();
	}
});

export function local() {
	content.className = "local-play";
	removeContent();
	const game = new Game();
	game.init();
	game.game();
}

function tournamentPlay() {
	content.className = "tournament-play";
	removeContent();
	const game = new Game();
	game.init();
	game.game();
}

function multiPlay() {
	content.className = "multi-play";
	removeContent();
	const multiGame = new Game();
	const room_name = prompt();
	
	const gameSocket = new WebSocket (
		'ws://'
		+ window.location.host
		+ '/ws/'
		+ room_name
		+ '/'
	);
	gameSocket.onmessage = function(e) {
		const data = JSON.parse(e.data);
		switch (data.msgType) {
			case "HOST":
				if (multiGame.status === 'NONE') {
					multiGame.role = 'HOST';
					multiGame.status = 'READY';
				}
				break;
			case "CLIENT":
				if (multiGame.status === 'NONE') {
					multiGame.role = 'CLIENT';
					multiGame.status = 'READY';
				}
				break;
			case "START":
				if (multiGame.role === 'HOST' && multiGame.status === 'READY') {
					multiGame.status = 'RUNNING';
					multiGame.initHost();
					multiGame.gameHost(gameSocket);
				} else if (multiGame.role === 'CLIENT' && multiGame.status === 'READY') {
					multiGame.status = 'RUNNING';
					multiGame.initClient();
					multiGame.gameClient(gameSocket);
				}
				break;
			case "SYNC":
				if (multiGame.role === 'CLIENT' && multiGame.status === 'RUNNING') {
					multiGame.player1.mesh.position.x = data.player1.x;
					multiGame.player1.mesh.position.y = data.player1.y;
					multiGame.player1.score = data.player1.score;
					multiGame.player2.mesh.position.x = data.player2.x;
					multiGame.player2.mesh.position.y = data.player2.y;
					multiGame.player2.score = data.player2.score;
					multiGame.ball.mesh.position.x = data.ball.x;
					multiGame.ball.mesh.position.y = data.ball.y;
					multiGame.scoreChanged = (data.scoreChanged === 'true');
				}
				break;
			case "INPUT":
				if (multiGame.role === 'HOST' && multiGame.status === 'RUNNING') {
					multiGame.player2.keyboard.up = (data.keyboardUp === 'true');
					multiGame.player2.keyboard.down = (data.keyboardDown === 'true');
				}
				break;
			case "FINISH":
				if (multiGame.role === 'CLIENT' && multiGame.status === 'RUNNING') {
					alert(data.message);
				}
				break;
			case "DISCONECT":
				alert(data.message);
		}
	};
}

function removeContent() {
	while (content.firstChild) {
		content.removeChild(content.firstChild);
	}
}