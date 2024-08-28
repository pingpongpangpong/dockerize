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

const searchRoom = () => {
	const roomName = document.getElementById('search').value;
	if (roomName == "") {
		fillRoomList(1);
	} else {
		const xhr = new XMLHttpRequest();
		xhr.open('POST', 'search_room');
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.addEventListener('readystatechange', function (event) {
			const { target } = event;
			if (target.readyState === XMLHttpRequest.DONE) {
				const { status } = target;
				if (status === 0 || (status >= 200 && status < 400)) {
					cleanRoomPage();
					const data = JSON.parse(xhr.responseText);
					fillList(data);
					addEvent();
				}
				else {
					alert(xhr.status + ": " + xhr.responseText);
				}
			}
		});
		xhr.send(JSON.stringify({
			'roomName': roomName
		}));
	}
}

function joinRoom(roomName, roomPassword) {
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
	if (roomPassword === "true") password = prompt("password");
	xhr.send(JSON.stringify({
		'roomName': roomName,
		'password': password,
		'player2': user.name
	}));
}

const listEvent1 = () => {
	const listSubject = document.getElementById('list-name-1');
	const roomPassword = document.getElementById('list-password-1');
	const roomName = listSubject.innerHTML;
	const password = roomPassword.innerHTML;
	joinRoom(roomName, password);
}

const listEvent2 = () => {
	const listSubject = document.getElementById('list-name-2');
	const roomPassword = document.getElementById('list-password-2');
	const roomName = listSubject.innerHTML;
	const password = roomPassword.innerHTML;
	joinRoom(roomName, password);
}

const listEvent3 = () => {
	const listSubject = document.getElementById('list-name-3');
	const roomPassword = document.getElementById('list-password-3');
	const roomName = listSubject.innerHTML;
	const password = roomPassword.innerHTML;
	joinRoom(roomName, password);
}

const listEvent4 = () => {
	const listSubject = document.getElementById('list-name-4');
	const roomPassword = document.getElementById('list-password-4');
	const roomName = listSubject.innerHTML;
	const password = roomPassword.innerHTML;
	joinRoom(roomName, password);
}

const listEvent5 = () => {
	const listSubject = document.getElementById('list-name-5');
	const roomPassword = document.getElementById('list-password-5');
	const roomName = listSubject.innerHTML;
	const password = roomPassword.innerHTML;
	joinRoom(roomName, password);
}

const pageEventPrev = () => {
	const page_cur = document.getElementById('page-3');
	fillRoomList(Number(page_cur.innerHTML) - 3);
}

const pageEventNext = () => {
	const page_cur = document.getElementById('page-3');
	fillRoomList(Number(page_cur.innerHTML) + 3);
}

const pageEvent1 = () => {
	const pageNum = document.getElementById('page-1');
	const number = pageNum.innerHTML;
	fillRoomList(number);
}

const pageEvent2 = () => {
	const pageNum = document.getElementById('page-2');
	const number = pageNum.innerHTML;
	fillRoomList(number);
}

const pageEvent3 = () => {
	const pageNum = document.getElementById('page-3');
	const number = pageNum.innerHTML;
	fillRoomList(number);
}

const pageEvent4 = () => {
	const pageNum = document.getElementById('page-4');
	const number = pageNum.innerHTML;
	fillRoomList(number);
}

const pageEvent5 = () => {
	const pageNum = document.getElementById('page-5');
	const number = pageNum.innerHTML;
	fillRoomList(number);
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
			user.websocket = undefined;
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
						}
						fillRoomList(1);
						document.getElementById('online').style.display = 'block';
					}
					break;
			}
		}
	}
}

export function onlineClient(data) {
	document.getElementById('online').style.display = 'none';
	if (user.websocket) {
		user.websocket.close();
		user.websocket = undefined;
	}
	if (!user.websocket) {
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
			user.websocket = undefined;
		}

		user.websocket.onmessage = (e) => {
			const json_data = JSON.parse(e.data);
			switch (json_data.msgType) {
				case "START":
					console.log('GAME_START');
					game.awakeClient(data.player1, user.name);
					window.addEventListener("keyup", (e) => {
						if (game) {
							if (e.key === "ArrowUp") {
								game.player2.keyInput.up = false;
							} else if (e.key === "ArrowDown") {
								game.player2.keyInput.down = false;
							}
							if (user.websocket) {
								user.websocket.send(JSON.stringify({
									'msgType': 'INPUT',
									'keyInputUp': String(game.player2.keyInput.up),
									'keyInputDown': String(game.player2.keyInput.down)
								}));
							}
						}
					});
					
					window.addEventListener("keydown", (e) => {
						if (game) {
							if (e.key === "ArrowUp") {
								game.player2.keyInput.up = true;
							} else if (e.key === "ArrowDown") {
								game.player2.keyInput.down = true;
							}
							if (user.websocket) {
								user.websocket.send(JSON.stringify({
									'msgType': 'INPUT',
									'keyInputUp': String(game.player2.keyInput.up),
									'keyInputDown': String(game.player2.keyInput.down)
								}));
							}
						}
					});
					game.updateClient();
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
					game.init();
					if (user.websocket) {
						user.websocket.close();
					}
					fillRoomList(1);
					document.getElementById('online').style.display = 'block';
					break;
				case "FINISH":
					console.log('FINISH');
					game.end(json_data.winner);
					if (user.websocket) {
						user.websocket.close();
					}
					fillRoomList(1);
					document.getElementById('online').style.display = 'block';
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
			const listDisplay = document.getElementById('list-' + count);
			const listSubject = document.getElementById('list-name-' + count);
			const listPassword = document.getElementById('list-password-' + count);
			listSubject.innerHTML = room.name;
			listPassword.innerHTML = String(room.password);
			listDisplay.style.display = 'block';
			count++;
		});
	}
}

