const title = document.querySelector("#title-text");
const signinBtn = document.querySelector("#sign-in");
const signoutBtn = document.querySelector("#sign-out");
const localBtn = document.querySelector("#local");
const tournamentBtn = document.querySelector("#tournament");
const multiBtn = document.querySelector("#multi");
const startMenu = document.querySelector("#start");
const endMenu = document.querySelector("#end");
const point = document.querySelector("#point").querySelector("span");
const input = document.querySelector("#point").querySelector("input");
const langSelector = document.querySelector("#lang");

export const lang = {
	"ko": {
		"title": "핑퐁팡퐁",
		"signin": "로그인",
		"signout": "로그아웃",
		"isSignin": "로그인 되었습니다.",
		"isSignout": "로그아웃 되었습니다.",
		"local": "로컬 플레이(L)",
		"tournament": "토너먼트(T)",
		"multi": "멀티 플레이(M)",
		"start": "Space: 서브",
		"end": "ESC: 게임 종료",
		"point": "게임 포인트: ",
		"alert": "게임 포인트는 1이상이어야 합니다."
	},
	"en": {
		"title": "PingPongPangPong",
		"signin": "sign in",
		"signout": "sign out",
		"isSignin": "You have been signed in.",
		"isSignout": "You have been signed out.",
		"local": "Local play(L)",
		"tournament": "Tournament(T)",
		"multi": "Multi play(M)",
		"start": "Space: Serve",
		"end": "ESC: Game Quit",
		"point": "Game Point: ",
		"alert": "The game point must be at least 1."
	},
	"jp": {
		"title": "ピンポンパンポン",
		"signin": "ログイン",
		"signout": "ログアウト",
		"isSignin": "ログインしました。",
		"isSignout": "ログアウトしました。",
		"local": "ローカルプレー(L)",
		"tournament": "トーナメント(T)",
		"multi": "ネットプレー(M)",
		"start": "Space: サーブ",
		"end": "ESC: ゲーム終了",
		"point": "ゲームポイント: ",
		"alert": "ゲームポイントは1以上でなければなりません。"
	}
};

export let langIndex = "ko";

langSelector.addEventListener("change", (e) => {
	langIndex = e.target.value;
	title.textContent = lang[langIndex].title;
	signinBtn.textContent = lang[langIndex].signin;
	signoutBtn.textContent = lang[langIndex].signout;
	localBtn.textContent = lang[langIndex].local;
	tournamentBtn.textContent = lang[langIndex].tournament;
	multiBtn.textContent = lang[langIndex].multi;
	startMenu.textContent = lang[langIndex].start;
	endMenu.textContent = lang[langIndex].end;
	point.textContent = lang[langIndex].point;
	input.setCustomValidity(lang[langIndex].alert);
});