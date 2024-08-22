import { closeBracket, fillRoomList } from "./content/feature.js";
import { lang, langIndex } from "./lang.js";
import { exit, Game } from "./object/game.js";

const offlineContent = document.getElementById('offline');
const tournamentContent = document.getElementById('tournament');
const onlineContent = document.getElementById('online');

document.getElementById('l-tab').addEventListener('click', () => {
	offlineContent.style.display = 'block';
	tournamentContent.style.display = 'none';
	onlineContent.style.display = 'none';
	removeValue();
	exit();
	closeBracket();
});

document.getElementById('t-tab').addEventListener('click', () => {
	offlineContent.style.display = 'none';
	tournamentContent.style.display = 'block';
	onlineContent.style.display = 'none';
	removeValue();
	exit();
	closeBracket();
});

document.getElementById('m-tab').addEventListener('click', () => {
	offlineContent.style.display = 'none';
	tournamentContent.style.display = 'none';
	onlineContent.style.display = 'block';
	removeValue();
	exit();
	closeBracket();
	const game = new Game(10);
	game.role = 'NONE';
	game.status = 'NONE';

	if (user.websocket) {
		user.websocket.onmessage = (e) => {
			const data = JSON.parse(e.data);
			switch (data.msgType) {
				case "ROOM_LIST_RESPONSE":
					console.log('ROOM_LIST_RESPONSE');
					fillRoomList(data);
					break;
				case "CREATE_ROOM_ALLOW":
					console.log('CREATE_ROOM_ALLOW');
					if (game.role === 'NONE' && game.status === 'NONE') {
						game.gamePoint = data.gamePoint;
						game.role = 'HOST';
						game.status = 'READY';
					}
					break;
				case "JOIN_ROOM_ALLOW":
					console.log('JOIN_ROOM_ALLOW');
					if (game.role === 'NONE' && game.status === 'NONE') {
						game.gamePoint = data.gamePoint;
						game.role = 'CLIENT';
						game.status = 'READY';
					}
					break;
				case "GAME_START":
					console.log('GAME_START');
					if (game.role === 'HOST' && game.status === 'READY') {
						game.awakeHost(data.player1, data.player2);
						game.status = 'RUNNING';
						game.updateHost(user.websocket);
					} else if (game.role === 'CLIENT' && game.status === 'READY') {
						game.awakeClient(data.player1, data.player2);
						game.status = 'RUNNING';
						game.updateClient(user.websocket);
					}
					break;
				case "SYNC":
					if (game.role === 'CLIENT' && game.status === 'RUNNING') {
						game.player1.mesh.position.x = data.player1.x;
						game.player1.mesh.position.y = data.player1.y;
						game.player1.score = data.player1.score;
						game.player2.mesh.position.x = data.player2.x;
						game.player2.mesh.position.y = data.player2.y;
						game.player2.score = data.player2.score;
						game.ball.mesh.position.x = data.ball.x;
						game.ball.mesh.position.y = data.ball.y;
						game.scoreChanged = (data.scoreChanged === 'true');
					}
					break;
				case "INPUT":
					if (game.role === 'HOST' && game.status === 'RUNNING') {
						game.player2.keyInput.up = (data.keyInputUp === 'true');
						game.player2.keyInput.down = (data.keyInputDown === 'true');
					}
					break;
				case "DISCONNECT":
					console.log('DISCONNECT');
					if (game.status === 'READY' || game.status === 'RUNNING') {
								alert('Other player disconnected')
								removeValue();
								exit();
								closeBracket();
								game.role = 'NONE';
								game.status = 'NONE';
								user.websocket.send(JSON.stringify({
									'msgType': 'ROOM_LIST_REQUEST',
								}))
							onlineContent.style.display = 'block';
					}
					break;
				case "FINISH":
					console.log('FINISH');
					if (game.role === 'CLIENT' && game.status === 'RUNNING') {
						alert(`${data.winner}${lang[langIndex].win}`);
						removeValue();
						exit();
						closeBracket();
						game.role = 'NONE';
						game.status = 'NONE';
						user.websocket.send(JSON.stringify({
							'msgType': 'ROOM_LIST_REQUEST',
						}))
						onlinContent.style.display = 'block';
					}
					break;
			}
		}
		user.websocket.send(JSON.stringify({
			'msgType': 'ROOM_LIST_REQUEST',
		}))
	}
});

function removeValue() {
	const select = document.getElementById('select-num');
	select.options[0].selected = true;
	
	const tournamentInputList = document.getElementById('input-list');
	if (tournamentInputList.childNodes.length !== 0) {
		while (tournamentInputList.firstChild) {
			tournamentInputList.removeChild(tournamentInputList.firstChild);
		}
	}

	const tournamentStartButton = document.getElementById('t-button');
	while (tournamentStartButton.firstChild) {
		tournamentStartButton.removeChild(tournamentStartButton.firstChild);
	}

	const roomSetting = document.getElementById('room-setting');
	if (roomSetting.style.display === 'block') {
		roomSetting.style.display = 'none';
	}


	const inputList = document.getElementsByTagName('input');
	for (let i = 0; i < inputList.length; i++) {
		if (inputList[i].className === 'game-point') {
			inputList[i].value = '10';
		} else {
			inputList[i].value = '';
		}
	}
}