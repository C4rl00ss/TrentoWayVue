const HOST = import.meta.env.VITE_API_BASE_URL


export async function posizionaSegnaposti(map) {
  if (!map) return;

  const response = await fetch(`${HOST}/api/v1/segnaposti`);
  const segnaposti = await response.json();

  // Una sola finestra info per tutti i marker
  const infoWindow = new google.maps.InfoWindow();

  segnaposti.forEach(segnaposto => {
    const marker = new google.maps.Marker({
      position: {
        lat: segnaposto.coordinate.lat,
        lng: segnaposto.coordinate.lng,
      },
      map,
      title: segnaposto.nome,
      icon: {
        url: `${HOST}/target.svg`,
        scaledSize: new google.maps.Size(40, 40)
      }
    });

    const contentString = `
      <div style="max-width: 250px;">
        <h3>${segnaposto.nome}</h3>
        <p><strong>Descrizione:</strong> ${segnaposto.descrizione || 'Nessuna descrizione'}</p>
        <p><strong>Indirizzo:</strong> ${segnaposto.indirizzo || 'N/D'}</p>
        <p><strong>Punti:</strong> ${segnaposto.punti}</p>
        <p><strong>Quiz disponibili:</strong> ${segnaposto.quiz.length}</p>
      </div>
    `;

    marker.addListener('click', () => {
      infoWindow.setContent(contentString);
      infoWindow.open(map, marker);
    });
  });
}