export function fillPage(data) {
	
	let curPage = Number(data.cur_page);
	let totalPage = Number(data.total_page);

	for (let i = -2; i <= 2; i++) {
		let pageNum = curPage + i;
		let num = i + 3;
		const page_num = document.getElementById('page-' + num);
		page_num.innerText = pageNum;
		if (pageNum < 1 || pageNum > totalPage) {
			page_num.style.color = "transparent";
		}
		else {
			page_num.style.color = "inherit";
		}
	}
}

function cleanRoomPage() {
	const list1 = document.getElementById('list-1');
	const listSub1 = document.getElementById('list-name-1');
	const listBut1 = document.getElementById('list-button-1');
	const page1 = document.getElementById('page-1');
	listBut1.removeEventListener('click', listEvent1);
	page1.removeEventListener('click', pageEvent1);
	list1.style.display = 'none';
	listSub1.innerText = "";
	page1.innerText = "";
	
	const list2 = document.getElementById('list-2');
	const listSub2 = document.getElementById('list-name-2');
	const listBut2 = document.getElementById('list-button-2');
	const page2 = document.getElementById('page-2');
	listBut2.removeEventListener('click', listEvent2);
	page2.removeEventListener('click', pageEvent2);
	list2.style.display = 'none';
	listSub2.innerText = "";
	page2.innerText = "";

	const list3 = document.getElementById('list-3');
	const listSub3 = document.getElementById('list-name-3');
	const listBut3 = document.getElementById('list-button-3');
	const page3 = document.getElementById('page-3');
	listBut3.removeEventListener('click', listEvent3);
	page3.removeEventListener('click', pageEvent3);
	list3.style.display = 'none';
	listSub3.innerText = "";
	page3.innerText = "";

	const list4 = document.getElementById('list-4');
	const listSub4 = document.getElementById('list-name-4');
	const listBut4 = document.getElementById('list-button-4');
	const page4 = document.getElementById('page-4');
	listBut4.removeEventListener('click', listEvent4);
	page4.removeEventListener('click', pageEvent4);
	list4.style.display = 'none';
	listSub4.innerText = "";
	page4.innerText = "";

	const list5 = document.getElementById('list-5');
	const listSub5 = document.getElementById('list-name-5');
	const listBut5 = document.getElementById('list-button-5');
	const page5 = document.getElementById('page-5');
	listBut5.removeEventListener('click', listEvent5);
	page5.removeEventListener('click', pageEvent5);
	list5.style.display = 'none';
	listSub5.innerText = "";
	page5.innerText = "";

	const pagePrevButton = document.getElementById('page-prev');
	const pageNextButton = document.getElementById('page-next');
	pagePrevButton.removeEventListener('click', pageEventPrev);
	pageNextButton.removeEventListener('click', pageEventNext);

	const searchButton = document.getElementById('search-room');
	searchButton.removeEventListener('click', searchRoom);
}

function addEvent() {
	const listBut1 = document.getElementById('list-button-1');
	const page1 = document.getElementById('page-1');
	listBut1.addEventListener('click', listEvent1);
	page1.addEventListener('click', pageEvent1);

	const listBut2 = document.getElementById('list-button-2');
	const page2 = document.getElementById('page-2');
	listBut2.addEventListener('click', listEvent2);
	page2.addEventListener('click', pageEvent2);

	const listBut3 = document.getElementById('list-button-3');
	const page3 = document.getElementById('page-3');
	listBut3.addEventListener('click', listEvent3);
	page3.addEventListener('click', pageEvent3);

	const listBut4 = document.getElementById('list-button-4');
	const page4 = document.getElementById('page-4');
	listBut4.addEventListener('click', listEvent4);
	page4.addEventListener('click', pageEvent4);

	const listBut5 = document.getElementById('list-button-5');
	const page5 = document.getElementById('page-5');
	listBut5.addEventListener('click', listEvent5);
	page5.addEventListener('click', pageEvent5);

	const pagePrevButton = document.getElementById('page-prev');
	const pageNextButton = document.getElementById('page-next');
	pagePrevButton.addEventListener('click', pageEventPrev);
	pageNextButton.addEventListener('click', pageEventNext);

	const searchButton = document.getElementById('search-room');
	searchButton.addEventListener('click', searchRoom);
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
				cleanRoomPage();
				const data = JSON.parse(xhr.responseText);
				fillList(data);
				fillPage(data);
				addEvent();
			}
			else {
				alert(xhr.status + ": " + xhr.responseText);
				fillRoomList(1);
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