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
  for (let i = 0; i < 50; i++) {   // increased to 50
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

// ---------------- YouTube ----------------
async function fetchVideoStats(videoIds) {
  const statsEndpoint = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds.join(",")}&key=${YOUTUBE_API_KEY}`;
  const res = await fetch(statsEndpoint);
  const data = await res.json();
  return data.items.reduce((map, item) => {
    map[item.id] = item.statistics;
    return map;
  }, {});
}

async function searchYouTube(query) {
  const endpoint = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=50&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`;
  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    if (!data.items?.length) return resultsDiv.innerHTML = "<p>No videos found.</p>";

    const videoIds = data.items.map(item => item.id.videoId);
    const stats = await fetchVideoStats(videoIds);

    let scoredVideos = data.items.map(item => {
      const s = stats[item.id.videoId] || {};
      const views = parseInt(s.viewCount || 0);
      const likes = parseInt(s.likeCount || 0);
      const score = (0.6 * views) + (0.4 * likes);
      return { ...item, score };
    });

    scoredVideos.sort((a, b) => b.score - a.score);

    resultsDiv.innerHTML = "";
    scoredVideos.forEach((item, idx) => {
      const title = item.snippet.title;
      const thumbnail = item.snippet.thumbnails.medium.url;
      const channel = item.snippet.channelTitle;
      const videoUrl = `https://www.youtube.com/watch?v=${item.id.videoId}`;
      resultsDiv.innerHTML += `
        <div class="result-card">
          <a href="${videoUrl}" target="_blank">
            <img src="${thumbnail}" alt="${title}">
            <h3>${title}</h3>
            <p>${channel}</p>
            <p><strong>Rank ${idx + 1}</strong></p>
          </a>
        </div>
      `;
    });
  } catch {
    resultsDiv.innerHTML = "<p>Error fetching videos.</p>";
  }
}

// ---------------- GitHub ----------------
async function searchGitHub(query) {
  const endpoint = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=50`; // 50
  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    if (!data.items?.length) return resultsDiv.innerHTML = "<p>No repositories found.</p>";

    let scoredRepos = data.items.map(repo => {
      const stars = repo.stargazers_count || 0;
      const forks = repo.forks_count || 0;
      const score = (0.7 * stars) + (0.3 * forks);
      return { ...repo, score };
    });

    scoredRepos.sort((a, b) => b.score - a.score);

    resultsDiv.innerHTML = "";
    scoredRepos.forEach((repo, idx) => {
      const desc = repo.description ? repo.description.replace(/</g, "&lt;").substring(0, 150) : 'No description';
      resultsDiv.innerHTML += `
        <div class="result-card">
          <a href="${repo.html_url}" target="_blank">
            <h3>${repo.full_name}</h3>
            <p>${desc}...</p>
            <p><strong>Rank ${idx + 1}</strong></p>
          </a>
        </div>
      `;
    });
  } catch {
    resultsDiv.innerHTML = "<p>Error fetching GitHub repos.</p>";
  }
}

// ---------------- arXiv ----------------
async function searchPapers(query) {
  const endpoint = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=50`; // 50
  try {
    const res = await fetch(endpoint);
    const text = await res.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");
    const entries = xmlDoc.getElementsByTagName("entry");
    if (!entries.length) return resultsDiv.innerHTML = "<p>No research papers found.</p>";

    let scoredPapers = Array.from(entries).map(entry => {
      const title = entry.getElementsByTagName("title")[0].textContent;
      const link = entry.getElementsByTagName("id")[0].textContent;
      const summary = entry.getElementsByTagName("summary")[0].textContent;
      const published = entry.getElementsByTagName("published")[0].textContent;
      const year = new Date(published).getFullYear();
      const currentYear = new Date().getFullYear();
      const recencyScore = 1 / (currentYear - year + 1);
      return { title, link, summary, score: recencyScore };
    });

    scoredPapers.sort((a, b) => b.score - a.score);

    resultsDiv.innerHTML = "";
    scoredPapers.forEach((paper, idx) => {
      resultsDiv.innerHTML += `
        <div class="result-card">
          <a href="${paper.link}" target="_blank">
            <h3>${paper.title}</h3>
            <p>${paper.summary.slice(0, 150)}...</p>
            <p><strong>Rank ${idx + 1}</strong></p>
          </a>
        </div>
      `;
    });
  } catch {
    resultsDiv.innerHTML = "<p>Error fetching papers.</p>";
  }
}

// ---------------- Kaggle ----------------
async function searchKaggle(query) {
  const auth = btoa(`${KAGGLE_USERNAME}:${KAGGLE_KEY}`);
  const pageSize = 20; // Kaggle API max per page
  const totalNeeded = 50; 
  let allResults = [];

  try {
    // Calculate how many pages we need
    const pages = Math.ceil(totalNeeded / pageSize);

    for (let page = 1; page <= pages; page++) {
      const endpoint = `https://www.kaggle.com/api/v1/datasets/list?search=${encodeURIComponent(query)}&pageSize=${pageSize}&page=${page}`;
      const res = await fetch(endpoint, {
        headers: {
          "Authorization": `Basic ${auth}`
        }
      });

      if (!res.ok) throw new Error("Failed to fetch datasets");
      const data = await res.json();

      if (!data.length) break; // stop if no more datasets
      allResults = allResults.concat(data);

      if (allResults.length >= totalNeeded) break;
    }

    if (!allResults.length) return resultsDiv.innerHTML = "<p>No datasets found.</p>";

    // Keep only 50 max
    allResults = allResults.slice(0, totalNeeded);

    let scoredDatasets = allResults.map(ds => {
      const downloads = ds.downloadCount || 0;
      const usability = ds.usabilityRating || 0;
      const score = (0.5 * downloads) + (0.5 * usability * 1000);
      return { ...ds, score };
    });

    scoredDatasets.sort((a, b) => b.score - a.score);

    resultsDiv.innerHTML = "";
    scoredDatasets.forEach((ds, idx) => {
      const title = ds.title || "Untitled Dataset";
      const desc = ds.subtitle || "No description";
      const link = `https://www.kaggle.com/datasets/${ds.ref}`;
      resultsDiv.innerHTML += `
        <div class="result-card">
          <a href="${link}" target="_blank">
            <h3>${title}</h3>
            <p>${desc.slice(0, 150)}...</p>
            <p><strong>Rank ${idx + 1}</strong></p>
          </a>
        </div>
      `;
    });
  } catch {
    resultsDiv.innerHTML = "<p>Error fetching datasets.</p>";
  }
}
