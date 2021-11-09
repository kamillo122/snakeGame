const btn = document.querySelector("#btn");
const canvas = document.querySelector(".canvas");
const ctx = canvas.getContext("2d");
const scoreDiv = document.querySelector("#score");
const lenDiv = document.querySelector("#len");
const endDiv = document.querySelector(".popUp");
const trybSelect = document.querySelector("#tryb");
const logoff = document.querySelector("#logoff");
const bestScores = document.querySelector(".bestScore");
let choosenSpeed = parseInt(trybSelect.value);

const verifyToken = async () => {
	const res = await fetch("https://kamilosnakegame.herokuapp.com/check", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${sessionStorage.getItem("auth")}`,
		},
		body: JSON.stringify({ data: sessionStorage.getItem("user") }),
	});

	const response2 = await res.json();
	if (response2?.error) {
		window.location.href = `https://kamilosnakegame.herokuapp.com/`;
	} else {
		displayScore();
	}
};

verifyToken();

document.querySelector(".logout").textContent = `Zalogowany jako: ${
	sessionStorage.getItem("user") ?? "Nie zalogowany"
}`;

const checkScores = async () => {
	const data = { login: sessionStorage.getItem("user") };
	const res = await fetch("https://kamilosnakegame.herokuapp.com/score", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});
	const json = await res.json();
	return json;
};

const displayScore = async () => {
	bestScores.textContent = `Ładowanie...`;
	const scores = await checkScores();
	const bestScore = !scores.score.length
		? "Pusto tu"
		: Math.max(...scores.score);
	bestScores.textContent = `Najlepszy wynik: ${bestScore}`;
};

logoff.addEventListener("click", () => {
	window.location.href = `https://kamilosnakegame.herokuapp.com/`;
	sessionStorage.removeItem("auth");
	sessionStorage.removeItem("user");
});

trybSelect.addEventListener("input", () => {
	choosenSpeed = parseInt(trybSelect.value);
});

btn.addEventListener("click", () => {
	document.querySelector(".container").style.display = "none";
	const widthInput = document.querySelector("#width");
	const heightInput = document.querySelector("#height");
	let start = false;
	let points = 0;
	if (!widthInput.value || !heightInput.value) {
		return alert("Podaj dane!");
	}
	canvas.height = heightInput.value;
	canvas.width = widthInput.value;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "green";
	canvas.style.display = "block";
	endDiv.style.display = "none";
	btn.value = "Graj";
	const sizeContainer = {
		width: canvas.width,
		height: canvas.height,
	};
	const randomFeed = (min, max) => {
		return Math.floor((Math.random() * (max - min + 1) + min) / 20) * 20;
	};
	const feedPos = {
		width: 20,
		height: 20,
		x: randomFeed(0, sizeContainer.width),
		y: randomFeed(0, sizeContainer.height),
	};
	let dX = 20;
	let dY = 0;
	const snakeSegments = [
		{ x: 20, y: 20 },
		{ x: 10, y: 20 },
		{ x: 0, y: 20 },
	];
	const drawSnake = () => {
		snakeSegments.forEach((part) => {
			ctx.fillRect(part.x, part.y, 20, 20);
		});
	};
	const changeDirection = (event) => {
		start = true;
		const LEFT_KEY = 37;
		const RIGHT_KEY = 39;
		const UP_KEY = 38;
		const DOWN_KEY = 40;

		const keyPressed = event.keyCode;
		const goingUp = dY === -20;
		const goingDown = dY === 20;
		const goingRight = dX === 20;
		const goingLeft = dX === -20;
		if (keyPressed === LEFT_KEY && !goingRight) {
			dX = -20;
			dY = 0;
		}

		if (keyPressed === UP_KEY && !goingDown) {
			dX = 0;
			dY = -20;
		}

		if (keyPressed === RIGHT_KEY && !goingLeft) {
			dX = 20;
			dY = 0;
		}

		if (keyPressed === DOWN_KEY && !goingUp) {
			dX = 0;
			dY = 20;
		}
	};
	const autoMoving = () => {
		snakeSegments.unshift({
			x: snakeSegments[0].x + dX,
			y: snakeSegments[0].y + dY,
		});
		if (snakeSegments[0].x === feedPos.x && snakeSegments[0].y === feedPos.y) {
			createRandomFeed();
			points += 10;
		} else {
			snakeSegments.pop();
		}
	};
	const createRandomFeed = () => {
		feedPos.x = randomFeed(0, sizeContainer.width);
		feedPos.y = randomFeed(0, sizeContainer.height);
		snakeSegments.forEach((part) => {
			if (part.x === feedPos.x && part.y === feedPos.y) {
				createRandomFeed();
			}
		});
		if (snakeSegments[0].x === feedPos.x && snakeSegments[0].y === feedPos.y) {
			ctx.clearRect(feedPos.x, feedPos.x, feedPos.width, feedPos.height);
			createRandomFeed();
		}
	};
	const creatingFood = () => {
		if (snakeSegments[0].x === feedPos.x && snakeSegments[0].y === feedPos.y) {
			ctx.clearRect(feedPos.x, feedPos.x, feedPos.width, feedPos.height);
			createRandomFeed();
		}
	};
	const displayEndGame = async () => {
		document.querySelector(".container").style.display = "block";
		displayScore();
		endDiv.style.display = "block";
		btn.value = "Graj ponownie!";
		scoreDiv.textContent = `Wynik: ${points}`;
		lenDiv.textContent = `Długość: ${snakeSegments.length}`;
		const div = document.createElement("div");
		div.style.background = "red";
		div.style.width = "100px";
		div.style.zIndex = "999";
		div.style.height = "100px";
		canvas.appendChild(div);
		const data = {
			login: sessionStorage.getItem("user"),
			score: points,
			snakeLength: snakeSegments.length,
		};
		const res = await fetch("http://localhost:8080/gameData", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});
		const json = await res.json();
		if (json.update === "ok") {
			displayScore();
		} else {
			console.log("Update data error!");
		}
	};
	const checkIfCrash = () => {
		for (let i = 3; i < snakeSegments.length; i++) {
			if (
				snakeSegments[i].x === snakeSegments[0].x &&
				snakeSegments[i].y === snakeSegments[0].y
			)
				return true;
		}
		return (
			snakeSegments[0].x < 0 ||
			snakeSegments[0].x > sizeContainer.width ||
			snakeSegments[0].y < 0 ||
			snakeSegments[0].y > sizeContainer.height
		);
	};
	(async (sleep) => {
		while (true) {
			if (checkIfCrash()) {
				return displayEndGame();
			}
			document.addEventListener("keydown", changeDirection);
			if (start) {
				autoMoving();
			}
			creatingFood();
			ctx.clearRect(0, 0, sizeContainer.width, sizeContainer.height);
			ctx.strokeRect(0, 0, sizeContainer.width, sizeContainer.height);
			ctx.fillRect(feedPos.x, feedPos.y, 20, 20);
			drawSnake();
			await sleep(choosenSpeed);
		}
	})((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
});
