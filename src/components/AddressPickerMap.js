import { WebView } from 'react-native-webview';
import { View, StyleSheet } from 'react-native';

export default function AddressPickerMap({ initialLat, initialLng, onLocationChange, baseUrl }) {
    const lat = initialLat ?? 37.4979;
    const lng = initialLng ?? 127.0276;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; }
    #pin {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -100%);
      font-size: 36px; pointer-events: none; z-index: 10;
    }
    #zoom-controls {
      position: absolute; right: 10px; top: 10px; z-index: 20;
      display: flex; flex-direction: column;
      background: white; border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2); overflow: hidden;
    }
    #zoom-controls button {
      width: 36px; height: 36px; border: none; background: white;
      font-size: 20px; font-weight: bold; color: #333;
    }
    #zoom-controls button:active { background: #f0f0f0; }
    #zoom-in { border-bottom: 1px solid #eee; }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="pin">📍</div>
  <div id="zoom-controls">
    <button id="zoom-in">+</button>
    <button id="zoom-out">−</button>
  </div>
  <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=4e9290f0c3aeee01fca6ba4429dbdec2&libraries=services&autoload=false"></script>
  <script>
    kakao.maps.load(function() {
      var map = new kakao.maps.Map(document.getElementById('map'), {
        center: new kakao.maps.LatLng(${lat}, ${lng}),
        level: 4
      });
      var geocoder = new kakao.maps.services.Geocoder();

      map.setZoomable(true);

      function sendCenter() {
        var center = map.getCenter();
        var lat = center.getLat();
        var lng = center.getLng();

        geocoder.coord2Address(lng, lat, function(result, status) {
          var address = '';
          if (status === kakao.maps.services.Status.OK && result[0]) {
            address = result[0].road_address
              ? result[0].road_address.address_name
              : result[0].address.address_name;
          }
          window.ReactNativeWebView.postMessage(JSON.stringify({
            lat: lat,
            lng: lng,
            address: address
          }));
        });
      }

      kakao.maps.event.addListener(map, 'idle', sendCenter);
      sendCenter();

      document.getElementById('zoom-in').addEventListener('click', function() {
        map.setLevel(map.getLevel() - 1);
      });
      document.getElementById('zoom-out').addEventListener('click', function() {
        map.setLevel(map.getLevel() + 1);
      });
    });
  </script>
</body>
</html>`;

    const handleMessage = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            onLocationChange?.(data.lat, data.lng, data.address);
        } catch {}
    };

    return (
        <View style={styles.container}>
            <WebView
                source={{ html, baseUrl }}
                style={styles.map}
                javaScriptEnabled
                domStorageEnabled
                scrollEnabled={false}
                originWhitelist={['*']}
                mixedContentMode="always"
                onMessage={handleMessage}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { height: 220, borderRadius: 14, overflow: 'hidden' },
    map: { flex: 1 },
});