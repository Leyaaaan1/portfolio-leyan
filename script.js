// Imports styles
import '/src/style.css';

// GitHub token from environment variable
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';

// Configuration
const CONFIG = {
    GITHUB_USERNAME: 'Leyaaaan1',
    API_BASE_URL: 'https://api.github.com'
};

// Variables to track current image state
let currentImageIndex = 0;
let currentRepoImages = [];

// Import other images similarly or use the URL constructor for dynamic imports

// Then update your projectImages object
const projectImages = {
    'RidersHub': [

        'src/assets/rider/rideui1.png',
        'src/assets/rider/rideui2.png',
        'src/assets/rider/rideui3.png',
        'src/assets/rider/rideui4.png',
        'src/assets/rider/rideui5.png',
        'src/assets/rider/rideui6.png',
        'src/assets/rider/rideui7.png',
        'src/assets/rider/rideui8.png',
    ],
    'FreeFall Simulations': [
        'src/assets/freefall/riders-hub-3.jpg',

    ],
    'OnlyJobs Web': [
        'src/assets/onlyjobs/riders-hub-3.jpg',

    ]
};
// Initialize once DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const username = 'Leyaaaan1';

    // Initialize GitHub data
    updateGitHubProfileSection(username);

    // Always fetch all repositories
    fetchGitHubRepositories(username);
    fetchGitHubContributions(username);
    initRepoTabs();

    // Add image navigation listeners
    document.getElementById('prev-image-btn').addEventListener('click', prevProjectImage);
    document.getElementById('next-image-btn').addEventListener('click', nextProjectImage);

    // Add smooth scrolling for anchor links
;
});

async function fetchGitHubRepositories() {
    const reposElement = document.querySelector('.github-repos');
    if (!reposElement) return;

    reposElement.innerHTML = '<div class="loading">Loading repositories...</div>';

    const repoLinks = [
        'https://github.com/Leyaaaan1/RidersHub',  // Make sure this is first to be featured
        'https://github.com/Leyaaaan1/FreeFallSimulations',
        'https://github.com/bakaraw/OnlyJobsWeb',
        'https://github.com/bakaraw/QuizWebsite',
        'https://github.com/bakaraw/OnlyJobs',
        'https://github.com/Leyaaaan1/busnavs'
    ];

    try {
        const repoData = await Promise.all(
            repoLinks.map(async (link, index) => {
                const match = link.match(/github\.com\/([^\/]+)\/([^\/]+)/);
                if (!match) return null;
                const owner = match[1];
                const repo = match[2];
                const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
                    headers: GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {}
                });
                if (!response.ok) return null;
                const repoInfo = await response.json();

                // Fetch languages
                const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
                    headers: GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {}
                });
                let topLanguages = [];
                if (langRes.ok) {
                    const langs = await langRes.json();
                    topLanguages = Object.entries(langs)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 2)
                        .map(([lang]) => lang);
                }
                repoInfo.topLanguages = topLanguages;

                // If this is RidersHub, use it as the featured repository
                if (repo === 'RidersHub') {
                    populateFeaturedRepository(repoInfo);
                }

                return repoInfo;
            })
        );

        const validRepos = repoData.filter(Boolean);
        if (validRepos.length > 0) {
            displayGitHubRepos(validRepos, reposElement);
        } else {
            reposElement.innerHTML = `
        <div class="github-repo-error">
          <h4>Unable to load repositories</h4>
          <p>Check the repository links or try again later.</p>
        </div>
      `;
        }
    } catch (error) {
        console.error('Error fetching GitHub repositories:', error);
        reposElement.innerHTML = `
      <div class="github-repo-error">
        <h4>Error loading repositories</h4>
        <p>Please try again later.</p>
      </div>
    `;
    }
}

// Populate the featured repository section
async function populateFeaturedRepository(repoInfo) {
    // Update basic repository information
    document.getElementById('project-title').textContent = repoInfo.name || 'Unknown Project';
    document.getElementById('project-description').textContent = repoInfo.description || 'No description available';
    document.getElementById('project-stars').textContent = `⭐ ${repoInfo.stargazers_count || 0}`;
    document.getElementById('project-forks').textContent = `🍴 ${repoInfo.forks_count || 0}`;

    const updatedAt = new Date(repoInfo.updated_at);
    const formattedDate = updatedAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    document.getElementById('project-updated').textContent = `Updated: ${formattedDate}`;

    // Update repository link


    // Update technology tags
    const techElement = document.getElementById('project-tech');
    if (techElement && repoInfo.topLanguages) {
        techElement.innerHTML = repoInfo.topLanguages.map(lang =>
            `<span class="tech-tag">${lang}</span>`
        ).join('');
    }

    // Load project images
    loadProjectImages(repoInfo.name);

    // Fetch and display README content
    try {
        const readmeResponse = await fetch(`https://api.github.com/repos/${repoInfo.owner.login}/${repoInfo.name}/readme`, {
            headers: GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {}
        });

        if (readmeResponse.ok) {
            const readmeData = await readmeResponse.json();
            const readmeContent = atob(readmeData.content); // Decode base64 content

            // Display README content
            document.getElementById('project-readme').innerHTML = `<div class="readme-content">${readmeContent}</div>`;
        }
    } catch (error) {
        console.error('Error fetching README:', error);
        document.getElementById('project-readme').innerHTML = '<p class="readme-content">Unable to load README content.</p>';
    }
}

