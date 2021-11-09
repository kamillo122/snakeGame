const dashBoard = document.querySelector(".dashboard");
const table = document.querySelector("table");

const displayDashboard = async () => {
	const res = await fetch("http://localhost:8080/dashboard");
	const dash = await res.json();
	const sorted = dash.dashboard.sort((a, b) => {
		const scoreA = a.bestScore;
		const scoreB = b.bestScore;
		return scoreA < scoreB ? 1 : scoreA === scoreB ? 0 : -1;
	});
	for (const player of sorted) {
		table.innerHTML += `
		<tr>
			<td>${player?.login}</td>
			<td>${player?.bestScore}</td>
		</tr>
		`;
	}
};
displayDashboard();
