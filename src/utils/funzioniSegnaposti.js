const HOST = import.meta.env.VITE_API_BASE_URL

// Salviamo i marker globalmente per poterli rimuovere prima di aggiungerne di nuovi
let markers = []

export async function posizionaSegnaposti(map, callback) {
  if (!map) return;

  // Rimuove i vecchi marker dalla mappa
  markers.forEach(marker => marker.setMap(null))
  markers = []

  const response = await fetch(`${HOST}/api/v1/segnaposti`)
  const segnaposti = await response.json()

  const infoWindow = new google.maps.InfoWindow()

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
    })

    marker.addListener('click', () => {
      if (callback) {
        callback(segnaposto)
      }
    })

    markers.push(marker) // Salva il marker per rimuoverlo in seguito
  })
}