async function updateGitHubProfileSection(username) {
    const contributionsSection = document.querySelector('.github-contributions');
    if (!contributionsSection) return;

    try {
        const userResponse = await fetch(`https://api.github.com/users/${username}`, {
            headers: GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {}
        });

        if (userResponse.ok) {
            const userData = await userResponse.json();

            // Update profile info
            const profileInfoElement = document.getElementById('github-profile-info');
            if (profileInfoElement) {
                profileInfoElement.innerHTML = `
      <div class="github-profile-header fade-in" style="display: flex; gap: 24px; align-items: flex-start;">
        <img src="${userData.avatar_url}" alt="${userData.name || userData.login}" class="github-avatar" style="width: 96px; height: 96px; border-radius: 50%; object-fit: cover;">
        <div style="flex: 1;">
          <h4 style="margin: 0 0 4px 0;">${userData.name || userData.login}</h4>
          <p class="github-username" style="margin: 0 0 8px 0;">@${userData.login}</p>
          <div class="github-stats" style="display: flex; flex-direction: column; gap: 8px;">
          <div class="github-stat">
            <span class="stat-number">${userData.public_repos}</span>
            <span class="stat-label">Repositories</span>
          </div>
          <div class="github-stat">
            <span class="stat-number">${userData.followers}</span>
            <span class="stat-label">Followers</span>
          </div>
          <div class="github-stat">
            <span class="stat-number">${userData.following}</span>
            <span class="stat-label">Following</span>
          </div>
        </div>
        </div>
            <div class="github-stats-container" style="display: flex; flex-direction: column; gap: 8px; min-width: 300px;">
              <img src="https://github-readme-stats.vercel.app/api?username=Leyaaaan1&show_icons=true&theme=radical&locale=en"
                   alt="Leyaaaan1 GitHub stats" class="stats-image" style="width: 100%; min-width: 280px; max-width: 400px;" />
              <img src="https://github-readme-streak-stats.herokuapp.com/?user=Leyaaaan1&theme=radical"
                   alt="Leyaaaan1 streak stats" class="stats-image" style="width: 100%; min-width: 280px; max-width: 400px;" />
            </div>
          </div>
        `;
            }
        } else {
            console.error('Failed to fetch GitHub profile data');
        }
    } catch (error) {
        console.error('Error updating GitHub profile section:', error);
    }
}

function displayGitHubRepos(repos, reposElement) {
    if (repos.length === 0) {
        reposElement.innerHTML = '<p>No repositories found.</p>';
        return;
    }

    const reposHTML = repos.map(repo => {
        const updatedAt = new Date(repo.updated_at);
        const formattedDate = updatedAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const languages = repo.topLanguages && repo.topLanguages.length
            ? repo.topLanguages.map(lang => `<span class="repo-language">${lang}</span>`).join(' ')
            : (repo.language ? `<span class="repo-language">${repo.language}</span>` : '');

        return `
      <div class="github-repo fade-in">
        <h4><a href="${repo.html_url}" target="_blank">${repo.name}</a></h4>
        <p>${repo.description || 'No description available.'}</p>
        <div class="repo-details">
          ${languages}
          <span>Updated: ${formattedDate}</span>
          <span>⭐ ${repo.stargazers_count}</span>
          <span>🍴 ${repo.forks_count}</span>
        </div>
      </div>
    `;
    }).join('');

    reposElement.innerHTML = reposHTML;
}

