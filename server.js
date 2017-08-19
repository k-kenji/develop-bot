'use strict'

const http = require('http');
const https = require('https');
const qs = require('querystring');
const url = require('url');
const TOKEN = 'MY_VERIFY_TOKEN';
const PORT = process.env.PORT || 3000;
const PAGE_ACCESS_TOKEN = 'EAACJzY0clqQBAKyL0GwgoEOZA79RtcJhpVlAnbK3atjoLCXItuXZBdcU94SsiZCZCiS7hYQwIBBcd85tIIpdB3LB1qCuZAkBwXGCybr4yDnGeTwab58uCgx1YOzLqDv3eL3YsGyRvnBTaZBOXxCyCKs9cV3XvIT3KX3w6FP2mDgPYcoubdKDGh';
const HOST = 'graph.facebook.com';
const PATH = '/v2.6/me/messages?access_token='+PAGE_ACCESS_TOKEN;



const errorText = (error) => {
    console.log("エラーです");
}

const sendTextMessage = (recipientId, messageText) => { // オウム返しアロー関数
    const postDataStr = JSON.stringify({
        recipient: { id: recipientId },
        message: { text: messageText }
    });

    const options = {
        host: HOST,
        port: 443,
        path: PATH,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postDataStr),
            'Accept': 'application/json'
        }
    };

    return new Promise((resolve, reject) => {  // Nodejsのリクエスト処理、promiseを使っている
        const req = https.request(options, (res) => {
            let body = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => resolve(body));
        });

        req.on('error', (e) => reject(e));
        req.write(postDataStr);
        req.end();
    });
}; // オウム返しアロー関数の終了

const sendPostMessage = (recipientId, messagePostack) => { // postback用オウム返しのアロー関数
    const postDataStr = JSON.stringify({
        recipient: { id: recipientId },
        message: { text: messagePostack }
    });

    const options = {
        host: HOST,
        port: 443,
        path: PATH,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postDataStr),
            'Accept': 'application/json'
        }
    };

    return new Promise((resolve, reject) => {  // Nodejsのリクエスト処理、promiseを使っている
        const req = https.request(options, (res) => {
            let body = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => resolve(body));
        });

        req.on('error', (e) => reject(e));
        req.write(postDataStr);
        req.end();
    });
}; // postback用オウム返しアロー関数の終了

http.createServer((req, res) => {
    //Webhook登録時の認証用
    if(req.method === 'GET'){
        const query = qs.parse(url.parse(req.url).query);
        if(query['hub.mode'] === 'subscribe' && query['hub.verify_token'] === TOKEN){
            console.log("Validating webhook");
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(query['hub.challenge']);
        }else{
            console.error("Failed validation. Make sure the validation tokens match.");
            res.writeHead(403, {'Content-Type': 'text/plain'});
            res.end('error');
        }
    }

    //シンプルなオウム返し
    if(req.method === 'POST'){
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });        
        req.on('end', () => {
            console.log('--- Webhook received ---');
            if(body === '') return; //bodyが空は無視

            const data = JSON.parse(body); // JSON形式に変換
            console.log("data: ", data);
            const event = data.entry[0].messaging[0];
            console.log("event: ", event);
            if (data.object === 'page' && event.message) {
                //メッセージ受信時の処理
                const senderID = event.sender.id; // ユーザーIDを取得
                const messageText = event.message.text; // textMessageを受信
                // const messagePostack = event.postback.payload; // postbackを受信

                if(messageText === ''){
                    console.log('メッセージが取得できない');
                    return;
                }
                // 固有の処理はここから書く
                console.log("Message data: ", event.message); // コールバック
                sendTextMessage(senderID, messageText) // 送信するユーザー
                .then((body)=>{
                    console.log('返信完了');
                    console.log(body);
                });
            } else if(data.object === 'page' && event.postback) {
                // メッセージ受信時の処理
                const senderID = event.sender.id; // ユーザーIDを取得
                const messagePostack = event.postback.payload; // payloadを取得

                if(messagePostack === '') {
                    console.log('ペイロードを取得できない');
                    return;
                }

                // 固有の処理
                console.log("postback data: ", event.postback);
                sendPostMessage(senderID, messagePostack) // 送信するユーザー
                .then((body)=>{
                    console.log('postback返信完了');
                    console.log(body);
                });
            } else {
                console.log("Webhook received unknown event: ", event);
            }
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('success');
        });
    }

}).listen(PORT);
console.log(`Server running at ${PORT}`);