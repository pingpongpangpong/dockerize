import { Game, winner, exit } from '../object/game.js';
import { lang, langIndex } from "../lang.js";
import { canvas, ctx, initBracket, paintBracket } from './bracket.js';
import { removeValue } from "../tab.js";

const painGamePoint = document.getElementById('show-gp');
let isRunning = true;

export async function offline(gamePoint, name1, name2) {
	const game = new Game(gamePoint);
	game.awake(name1, name2);
	await game.update();
	document.getElementById('offline').style.display = 'block';
}

export async function tournament(gamePoint, nameList) {
	let players = [];
	while (nameList.length > 0) {
		const randomNum = Math.floor(Math.random() * nameList.length);
		const player = nameList[randomNum];
		nameList.splice(randomNum, 1);
		players.push(player);
	}
	initBracket(players);
	isRunning = true;
	let round = 0;
	while (isRunning) {
		try {
			paintBracket(players, round);
			await new Promise((resolve, reject) => setTimeout(() => {
				if (isRunning) {
					document.getElementById('bracket').style.display = 'none';
					resolve();
				} else {
					reject(new Error());
				}
			}, 5000));
			if (!isRunning) {
				break;
			}
			if (players.length === 1) {
				alert(`${players[0]} 토너먼트 승리!`);
				document.getElementById('tournament').style.display = 'block';
				return;
			}
			let winnerList = [];
			for (let i = 0; i < players.length; i += 2) {
				const game = new Game(gamePoint);
				game.awake(players[i], players[i + 1]);
				await game.update();
				winnerList.push(winner);
			}
			players = winnerList;
			round++;
		} catch (error) {
			break;
		}
	}
}

export function onlineHost(data) {
	document.getElementById('online').style.display = 'none';
	if (user.websocket === undefined) {
		user.websocket = new WebSocket (
			'ws://'
			+ window.location.host
			+ '/ws/'
			+ data.roomName
			+ '/'
		);

		if (!user.websocket) {
			alert("Can't connect websocket");
			removeValue();
			closeBracket();
			fillRoomList(1);
			document.getElementById('online').style.display = 'block';
			return ;
		}

		const game = new Game(data.gamePoint);

		user.websocket.onopen = (e) => {
			console.log("Enter the room: " + data.roomName);
		}

		user.websocket.onclose = (e) => {
			console.log("Websocket close")
			finishRoom(data.roomName);
			removeValue();
			closeBracket();
			fillRoomList(1);
			document.getElementById('online').style.display = 'block';
		}

		user.websocket.onmessage = (e) => {
			const json_data = JSON.parse(e.data);
			switch (json_data.msgType) {
				case "START":
					console.log('GAME_START');
					game.awakeHost(user.name, json_data.player2);
					game.updateHost(user.websocket);
					break;
				case "INPUT":
					game.player2.keyInput.up = (json_data.keyInputUp === 'true');
					game.player2.keyInput.down = (json_data.keyInputDown === 'true');
					break;
				case "DISCONNECT":
					console.log('DISCONNECT');
					if (game.status === 'READY' || game.status === 'RUNNING') {
						alert('Other player disconnected')
						if (user.websocket) {
							user.websocket.close();
							user.websocket = undefined;
						}
						document.getElementById('online').style.display = 'block';
					}
					break;
			}
		}
	}
}

export function onlineClient(data) {
	document.getElementById('online').style.display = 'none';
	if (user.websocket === undefined) {
		user.websocket = new WebSocket (
			'ws://'
			+ window.location.host
			+ '/ws/'
			+ data.roomName
			+ '/'
		);

		if (!user.websocket) {
			alert("Can't connect websocket");
			removeValue();
			closeBracket();
			fillRoomList(1);
			document.getElementById('online').style.display = 'block';
			return ;
		}
	
		const game = new Game(data.gamePoint);

		user.websocket.onopen = (e) => {
			console.log("Enter the room: " + data.roomName);
			user.websocket.send(JSON.stringify({
				'msgType': 'START',
				'player2': user.name,
			}));
		}

		user.websocket.onclose = (e) => {
			console.log("Websocket close");
			removeValue();
			closeBracket();
			fillRoomList(1);
			document.getElementById('online').style.display = 'block';
			
		}

		user.websocket.onmessage = (e) => {
			const json_data = JSON.parse(e.data);
			switch (json_data.msgType) {
				case "START":
					console.log('GAME_START');
					game.awakeClient(data.player1, user.name);
					game.updateClient(user.websocket);
					break;
				case "SYNC":
					game.player1.mesh.position.x = json_data.player1.x;
					game.player1.mesh.position.y = json_data.player1.y;
					game.player1.score = json_data.player1.score;
					game.player2.mesh.position.x = json_data.player2.x;
					game.player2.mesh.position.y = json_data.player2.y;
					game.player2.score = json_data.player2.score;
					game.ball.mesh.position.x = json_data.ball.x;
					game.ball.mesh.position.y = json_data.ball.y;
					game.scoreChanged = (json_data.scoreChanged === 'true');
					break;
				case "DISCONNECT":
					console.log('DISCONNECT');
					alert('Other player disconnected')
					if (user.websocket) {
						user.websocket.close();
						user.websocket = undefined;
					}
					break;
				case "FINISH":
					console.log('FINISH');
					game.end(json_data.winner);
					if (user.websocket) {
						user.websocket.close();
						user.websocket = undefined;
					}
					break;
			}
		}
	}
}

