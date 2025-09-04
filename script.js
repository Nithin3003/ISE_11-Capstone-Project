const searchInput = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");

function search(type) {
  const query = searchInput.value.trim();
  if (!query) return alert("Enter a topic to search.");
  showSkeleton();
  if (type === 'videos') searchYouTube(query);
  if (type === 'code') searchGitHub(query);
  if (type === 'papers') searchPapers(query);
  if (type === 'datasets') searchKaggle(query);
}

function showSkeleton() {
  resultsDiv.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    const skeleton = document.createElement("div");
    skeleton.classList.add("result-card");
    skeleton.innerHTML = `
      <div class="skeleton" style="height:150px;"></div>
      <div class="skeleton skeleton-text" style="width:80%;"></div>
      <div class="skeleton skeleton-text" style="width:60%;"></div>
    `;
    resultsDiv.appendChild(skeleton);
  }
}

// YouTube API Search
async function searchYouTube(query) {
  const endpoint = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=12&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`;
  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    resultsDiv.innerHTML = "";
    if (data.items?.length) {
      data.items.forEach(item => {
        const videoId = item.id.videoId;
        const title = item.snippet.title;
        const thumbnail = item.snippet.thumbnails.medium.url;
        const channel = item.snippet.channelTitle;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        resultsDiv.innerHTML += `
          <div class="result-card">
            <a href="${videoUrl}" target="_blank">
              <img src="${thumbnail}" alt="${title}">
              <h3>${title}</h3>
              <p>${channel}</p>
            </a>
          </div>
        `;
      });
    } else {
      resultsDiv.innerHTML = "<p>No videos found.</p>";
    }
  } catch {
    resultsDiv.innerHTML = "<p>Error fetching videos.</p>";
  }
}

// GitHub API Search
async function searchGitHub(query) {
  const endpoint = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc`;
  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    resultsDiv.innerHTML = "";
    if (data.items?.length) {
      data.items.slice(0, 10).forEach(repo => {
        const desc = repo.description ? repo.description.replace(/</g, "&lt;").substring(0, 150) : 'No description';
        resultsDiv.innerHTML += `
          <div class="result-card">
            <a href="${repo.html_url}" target="_blank">
              <h3>${repo.full_name}</h3>
              <p>${desc}...</p>
            </a>
          </div>
        `;
      });
    } else {
      resultsDiv.innerHTML = "<p>No repositories found.</p>";
    }
  } catch {
    resultsDiv.innerHTML = "<p>Error fetching GitHub repos.</p>";
  }
}

// arXiv API Search
async function searchPapers(query) {
  const endpoint = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=5`;
  try {
    const res = await fetch(endpoint);
    const text = await res.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");
    const entries = xmlDoc.getElementsByTagName("entry");
    resultsDiv.innerHTML = "";
    if (entries.length) {
      Array.from(entries).forEach(entry => {
        const title = entry.getElementsByTagName("title")[0].textContent;
        const link = entry.getElementsByTagName("id")[0].textContent;
        const summary = entry.getElementsByTagName("summary")[0].textContent;
        resultsDiv.innerHTML += `
          <div class="result-card">
            <a href="${link}" target="_blank">
              <h3>${title}</h3>
              <p>${summary.slice(0, 150)}...</p>
            </a>
          </div>
        `;
      });
    } else {
      resultsDiv.innerHTML = "<p>No research papers found.</p>";
    }
  } catch {
    resultsDiv.innerHTML = "<p>Error fetching papers.</p>";
  }
}

// Kaggle API Search (using API key from config.js)
async function searchKaggle(query) {
  const auth = btoa(`${KAGGLE_USERNAME}:${KAGGLE_KEY}`);
  const endpoint = `https://www.kaggle.com/api/v1/datasets/list?search=${encodeURIComponent(query)}&pageSize=8`;

  try {
    const res = await fetch(endpoint, {
      headers: {
        "Authorization": `Basic ${auth}`
      }
    });

    if (!res.ok) throw new Error("Failed to fetch datasets");
    const data = await res.json();

    resultsDiv.innerHTML = "";
    if (data.length) {
      data.forEach(ds => {
        const title = ds.title || "Untitled Dataset";
        const desc = ds.subtitle || "No description";
        const link = `https://www.kaggle.com/datasets/${ds.ref}`;
        resultsDiv.innerHTML += `
          <div class="result-card">
            <a href="${link}" target="_blank">
              <h3>${title}</h3>
              <p>${desc.slice(0, 150)}...</p>
            </a>
          </div>
        `;
      });
    } else {
      resultsDiv.innerHTML = "<p>No datasets found.</p>";
    }
  } catch {
    resultsDiv.innerHTML = "<p>Error fetching datasets.</p>";
  }
}
