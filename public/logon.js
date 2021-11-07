const loginInput = document.querySelector("#login");
const passwordInput = document.querySelector("#passw");
const btn = document.querySelector("#logon");
const btnRegistry = document.querySelector("#register");
const divRegistry = document.querySelector(".registerDiv");
const registerBtn = document.querySelector("#registerBtn");
const registerLogin = document.querySelector("#registerLogin");
const registerPassword = document.querySelector("#registerPassw");
const displayData = document.querySelector(".displayData");
const loggingState = document.querySelector(".logging");
let increament = 0;

btn.addEventListener("click", async () => {
	if (loginInput.value === "" || passwordInput.value === "") {
		return alert("Podaj dane!");
	}
	const data = {
		login: loginInput.value,
		password: passwordInput.value,
	};
	loggingState.textContent = `Logowanie...`;
	const res = await fetch("https://kamilosnakegame.herokuapp.com/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});
	const response = await res.json();
	const checkValid = async () => {
		const res = await fetch("https://kamilosnakegame.herokuapp.com/check", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${response?.token}`,
			},
		});
		const response2 = await res.json();
		return response2;
	};
	const check = await checkValid();
	console.log(response);
	loggingState.textContent = ``;
	if (response.ok === 1) {
		sessionStorage.setItem("auth", response?.token);
		sessionStorage.setItem("user", data.login);
	} else {
		displayData.textContent = `Błędne dane`;
	}
	if (check?.auth === "ok") {
		console.log("ok");
		window.location.href = `https://kamilosnakegame.herokuapp.com/game/game.html`;
	}
});

btnRegistry.addEventListener("click", () => {
	divRegistry.style.display = "block";
	setInterval(() => {
		increament++;
	}, 1000);
});

registerBtn.addEventListener("click", async () => {
	if (registerLogin.value === "" || registerPassword.value === "") {
		return alert("Podaj dane!");
	}
	if (increament < 3) {
		return alert("Powtórz");
	}
	const data = {
		login: registerLogin.value,
		password: registerPassword.value,
	};
	const res = await fetch("https://kamilosnakegame.herokuapp.com/register", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});
	const response = await res.json();
	if (response.ok === 1) {
		sessionStorage.setItem("auth", response?.token);
		displayData.textContent = `Brawo! Możesz się zalogować!`;
		divRegistry.style.display = "none";
	} else {
		displayData.textContent = `Login zajęty!`;
	}
});
