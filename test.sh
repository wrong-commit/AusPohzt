curl 'https://digitalapi.auspost.com.au/shipmentsgatewayapi/watchlist/shipments/997049763262' \
  -A 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36' \
  -H 'Host: digitalapi.auspost.com.au' \
  -H 'Connection: keep-alive' \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'AP_CHANNEL_NAME: WEB_DETAIL' \
  -H 'api-key: d11f9456-11c3-456d-9f6d-f7449cb9af8e' \
  -H 'Origin: https://auspost.com.au' \
  -H 'Referer: https://auspost.com.au/' \
  -H 'Accept-Language: en-US,en;q=0.9' \
  --compressed
#   -o /dev/null -w '%{response_code}'
  