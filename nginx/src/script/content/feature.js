import { Game, winner } from '../object/game.js';
import { lang, langIndex } from "../lang.js";
import { canvas, ctx, initBracket, paintBracket } from './bracket.js';

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

export function online(gamePoint, room) {
	console.log('online');
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

export function fillRoomList(data) {
	let count = 1;
	if (data.roomList) {
		data.roomList.forEach((room) => {
			let listDisplay = document.getElementById('list-' + count);
			let listSubject = document.getElementById('list-name-' + count);
			let listButton = document.getElementById('list-button-' + count);

			listSubject.innerText = room.name;
			listButton.addEventListener('click', () => {
					if (user.websocket) {
						user.websocket.send(JSON.stringify({
							'msgType': 'JOIN_ROOM',
							'roomName': room.name,
							'player2': user.name,
						}))
					}
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