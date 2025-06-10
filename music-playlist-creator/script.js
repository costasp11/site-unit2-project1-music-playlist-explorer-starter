// script.js

document.addEventListener('DOMContentLoaded', () => {
    const playlistGrid = document.getElementById('featured-playlists');
    const modal = document.getElementById('festivalModal');
    const closeButton = document.getElementsByClassName('close')[0];

    // Get elements for modal content
    const modalPlaylistImage = document.getElementById('playlistImage');
    const modalPlaylistTitle = document.getElementById('playlistTitle');
    const modalCreatorName = document.getElementById('creatorName');
    const modalSongContainer = document.querySelector('.song-container'); // This is where songs are rendered

    // Get the shuffle button reference 
    const shuffleButton = document.getElementById('shuffleButton');

    // Variable to store the playlist currently being displayed in the modal
    let currentPlaylistBeingViewed = null; 

    // Function to create a single playlist card in memory
    function createPlaylistCard(playlist) {
        const card = document.createElement('div');
        card.classList.add('playlist-card');
        card.dataset.playlistId = playlist.playlistID;

        // Updated innerHTML with .likes-section, .like-icon, and .like-count
        card.innerHTML = `
            <img src="${playlist.playlist_art}" alt="${playlist.playlist_name} cover">
            <div class="playlist-info-card">
                <h3>${playlist.playlist_name}</h3>
                <p class="playlist-author-card">By ${playlist.playlist_author}</p>
                <div class="likes-section">
                    <span class="like-icon" data-playlist-id="${playlist.playlistID}">&#x2665;</span>
                    <span class="like-count" id="like-count-${playlist.playlistID}">${playlist.likeCount}</span>
                </div>
            </div>
        `;

        const likeIcon = card.querySelector('.like-icon');
        const likeCountSpan = card.querySelector(`#like-count-${playlist.playlistID}`);

        likeIcon.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent modal from opening when liking

            const currentLikes = parseInt(likeCountSpan.innerText);
            const playlistId = likeIcon.dataset.playlistId;
            const targetPlaylist = window.allPlaylistsData.find(p => p.playlistID === playlistId);

            if (likeIcon.classList.contains('liked')) {
                likeIcon.classList.remove('liked');
                likeCountSpan.innerText = currentLikes - 1;
                if (targetPlaylist) {
                    targetPlaylist.likeCount--;
                }
            } else {
                likeIcon.classList.add('liked');
                likeCountSpan.innerText = currentLikes + 1;
                if (targetPlaylist) {
                    targetPlaylist.likeCount++;
                }
            }
        });

        // add event listener to open modal on card click
        card.addEventListener('click', () => openPlaylistModal(playlist));
        return card;
    }

    // Function to render all playlists 
    function renderPlaylists(playlists) {
        playlistGrid.innerHTML = '';
        if (playlists.length === 0) {
            playlistGrid.innerHTML = '<p>No playlists added yet.</p>';
            return;
        }
        // Iterate through JSON file playlists data
        playlists.forEach(playlist => {
            const card = createPlaylistCard(playlist);
            playlistGrid.appendChild(card);
        });
    }

    // Initial data fetch and render (remains the same)
    fetch('data/data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && Array.isArray(data.playlists)) {
                renderPlaylists(data.playlists);
                window.allPlaylistsData = data.playlists; // Store all playlist data globally
            } else {
                throw new Error("Invalid data format: 'playlists' array not found.");
            }
        })
        .catch(error => {
            console.error('Error fetching playlist data:', error);
            playlistGrid.innerHTML = '<p>Failed to load playlists. Please try again later. (Error: ' + error.message + ')</p>';
        });


    // --- MODAL FUNCTIONS ---

    // Helper function to render songs in the modal given an array of songs
    function renderSongsInModal(songsToRender, container) {
        container.innerHTML = ''; // Clear existing songs

        if (songsToRender && songsToRender.length > 0) {
            songsToRender.forEach(song => {
                const songItem = document.createElement('div');
                songItem.classList.add('song-item');
                songItem.innerHTML = `
                    <img src="assets/img/song.png" alt="${song.title} thumbnail" class="song-thumbnail">
                    <div class="song-details">
                        <p class="song-title">${song.title}</p>
                        <p class="artist-album">${song.artist} &bull; ${song.album || 'Unknown Album'}</p>
                    </div>
                    <span class="song-duration">${song.duration}</span>
                `;
                container.appendChild(songItem);
            });
        } else {
            container.innerHTML = '<p>No songs available for this playlist.</p>';
        }
    }

    // Function to open the playlist modal
    function openPlaylistModal(playlist) {
        // Set the currently viewed playlist for the shuffle button's access
        currentPlaylistBeingViewed = playlist;

        // Update modal header content
        modalPlaylistImage.src = playlist.playlist_art;
        modalPlaylistImage.alt = playlist.playlist_name + " cover";
        modalPlaylistTitle.innerText = playlist.playlist_name;
        modalCreatorName.innerText = playlist.playlist_author;

        // Populate songs initially using the helper function
        renderSongsInModal(playlist.songs, modalSongContainer);

        modal.style.display = 'block'; // Display the modal
    }

    // --- SONG FUNCTIONS ---
    // Function to shuffle songs in the playlist (data-driven)
    function shuffleSongs() {
        if (currentPlaylistBeingViewed && currentPlaylistBeingViewed.songs) {
            
            // Math.random() - 0.5 is a a simple way to get random sort order
            const shuffledSongsArray = [...currentPlaylistBeingViewed.songs].sort(() => Math.random() - 0.5);

            // Update the actual playlist's songs array with the shuffled order
            // This ensures if you close and reopen modal, it might retain the new order
            currentPlaylistBeingViewed.songs = shuffledSongsArray;

            // Re-render the songs in the modal using the new shuffled order
            renderSongsInModal(currentPlaylistBeingViewed.songs, modalSongContainer);
        }
    }

    // --- Implement Shuffle Button Click ---
    shuffleButton.addEventListener('click', shuffleSongs); // Attach the shuffleSongs function directly

    // Close modal when close button is clicked (remains the same)
    closeButton.onclick = function() {
        modal.style.display = 'none';
    }

    // Close modal when outside the modal content is clicked (remains the same)
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
});


