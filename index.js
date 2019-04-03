const bodyParser = require('body-parser')
const Express = require('express')
const request = require('request')

const PORT_NO = 3000

const app = Express()

let server = app.listen(PORT_NO, function() {
    console.log("Node.js is listening to PORT:" + server.address().port);
});

app.use(function(req, res , next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get("/", function(req, res){
    res.status(401).send('Error request');
});

app.post("/", function(req, res){
    res.status(401).send('Error request');
});

app.get("/regi" , function(req, res){
    res.status(401).send('Error request');
});

app.post("/regi" , async function(req, res){
    if (req.body) {
        let receipt = req.body.base64Receipt
        let transactionId = req.body.transactionID
        let secretKey = req.body.secretKey

        if (receipt && transactionId && secretKey) {
            let resultCode = await registryCheck(receipt , transactionId , secretKey)
            res.json({status:resultCode})
        }else{
            res.json({status:-1});
        }
    }else{
        res.json({status:-1});
    }
});

app.get("/restore" , function(req, res){
    res.status(401).send('Error request');
});

app.post("/restore" , async function(req, res){
    res.setHeader('Content-Type', 'application/json');
    if (req.body) {
        let receipt = req.body.base64Receipt
        let transactionId = req.body.transactionID
        let secretKey = req.body.secretKey
        if (receipt && transactionId && secretKey) {
            let productId = await restoreCheck(receipt , transactionId , secretKey)
            res.json({id:productId})
        }else{
            res.json({id:'error'})
        }
    }else{
        res.json({id:'error'})
    }
});

async function registryCheck (receipt , transactionId , secretKey) {
    let APPLE_BUY_CHECK_URL = 'https://buy.itunes.apple.com/verifyReceipt'
    let APPLE_SANDBOX_CHECK_URL = 'https://sandbox.itunes.apple.com/verifyReceipt'
    
    let requestData = {'receipt-data':receipt ,'password':secretKey}
    let jsonStr = JSON.stringify(requestData)

    let stagingResult = await syncPostRequest(APPLE_BUY_CHECK_URL , jsonStr)
    let stagingCode = statusCheck(stagingResult , transactionId)
    if (stagingCode != 21007) {
        return stagingCode
    }
    let sandboxResult = await syncPostRequest(APPLE_SANDBOX_CHECK_URL , jsonStr)
    let sandboxCode = statusCheck(sandboxResult , transactionId)
    return sandboxCode
}

async function restoreCheck (receipt , transactionId , secretKey) {
    let APPLE_BUY_CHECK_URL = 'https://buy.itunes.apple.com/verifyReceipt'
    let APPLE_SANDBOX_CHECK_URL = 'https://sandbox.itunes.apple.com/verifyReceipt'
    
    let requestData = {'receipt-data':receipt ,'password':secretKey}
    let jsonStr = JSON.stringify(requestData)
    let stagingResult = await syncPostRequest(APPLE_BUY_CHECK_URL , jsonStr)
    let stagingCode = restoreCodeCheck(stagingResult , transactionId)
    if (stagingCode != 'error') {
        return stagingCode
    }
    let sandboxResult = await syncPostRequest(APPLE_SANDBOX_CHECK_URL , jsonStr)
    let sandboxCode = restoreCodeCheck(sandboxResult , transactionId)
    return sandboxCode
}

function statusCheck (jsonData , transactionId) {
    let code = jsonData.status
    if (code != 0) {
        //Return apple err code 
        return code
    }else{
        var isErr = true
        //Confirm the consistency of the receipt
        let receipt = jsonData.receipt
        if (receipt) {
            let latestReceipt = receipt.in_app
            if (latestReceipt) {
                for (var i in latestReceipt) {
                    let tmpReceipt = latestReceipt[i]
                    let tmpTransactionId = tmpReceipt.original_transaction_id
                    if (tmpTransactionId && tmpTransactionId == transactionId) {
                        isErr = false
                        return 0
                    }
                }
            }
        }
        if (isErr) {
            return -1
        }
    }
}

function restoreCodeCheck (jsonData , transactionId) {
    let code = jsonData.status
    if (code != 0) {
        //Return apple err code 
        return 'error'
    }else{
        var isErr = true
        //Confirm the consistency of the receipt
        let receipt = jsonData.receipt
        if (receipt) {
            let latestReceipt = receipt.in_app
            for (var i in latestReceipt) {
                let tmpReceipt = latestReceipt[i]
                let tmpTransactionId = tmpReceipt.original_transaction_id
                if (tmpTransactionId && tmpTransactionId == transactionId) {
                    let productId = tmpReceipt.product_id
                    return productId
                }
            }
        }
        if (isErr) {
            return 'error'
        }
    }
}

async function syncPostRequest (reqURL , jsonData) {
	let headers = {'Content-Type':'application/json'}
	let options = {
	  url: reqURL,
	  method: 'POST',
	  headers: headers,
	  json: true,
	  form: jsonData
	}
	let response = function () {
        return new Promise(function (resolve , reject){
            request(options, function (error, response, body) {
                if(!error) {
                    resolve(body);
                } else {
                    reject(error);
                }
            })
        });
    }
    let res = await response();
    return res;
}
