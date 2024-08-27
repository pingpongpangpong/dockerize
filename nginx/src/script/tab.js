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
	if (user.websocket) {
		user.websocket.close();
		user.websocket = undefined;
	}
});

document.getElementById('t-tab').addEventListener('click', () => {
	offlineContent.style.display = 'none';
	tournamentContent.style.display = 'block';
	onlineContent.style.display = 'none';
	removeValue();
	exit();
	closeBracket();
	if (user.websocket) {
		user.websocket.close();
		user.websocket = undefined;
	}
});

document.getElementById('m-tab').addEventListener('click', () => {
	offlineContent.style.display = 'none';
	tournamentContent.style.display = 'none';
	onlineContent.style.display = 'block';
	removeValue();
	exit();
	closeBracket();
	if (user.websocket) {
		user.websocket.close();
		user.websocket = undefined;
	}
	fillRoomList(1);
});

export function removeValue() {
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
	for (let i = 0; i < roomSetting.length; i++) {
		if (roomSetting[i].className === 'game-point') {
			roomSetting[i].value = '10';
		} else {
			roomSetting[i].value = '';
		}
	}
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