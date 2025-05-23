import { API, MatchHistory, NewMatchHistoryEntry } from "./api";
import { getTranslation } from "./language";

const api = new API("");

export function addGameToHistory(
	userId: number,
	type: string,
	result: string
): void {
	const data: NewMatchHistoryEntry = { userId, type, result };
  
	api.createMatchHistoryEntry(data)
		.then((res) => {
		updateHistoryUI(userId);
	})
		.catch((error) => {
		console.error("Error adding match history entry:", error.message);
	});
}

export function updateHistoryUI(userId: number): void {
	const historyList = document.getElementById("gameHistoryList") as HTMLUListElement;
	if (!historyList) return;

	api.getMatchHistory(userId)
	.then((historyEntries: MatchHistory[]) => {
		historyList.innerHTML = "";
		historyEntries.forEach(({ date, type, result }) => {
		const listItem = document.createElement("li");
		let unicode = result === "win" ? "✅" : "❌";
		listItem.textContent = `${new Date(date).toLocaleString()} - ⚔️ ${getTranslation(type)} : ${unicode} ${getTranslation(result)}`;
		historyList.appendChild(listItem);
		});
	})
	.catch((error) => {
		console.error("Error updating history UI:", error.message);
	});
}
