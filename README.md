# YMTInAppPurchaseAPI
This API is an API for Apple receipt validation used in combination with "YMTInAppPurchaseFramework".

## Description
Apple's receipt confirmation should be done on the server side.
However, the implementation on iOS and the server-side verification program take time.
By using "YMTInAppPurchaseFramework" and "YMTInAppPurchaseAPI" in combination, it is very easy to build a non-consumables billing verification system.

## Installation
Clone this repository into any directory.

```
$ cd ./hoge/hoge
$ git clone https://github.com/MasamiYamate/YMTInAppPurchaseAPI.git
```

run npm install

```
$ npm install
```

Publish "http: // localhost: 3000" through nginx reverse proxy.

```default.conf
server {
  listen 443 ssl http2;
  server_name hogehoge;
  
  location /appleapi/ {
    proxy_pass http://localhost:3000;
  }
  
  error_page   500 502 503 504  /50x.html;
    location = /50x.html {
    root   /usr/share/nginx/html;
  }  
}
```

### option
To change the server port number, change the "PORT_NO" value of "index.js".

```index.js
const bodyParser = require('body-parser')
const Express = require('express')
const request = require('request')

const PORT_NO = 3000 //← Change no!!!!

let app = Express()

var server = app.listen(PORT_NO, function() {
    console.log("Node.js is listening to PORT:" + server.address().port);
});

app.use(function(req, res , next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});
```

## Run
Execute the following command in the project directory.

```
$ node index.js
```

In a production environment, it runs in conjunction with daemon tools such as "forever".

```
$ forever start index.js
```

## Verification API endpoint
Accept only POST requests.

### Registration
**https://【your-domain-name】/【nginx-location-name】/regi**

### restore
**https://【your-domain-name】/【nginx-location-name】/restore**
