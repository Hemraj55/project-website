let allBlogs = [];

fetch("data/blogs.json")
  .then(res => res.json())
  .then(data => {
    allBlogs = data;
    createFilters(data);
    renderBlogs("All");
  })
  .catch(err => {
    console.error("Blogs JSON load error:", err);
  });

function createFilters(blogs) {
  const filterBar = document.getElementById("filterBar");
  filterBar.innerHTML = "";

  const categories = ["All", ...new Set(blogs.map(b => b.category))];
  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.onclick = () => renderBlogs(cat);
    filterBar.appendChild(btn);
  });
}

function renderBlogs(category) {
  const grid = document.getElementById("blogsGrid");
  grid.innerHTML = "";

  const filteredBlogs =
    category === "All"
      ? allBlogs
      : allBlogs.filter(b => b.category === category);

  filteredBlogs.forEach(blog => {
    const div = document.createElement("div");
    div.className = "blog-card";

    div.innerHTML = `
      <h3>${blog.title}</h3>
      <p>${blog.description}</p>
      <span class="tag">${blog.category}</span><br><br>
      <a href="${blog.link}">Go</a>
    `;

    grid.appendChild(div);
  });
}
