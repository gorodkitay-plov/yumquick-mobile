import { WebView } from 'react-native-webview';
import { View, StyleSheet } from 'react-native';

export default function MapView({ deliveryLat, deliveryLng, courierLat, courierLng }) {
    const lat = deliveryLat ?? 37.4979;
    const lng = deliveryLng ?? 127.0276;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=4e9290f0c3aeee01fca6ba4429dbdec2&autoload=false"></script>
  <script>
    kakao.maps.load(function() {
      var map = new kakao.maps.Map(document.getElementById('map'), {
        center: new kakao.maps.LatLng(${lat}, ${lng}),
        level: 4
      });

      // 배달 마커
      var deliveryMarker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(${lat}, ${lng}),
        map: map
      });
      new kakao.maps.InfoWindow({
        content: '<div style="padding:4px 8px;font-size:12px;font-weight:bold;color:#FF6B00;">📍 배달 주소</div>'
      }).open(map, deliveryMarker);

      ${courierLat && courierLng ? `
      var courierPos = new kakao.maps.LatLng(${courierLat}, ${courierLng});
      var courierMarker = new kakao.maps.Marker({ position: courierPos, map: map });
      new kakao.maps.InfoWindow({
        content: '<div style="padding:4px 8px;font-size:12px;font-weight:bold;color:#007AFF;">🛵 배달원</div>'
      }).open(map, courierMarker);

      new kakao.maps.Polyline({
        path: [courierPos, new kakao.maps.LatLng(${lat}, ${lng})],
        strokeWeight: 3,
        strokeColor: '#007AFF',
        strokeOpacity: 0.7,
        strokeStyle: 'dashed',
        map: map
      });

      var bounds = new kakao.maps.LatLngBounds();
      bounds.extend(courierPos);
      bounds.extend(new kakao.maps.LatLng(${lat}, ${lng}));
      map.setBounds(bounds);
      ` : ''}
    });
  </script>
</body>
</html>`;

    return (
        <View style={styles.container}>
            <WebView
                source={{ html, baseUrl: 'http://172.30.1.71:8080' }}
                style={styles.map}
                javaScriptEnabled
                domStorageEnabled
                scrollEnabled={false}
                originWhitelist={['*']}
                mixedContentMode="always"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { height: 220, borderRadius: 12, overflow: 'hidden' },
    map: { flex: 1 },
});