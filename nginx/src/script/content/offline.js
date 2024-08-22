import { offline, getGamePoint, checkName } from "./feature.js";
import { lang, langIndex } from '../lang.js';

document.getElementById('l-ok').addEventListener('click', () => {
	const gamePoint = getGamePoint('l');
	if (gamePoint < 0) {
		return;
	}

	const name1 = document.getElementById('name-input1').value;
	const name2 = document.getElementById('name-input2').value;
	if (!checkName(name1, 1)) {
		return;
	}
	if (!checkName(name2, 2)) {
		return;
	}
	if (name1 === name2) {
		alert(`1${lang[langIndex].alPNsame1}2${lang[langIndex].alPNsame2}`);
		return;
	}
	
	document.getElementById('offline').style.display = 'none';
	offline(gamePoint, name1, name2);
});