// featured.js

document.addEventListener('DOMContentLoaded', () => {

    // Get references to the main containers
    const featuredPlaylistContainer = document.getElementById('featured-playlist');
    const featuredSongsContainer = document.getElementById('featured-songs');
    let allPlaylistsData = [];
    let allSongsData = []; 

    function createPlaylistCardElement(playlist) {
        const card = document.createElement('div');
        card.classList.add('featured-playlist-card'); 
        card.dataset.playlistId = playlist.playlistID; // Store playlist ID for future reference

        // Populate card HTML with actual playlist data
        // Uses property names from your latest JSON sample (playlist_art, playlist_name, etc.)
        card.innerHTML = `
            <img src="${playlist.playlist_art}" alt="${playlist.playlist_name} cover" class="featured-image">
            <h3>${playlist.playlist_name}</h3> 
            <p class="playlist-author">by ${playlist.playlist_author}</p>
            <p class="playlist-description">${playlist.description}</p>
            <div class="likes-section">
                <span class="like-icon">&#x2764;</span> <!-- Heart icon -->
                <span class="like-count">${playlist.likeCount}</span>
            </div>
        `;
        return card; // Return the created element
    }

    // Function to create a single song item element in memory
    function createSongItemElement(song) {
        const songItem = document.createElement('div');
        songItem.classList.add('song-item');
        songItem.dataset.songId = song.songID;

        songItem.innerHTML = `
            <img src="${song.image || 'https://placehold.co/80x80/cccccc/ffffff?text=No+Img'}" alt="${song.title} album art" class="song-image">
            <div class="song-info">
                <h4 class="song-title">${song.title}</h4>
                <p class="song-artist">${song.artist}</p>
                <p class="song-album">${song.album}</p>
                <p class="song-duration">${song.duration}</p>  
            </div>
        `;
        return songItem;
    }

    // Function to return a random index from 0 to (array length - 1)
    // This function now correctly relies on 'allPlaylistsData' being populated
    function returnRandomPlaylistIndex() {
        if (allPlaylistsData && allPlaylistsData.length > 0) {
            const randomIndex = Math.floor(Math.random() * allPlaylistsData.length);
            return randomIndex; // Returns the index
        }
        console.warn("No playlists data available to pick a random index.");
        return null;
    }

    // Main function to display the chosen featured playlist and its songs
    function displayFeaturedContent() {
        const randomIndex = returnRandomPlaylistIndex(); // Get the random index

        if (randomIndex !== null) {
            const randomPlaylist = allPlaylistsData[randomIndex]; // Use the index to get the playlist object

            // --- Display the featured playlist card ---
            featuredPlaylistContainer.innerHTML = ''; 
            const playlistCard = createPlaylistCardElement(randomPlaylist);
            featuredPlaylistContainer.appendChild(playlistCard);

            // --- Display the songs for the featured playlist ---
            featuredSongsContainer.innerHTML = ''; 

            if (randomPlaylist.songs && randomPlaylist.songs.length > 0) {
                // Iterate through songs nested directly within the playlist object
                randomPlaylist.songs.forEach(song => {
                    const songItem = createSongItemElement(song);
                    featuredSongsContainer.appendChild(songItem);
                });
            } else {
                featuredSongsContainer.innerHTML = '<p class="text-gray-500">This playlist has no songs listed.</p>';
            }
        } else {
            // Handle case where no playlists are available after fetching
            featuredPlaylistContainer.innerHTML = '<p class="text-gray-500">No featured playlist could be loaded. Please check data source.</p>';
            featuredSongsContainer.innerHTML = ''; // Ensure songs section is also cleared
        }
    }

    // Initial data fetch and render (MOVED AND MODIFIED)
    fetch('data/data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Store fetched data into our script-level variables
            if (data && Array.isArray(data.playlists)) {
                allPlaylistsData = data.playlists; // Store all playlist data
            } else {
                console.error("Invalid data format: 'playlists' array not found.");
                allPlaylistsData = []; // Ensure it's an empty array if data is malformed
            }

            // If your data.json also contains a top-level 'songs' array (e.g., for 'All' page)
            if (data && Array.isArray(data.songs)) {
                allSongsData = data.songs; 
            } else {
                // If songs are only nested within playlists, this block might be unnecessary or `allSongsData` can remain empty
                console.warn("Top-level 'songs' array not found in data.json. Assuming songs are nested within playlists.");
                allSongsData = [];
            }
            
            // Now that data is loaded and available, display the featured content
            // This ensures allPlaylistsData is populated before returnRandomPlaylistIndex is called.
            displayFeaturedContent(); 
        })
        .catch(error => {
            console.error('Error fetching playlist data:', error);
            // Display an error message on the page if data loading fails
            if (featuredPlaylistContainer) { // Check if element exists before manipulating
                featuredPlaylistContainer.innerHTML = '<p>Failed to load playlists. Please try again later. (Error: ' + error.message + ')</p>';
            }
            if (featuredSongsContainer) {
                featuredSongsContainer.innerHTML = ''; // Clear song list as well
            }
        });
});
