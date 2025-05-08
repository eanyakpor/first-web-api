async function fetchAlbums() {
  console.log("Fetching albums...");  

  // fetch api end point that returns albums 
  const res = await fetch(`http://localhost:8080/me/albums`);
  const data = await res.json();
  
  const container = document.getElementById('album-container');
  container.innerHTML = '';
  console.log('d',data)
  // parsing through JSON returned from the api 
  data.items.forEach(item => {
    const album = item.album;
    const card = AlbumCard(album);
    const div = document.createElement('div');
    div.className = 'album-card';
  
    div.innerHTML = `
      <img src="${album.images[0]?.url}" alt="${album.name}">
      <h3>${album.name}</h3>
      <p>${album.artists.map(artist => artist.name).join(', ')}</p>
    `;
  
    container.appendChild(div);
  });
}
// html of what the returned album card would look like 
function AlbumCard(album) {
  const div = document.createElement('div');
  div.className = 'album-card';

  div.innerHTML = `
    <img src="${album.images[0]?.url}" alt="${album.name}">
    <h3>${album.name}</h3>
    <p>${album.artists.map(artist => artist.name).join(', ')}</p>
  `;

  return div;
}
// window.fetchAlbums = fetchAlbums;
window.fetchAlbums = fetchAlbums;
