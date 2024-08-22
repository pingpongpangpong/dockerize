const signinButton = document.getElementById('signin');
const signoutButton = document.getElementById('signout');
const onlineButton = document.getElementById('m-tab');

signinButton.addEventListener('click', () => {
	if (user.websocket === undefined) {
		user.websocket = new WebSocket(
			'ws://'
			+ window.location.host
			+ '/ws/'
		);
		user.name = prompt('username');
	}
	signinButton.style.display = 'none';
	signoutButton.style.display = 'block';
	onlineButton.style.display = 'block';
});

signoutButton.addEventListener('click', () => {
	if (user.websocket) {
		user.websocket.close();
		user.websocket = undefined;
	}
	signinButton.style.display = 'block';
	signoutButton.style.display = 'none';
	onlineButton.style.display = 'none';

	const onlineContent = document.getElementById('online');
	const offlineContent = document.getElementById('offline');
	if (onlineContent.style.display === 'block') {
		onlineContent.style.display = 'none';
		offlineContent.style.display = 'block';
	}
});