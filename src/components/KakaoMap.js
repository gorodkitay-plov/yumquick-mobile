import { WebView } from 'react-native-webview';
import { View, StyleSheet } from 'react-native';

export default function KakaoMap({ deliveryLat, deliveryLng, courierLat, courierLng }) {
    const lat = deliveryLat ?? 37.4979;
    const lng = deliveryLng ?? 127.0276;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; }
    #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=4e9290f0c3aeee01fca6ba4429dbdec2&autoload=false"></script>
  <script>
    kakao.maps.load(function() {
      var container = document.getElementById('map');
      var options = {
        center: new kakao.maps.LatLng(${lat}, ${lng}),
        level: 4
      };
      var map = new kakao.maps.Map(container, options);

      // Маркер адреса доставки
      new kakao.maps.Marker({
        position: new kakao.maps.LatLng(${lat}, ${lng}),
        map: map
      });

      var deliveryInfo = new kakao.maps.InfoWindow({
        content: '<div style="padding:4px 8px;font-size:12px;font-weight:bold;color:#FF6B00;white-space:nowrap;">📍 Адрес доставки</div>'
      });
      deliveryInfo.open(map, new kakao.maps.Marker({
        position: new kakao.maps.LatLng(${lat}, ${lng}),
        map: map
      }));

      ${courierLat && courierLng ? `
      // Маркер курьера
      var courierPos = new kakao.maps.LatLng(${courierLat}, ${courierLng});
      var courierMarker = new kakao.maps.Marker({ position: courierPos, map: map });
      var courierInfo = new kakao.maps.InfoWindow({
        content: '<div style="padding:4px 8px;font-size:12px;font-weight:bold;color:#007AFF;white-space:nowrap;">🛵 Курьер</div>'
      });
      courierInfo.open(map, courierMarker);

      // Линия
      new kakao.maps.Polyline({
        path: [courierPos, new kakao.maps.LatLng(${lat}, ${lng})],
        strokeWeight: 3,
        strokeColor: '#007AFF',
        strokeOpacity: 0.7,
        strokeStyle: 'dashed',
        map: map
      });

      // Центрируем
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
                source={{ html }}
                style={styles.map}
                javaScriptEnabled
                domStorageEnabled
                mixedContentMode="always"
                scrollEnabled={false}
                originWhitelist={['*']}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { height: 220, borderRadius: 16, overflow: 'hidden' },
    map: { flex: 1 },
});