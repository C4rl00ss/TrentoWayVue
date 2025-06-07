const HOST = import.meta.env.VITE_API_BASE_URL


export async function posizionaSegnaposti(map, callback) {
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
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(20, 20)
      }
    });


    // la funzione callback è quella presa in input (è il secondo parametro di posizionaSegnaposti) ed è definita nel file Home.vue
    // quando viene cliccato un marker, viene chiamata la callback con il segnaposto come argomento
    marker.addListener('click', () => {
      if (callback){
        callback(segnaposto)
      }
    });
  });
}
