let allGames = [];

fetch("data/games.json")
  .then(res => res.json())
  .then(data => {
    allGames = data;
    createFilters(data);
    renderGames("All");
  })
  .catch(err => {
    console.error("Games JSON load error:", err);
  });

function createFilters(games) {
  const filterBar = document.getElementById("filterBar");
  filterBar.innerHTML = "";

  const categories = ["All", ...new Set(games.map(g => g.category))];

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.onclick = () => renderGames(cat);
    filterBar.appendChild(btn);
  });
}

function renderGames(category) {
  const grid = document.getElementById("gamesGrid");
  grid.innerHTML = "";

  const filteredGames =
    category === "All"
      ? allGames
      : allGames.filter(g => g.category === category);

  filteredGames.forEach(game => {
    const div = document.createElement("div");
    div.className = "game-card";

    div.innerHTML = `
      <h3>${game.title}</h3>
      <p>${game.description}</p>
      <span class="tag">${game.category}</span><br><br>
      <a href="${game.link}">Play</a>
    `;

    grid.appendChild(div);
  });
}
