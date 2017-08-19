req.on('end', () => {
    console.log('--- Webhook received ---');
    if(body === '') return; //bodyが空は無視

    const data = JSON.parse(body);
    const event = data.entry[0].messaging[0];
    if (data.object === 'page' && event.message) {
        //メッセージ受信時の処理
        const senderID = event.sender.id;
        const messageText = event.message.text;
        if(messageText === ''){
            console.log('メッセージが取得できない');
            return;
        }

        if(messageText === '天気'){
            const URL = 'http://weather.livedoor.com/forecast/webservice/json/v1?city=400040';
            axios.get(URL)
            .then((response) => {
                console.log(response.data.description.text);

                console.log("Message data: ", event.message);
                sendTextMessage(senderID, response.data.description.text)
                .then((body)=>{
                    console.log('返信完了!');
                    console.log(body);
                });
            })
            .catch((error) => {
                console.log(error);
            });
        }


    }else{
        console.log("Webhook received unknown event: ", event);
    }

    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('success');
});


wait(3000).then((value) => {
    console.log(value);
    return `finish ${value}`;
  }).then((value) => {
    console.log(value);
  }).then((value) => {
    console.log(value);
  });



  // スタートボタン登録
  curl -X POST -H "Content-Type: application/json" -d '{ 
    "get_started":{
      "payload":"GET_STARTED_PAYLOAD"
    }
  }' "https://graph.facebook.com/v2.6/me/messenger_profile?access_token=EAACJzY0clqQBAKyL0GwgoEOZA79RtcJhpVlAnbK3atjoLCXItuXZBdcU94SsiZCZCiS7hYQwIBBcd85tIIpdB3LB1qCuZAkBwXGCybr4yDnGeTwab58uCgx1YOzLqDv3eL3YsGyRvnBTaZBOXxCyCKs9cV3XvIT3KX3w6FP2mDgPYcoubdKDGh"    
  
  
  // スタートボタンのpayload値を取得する
  curl -X GET "https://graph.facebook.com/v2.6/me/messenger_profile?fields=get_started&access_token=EAACJzY0clqQBAKyL0GwgoEOZA79RtcJhpVlAnbK3atjoLCXItuXZBdcU94SsiZCZCiS7hYQwIBBcd85tIIpdB3LB1qCuZAkBwXGCybr4yDnGeTwab58uCgx1YOzLqDv3eL3YsGyRvnBTaZBOXxCyCKs9cV3XvIT3KX3w6FP2mDgPYcoubdKDGh"    