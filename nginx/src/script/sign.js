import { lang, langIndex } from "./lang.js";
import { local } from "./content.js";

const signinBtn = document.querySelector("#sign-in");
const signoutBtn = document.querySelector("#sign-out");
const multiBtn = document.querySelector("#multi");
const content = document.querySelector("#content");

signinBtn.addEventListener("click", () => {
	signinBtn.style.display = "none";
	signoutBtn.style.display = "block";
	multiBtn.style.display = "block";
	alert(lang[langIndex].isSignin);
})

signoutBtn.addEventListener("click", () => {
	signinBtn.style.display = "block";
	signoutBtn.style.display = "none";
	multiBtn.style.display = "none";
	alert(lang[langIndex].isSignout);
	if (content.className === "multi-play") {
		local();
	}
})