export function getGamePoint(type) {
	const gamePoint = document.getElementById(`${type}-game-point`).value;
	if (gamePoint < 2 || gamePoint > 20) {
		alert(lang[langIndex].alGP);
		return -1;
	}
	painGamePoint.innerHTML = `${lang[langIndex].gamePoint}: ${gamePoint}`;
	return gamePoint;
}

export function checkName(name, index) {
	if (name === '') {
		alert(`${index}${lang[langIndex].alPNempty}`);
		return false;
	} else if (name.length < 4 || name.length > 20) {
		alert(`${index}${lang[langIndex].alPNlen}`);
		return false;
	}
	return true;
}

export function closeBracket() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	canvas.style.display = 'none';
	isRunning = false;
	clearTimeout();
}

function fillList(data) {
	let count = 1;
	if (data.roomList) {
		data.roomList.forEach((room) => {
			let listDisplay = document.getElementById('list-' + count);
			let listSubject = document.getElementById('list-name-' + count);
			let listButton = document.getElementById('list-button-' + count);

			listSubject.innerText = room.name;
			listButton.addEventListener('click', () => {
				const xhr = new XMLHttpRequest();
				xhr.open('POST', 'join_room');
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.addEventListener('readystatechange', function (event) {
					const { target } = event;
					if (target.readyState === XMLHttpRequest.DONE) {
						const { status } = target;
						if (status === 0 || (status >= 200 && status < 400)) {
							const data =  JSON.parse(xhr.responseText);
							if (data.status === "success") {
								console.log('JOIN_ROOM');
								onlineClient(JSON.parse(xhr.responseText));
							} else if (data.status === "fail") {
								alert(data.msg);
							}
						}
						else {
							alert(xhr.status + ": " + xhr.responseText);
						}
					}
				});
				let password = "";
				console.log(room.password);
				if (room.password) {
					password = prompt("password");
				}
				xhr.send(JSON.stringify({
					'roomName': room.name,
					'password': password,
					'player2': user.name
				}));
				}
			)
			listDisplay.style.display = 'block';
			count++;
		});
	}
	while (count <= 5) {
		let emptyList = document.getElementById('list-' + count);
		emptyList.style.display = 'none';
		count++;
	}
}

export function fillRoomList(page) {
	const xhr = new XMLHttpRequest();
	xhr.open('POST', 'list_room');
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.addEventListener('readystatechange', function (event) {
		const { target } = event;
		if (target.readyState === XMLHttpRequest.DONE) {
			const { status } = target;
			if (status === 0 || (status >= 200 && status < 400)) {
				fillList(JSON.parse(xhr.responseText));
			}
			else {
				alert(xhr.status + ": " + xhr.responseText);
			}
		}
	});
	xhr.send(JSON.stringify({
		'page': page
	}));
}

export function finishRoom(room_name) {
	const xhr = new XMLHttpRequest();
	xhr.open('POST', 'finish_room');
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.addEventListener('readystatechange', function (event) {
		const { target } = event;
		if (target.readyState === XMLHttpRequest.DONE) {
			const { status } = target;
			if (status === 0 || (status >= 200 && status < 400)) {
				const data = JSON.parse(xhr.responseText);
				console.log(data.result);
			}
			else {
				alert(xhr.status + ": " + xhr.responseText);
			}
		}
	});
	xhr.send(JSON.stringify({
		'roomName': room_name
	}));
}