import { onlineHost } from "./feature.js";
import { lang, langIndex } from '../lang.js';

const roomSettingContainer = document.getElementById('room-setting');
document.getElementById('make-room').addEventListener('click', () => {
	roomSettingContainer.style.display = 'block';
});

document.getElementById('cancel-mark').addEventListener('click', function() {
	roomSettingContainer.style.display = 'none';
});

document.getElementById('cancel').addEventListener('click', () => {
	roomSettingContainer.style.display = 'none';
});

// online game
document.getElementById('m-ok').addEventListener('click', () => {
	const roomName = document.getElementById('room-name').value;
	if (roomName === '') {
		alert(lang[langIndex].alRNempty);
		return;
	} else if (roomName.length < 4 || roomName.length > 20) {
		alert(lang[langIndex].alRNlen);
		return;
	}

	const gamePoint = document.getElementById('m-game-point').value;
		if (gamePoint < 0) {
		return;
	}

	const password = document.getElementById('password').value;
	if (password !== '') {
		if (password.length < 4) {
			alert(lang[langIndex].alPW);
			return;
		}
	}
	
	roomSettingContainer.style.display = 'none';

	const xhr = new XMLHttpRequest();
	xhr.open('POST', 'create_room');
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.addEventListener('readystatechange', function (event) {
		const { target } = event;
		if (target.readyState === XMLHttpRequest.DONE) {
			const { status } = target;
			if (status === 0 || (status >= 200 && status < 400)) {
				const data = JSON.parse(xhr.responseText);
				if (data.result === 'success') {
					onlineHost(data);
				} else {
					alert("Can't create room.")
				}
			}
			else {
				alert(xhr.status + ": " + xhr.responseText);
			}
		}
	});
	xhr.send(JSON.stringify({
		'roomName': roomName,
		'gamePoint': gamePoint,
		'password': password,
		'player1': user.name
	}));
});

