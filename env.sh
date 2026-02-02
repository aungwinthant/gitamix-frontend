#!/bin/bash

# Select variables to inject
echo "window._env_ = {" > /usr/share/nginx/html/env-config.js
if [ ! -z "$BACKEND_URL" ]; then
  echo "  BACKEND_URL: \"$BACKEND_URL\"," >> /usr/share/nginx/html/env-config.js
fi
if [ ! -z "$API_KEY" ]; then
  echo "  API_KEY: \"$API_KEY\"," >> /usr/share/nginx/html/env-config.js
fi
echo "};" >> /usr/share/nginx/html/env-config.js

