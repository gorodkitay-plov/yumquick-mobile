import { WebView } from 'react-native-webview';
import { View, StyleSheet } from 'react-native';

export default function MapView({ deliveryLat, deliveryLng, courierLat, courierLng }) {
    const lat = deliveryLat ?? 37.4979;
    const lng = deliveryLng ?? 127.0276;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false }).setView([${lat}, ${lng}], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // Маркер доставки
    var deliveryIcon = L.divIcon({
      html: '<div style="background:#FF6B00;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">📍</div>',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      className: ''
    });
    L.marker([${lat}, ${lng}], { icon: deliveryIcon }).addTo(map)
      .bindPopup('📍 Адрес доставки').openPopup();

    ${courierLat && courierLng ? `
    var courierIcon = L.divIcon({
      html: '<div style="background:#007AFF;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">🛵</div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      className: ''
    });
    L.marker([${courierLat}, ${courierLng}], { icon: courierIcon }).addTo(map)
      .bindPopup('🛵 Курьер');

    L.polyline([[${courierLat}, ${courierLng}], [${lat}, ${lng}]], {
      color: '#007AFF', weight: 3, dashArray: '8, 8'
    }).addTo(map);

    var group = L.featureGroup([
      L.marker([${courierLat}, ${courierLng}]),
      L.marker([${lat}, ${lng}])
    ]);
    map.fitBounds(group.getBounds().pad(0.2));
    ` : ''}
  </script>
</body>
</html>`;

    return (
        <View style={styles.container}>
            <WebView
                source={{ html }}
                style={styles.map}
                javaScriptEnabled
                domStorageEnabled
                scrollEnabled={false}
                originWhitelist={['*']}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { height: 220, borderRadius: 12, overflow: 'hidden' },
    map: { flex: 1 },
});