async function fetchGitHubContributions(username) {
    const contributionsElement = document.querySelector('.github-contributions');
    if (!contributionsElement) return;

    try {
        const profileViewsElement = document.querySelector('.profile-views');
        if (profileViewsElement) {
            profileViewsElement.innerHTML = `<img src="https://komarev.com/ghpvc/?username=${username}&label=Profile%20views&color=0e75b6&style=flat" alt="${username}" />`;
        }

        // Update any elements showing contribution stats
        const totalElement = document.getElementById('total-contributions');
        const currentStreakElement = document.getElementById('current-streak');
        const longestStreakElement = document.getElementById('longest-streak');

        if (totalElement) totalElement.textContent = "See stats below";
        if (currentStreakElement) currentStreakElement.textContent = "See stats below";
        if (longestStreakElement) longestStreakElement.textContent = "See stats below";
    } catch (error) {
        console.error('Error fetching GitHub contributions:', error);
    }
}

const repoData = [
    { id: 0, name: 'RidersHub', repoPath: 'Leyaaaan1/RidersHub' },
    { id:1, name: 'OnlyJobs Web', repoPath: 'bakaraw/OnlyJobsWeb' },
    { id: 2, name: 'FreeFall Simulations', repoPath: 'Leyaaaan1/FreeFallSimulations' },
];

function initRepoTabs() {
    const tabs = document.querySelectorAll('.repo-tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const repoIndex = parseInt(this.getAttribute('data-repo'));

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Load the selected repository
            loadRepositoryData(repoIndex);
        });
    });

    // Load the first repository by default
    loadRepositoryData(0);
}

async function loadRepositoryData(repoIndex) {
    const repo = repoData[repoIndex];
    if (!repo) return;

    const [owner, repoName] = repo.repoPath.split('/');

    try {
        // Fetch repository data
        const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
            headers: GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {}
        });

        if (response.ok) {
            const repoInfo = await response.json();

            // Fetch languages
            const langRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/languages`, {
                headers: GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {}
            });

            let topLanguages = [];
            if (langRes.ok) {
                const langs = await langRes.json();
                topLanguages = Object.entries(langs)
                    .sort((a, b) => b[1] - a[1])
                    .map(([lang]) => lang); // Removed .slice(0, 2) to include all languages
            }

            repoInfo.topLanguages = topLanguages;

            // Update the UI with repository data
            updateRepositoryUI(repoInfo);

            // Fetch README content
            fetchReadmeContent(owner, repoName);
        }
    } catch (error) {
        console.error('Error loading repository data:', error);
    }
}

function updateRepositoryUI(repoInfo) {
    document.getElementById('project-title').textContent = repoInfo.name || 'Unknown Project';
    document.getElementById('project-description').textContent = repoInfo.description || 'No description available';
    document.getElementById('project-stars').textContent = `⭐ ${repoInfo.stargazers_count || 0}`;
    document.getElementById('project-forks').textContent = `🍴 ${repoInfo.forks_count || 0}`;

    const projectLink = document.getElementById('project-link');
    if (projectLink && repoInfo.html_url) {
        projectLink.href = repoInfo.html_url;
    }

    const updatedAt = new Date(repoInfo.updated_at);
    const formattedDate = updatedAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    document.getElementById('project-updated').textContent = `Updated: ${formattedDate}`;

    // Update technology tags
    const techElement = document.getElementById('project-tech');
    if (techElement && repoInfo.topLanguages) {
        techElement.innerHTML = repoInfo.topLanguages.map(lang =>
            `<span class="tech-tag">${lang}</span>`
        ).join('');
    }

    // Load project images instead of resetProjectImages (which was undefined)
    loadProjectImages(repoInfo.name);
}

// Fetch README content
async function fetchReadmeContent(owner, repoName) {
    try {
        const readmeResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/readme`, {
            headers: GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {}
        });

        if (readmeResponse.ok) {
            const readmeData = await readmeResponse.json();
            const readmeContent = atob(readmeData.content); // Decode base64 content

            // Use GitHub's API to render the markdown
            const renderResponse = await fetch('https://api.github.com/markdown', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {})
                },
                body: JSON.stringify({
                    text: readmeContent,
                    mode: 'gfm', // GitHub Flavored Markdown
                    context: `${owner}/${repoName}`
                })
            });

            if (renderResponse.ok) {
                const renderedHTML = await renderResponse.text();

                // Add GitHub markdown styles if they don't exist
                if (!document.getElementById('github-markdown-css')) {
                    const style = document.createElement('link');
                    style.id = 'github-markdown-css';
                    style.rel = 'stylesheet';
                    style.href = 'https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.1.0/github-markdown.min.css';
                    document.head.appendChild(style);
                }

                document.getElementById('project-readme').innerHTML = `
                    <div class="readme-content markdown-body">
                        ${renderedHTML}
                    </div>
                `;

                // Fix relative links in README to point to GitHub
                fixReadmeLinks(document.getElementById('project-readme'), owner, repoName);
            } else {
                throw new Error('Failed to render markdown');
            }
        }
    } catch (error) {
        console.error('Error fetching or rendering README:', error);
        document.getElementById('project-readme').innerHTML = '<p class="readme-content">Unable to load README content.</p>';
    }
}

