const { decay } = window.popmotion;

async function fetchAlbums() {
  console.log("Fetching albums...");  

  // fetch api end point that returns albums 
  const res = await fetch(`http://localhost:8080/me/albums`);
  const data = await res.json();
  
  const container = document.getElementById('album-container');
  container.innerHTML = '';
  console.log('d', data);
  
  // parsing through JSON returned from the api 
  data.items.forEach(item => {
    const album = item.album;
    // Create the card using the AlbumCard function and append directly
    const card = AlbumCard(album);
    container.appendChild(card); // Append the card returned from AlbumCard
  });
}

// Create and return the album card with animations
function AlbumCard(album) {
  const div = document.createElement('div');
  div.className = 'album-card';

  div.innerHTML = `
    <img src="${album.images[0]?.url}" alt="${album.name}">
    <h3>${album.name}</h3>
    <p>${album.artists.map(artist => artist.name).join(', ')}</p>
  `;

  // Set initial styles for animation
  div.style.transform = 'translateX(200px)';
  div.style.opacity = '0';
  
  // Use setTimeout to ensure the animation runs after the element is in the DOM
  setTimeout(() => {
    // Animate it into place with decay
    decay({
      velocity: -300,  // starting velocity toward left
      from: 200,       // start position (matches translateX)
      timeConstant: 300,
      restDelta: 0.5
    }).start({
      update: (v) => {
        div.style.transform = `translateX(${v}px)`;
        div.style.opacity = `${1 - Math.abs(v) / 200}`; // fade in
      },
      complete: () => {
        div.style.transform = 'translateX(0)';
        div.style.opacity = '1';
      }
    });
  }, 10);

  return div;
}

window.fetchAlbums = fetchAlbums;