// Helper function to fix relative links in README
function fixReadmeLinks(readmeElement, owner, repoName) {
    const links = readmeElement.querySelectorAll('a');
    const images = readmeElement.querySelectorAll('img');
    const baseUrl = `https://github.com/${owner}/${repoName}/blob/main/`;
    const rawBaseUrl = `https://raw.githubusercontent.com/${owner}/${repoName}/main/`;

    // Fix links
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('#')) {
            link.href = baseUrl + href;
        }
    });

    // Fix images
    images.forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http')) {
            img.src = rawBaseUrl + src;
        }
    });
}// Change to a specific project image
function changeProjectImage(index) {
    if (!currentRepoImages || currentRepoImages.length === 0) return;

    // Make sure index is within bounds
    if (index < 0) index = currentRepoImages.length - 1;
    if (index >= currentRepoImages.length) index = 0;

    currentImageIndex = index;

    // Update main image
    const mainImage = document.getElementById('project-main-image');
    const placeholder = document.getElementById('project-image-placeholder');

    // Set new image source
    mainImage.src = currentRepoImages[index];

    // Handle image loading
    mainImage.onload = function() {
        mainImage.style.display = 'block';
        placeholder.style.display = 'none';
    };

    mainImage.onerror = function() {
        console.error(`Failed to load image: ${currentRepoImages[index]}`);
        mainImage.style.display = 'none';
        placeholder.style.display = 'flex';
        placeholder.innerHTML = `
            <h3>Image Not Found</h3>
            <p>Could not load image ${index + 1}</p>
        `;
    };

    // Update thumbnails active state
    const thumbnails = document.querySelectorAll('.thumbnail-placeholder');
    thumbnails.forEach((thumb, i) => {
        if (i === index) {
            thumb.classList.add('active');
        } else {
            thumb.classList.remove('active');
        }
    });
}
// Navigate to previous project image
function prevProjectImage() {
    changeProjectImage(currentImageIndex - 1);
}

// Navigate to next project image
function nextProjectImage() {
    changeProjectImage(currentImageIndex + 1);
}

// Update the loadProjectImages function
function loadProjectImages(repoName) {
    const images = projectImages[repoName];

    // If no images for this repo, hide the image container and show placeholder
    if (!images || images.length === 0) {
        const mainImage = document.getElementById('project-main-image');
        const placeholder = document.getElementById('project-image-placeholder');
        const thumbnailsContainer = document.getElementById('project-thumbnails');

        mainImage.style.display = 'none';
        placeholder.style.display = 'flex';
        thumbnailsContainer.innerHTML = '';

        currentRepoImages = [];
        currentImageIndex = 0;
        return;
    }

    // Store current repo images for navigation
    currentRepoImages = images;
    currentImageIndex = 0;

    // Update main image
    const mainImage = document.getElementById('project-main-image');
    const placeholder = document.getElementById('project-image-placeholder');

    // Set the image source and alt text
    mainImage.src = images[0];
    mainImage.alt = `${repoName} screenshot`;

    // Add error handling for image loading
    mainImage.onload = function() {
        // Image loaded successfully - show it and hide placeholder
        mainImage.style.display = 'block';
        placeholder.style.display = 'none';
    };

    mainImage.onerror = function() {
        // Image failed to load - keep placeholder visible and log error
        console.error(`Failed to load image: ${images[0]}`);
        mainImage.style.display = 'none';
        placeholder.style.display = 'flex';
        placeholder.innerHTML = `
            <h3>Image Not Found</h3>
            <p>Could not load project images for ${repoName}</p>
        `;
    };

    // Clear and update thumbnails
    const thumbnailsContainer = document.getElementById('project-thumbnails');
    thumbnailsContainer.innerHTML = '';

    // Create thumbnails for each image
    images.forEach((img, index) => {
        const thumb = document.createElement('div');
        thumb.className = index === 0 ? 'thumbnail-placeholder active' : 'thumbnail-placeholder';
        thumb.textContent = `Image ${index + 1}`;

        // Add click event to switch to this image
        thumb.addEventListener('click', () => changeProjectImage(index));

        thumbnailsContainer.appendChild(thumb);
    });

    // Show/hide navigation buttons based on number of images
    const prevBtn = document.getElementById('prev-image-btn');
    const nextBtn = document.getElementById('next-image-btn');

    if (images.length > 1) {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
    } else {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    }
}

// Also update the changeProjectImage function to handle image loading properly
