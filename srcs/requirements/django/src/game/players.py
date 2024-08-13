import json
from channels.generic.websocket import AsyncWebsocketConsumer

class GamePlayer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = "game_%s" % self.room_name
        await self.channel_layer.group_add(
                self.room_group_name, self.channel_name
        )
        print(len(self.channel_layer.groups[self.room_group_name]))
        if len(self.channel_layer.groups[self.room_group_name]) >= 3:
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )
        await self.accept()
        if len(self.channel_layer.groups[self.room_group_name]) == 1:
             await self.send(text_data=json.dumps({"msgType": "HOST"}))
        elif len(self.channel_layer.groups[self.room_group_name]) == 2:
             await self.send(text_data=json.dumps({"msgType": "CLIENT"}))
             await self.channel_layer.group_send(
                self.room_group_name, {"type": "start_message"}
             )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name, self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        msgType = text_data_json["msgType"]
        if (msgType == "SYNC"):
            player1x = text_data_json["player1"]["x"]
            player1y = text_data_json["player1"]["y"]
            player1s = text_data_json["player1"]["score"]
            player2x = text_data_json["player2"]["x"]
            player2y = text_data_json["player2"]["y"]
            player2s = text_data_json["player2"]["score"]
            ballx = text_data_json["ball"]["x"]
            bally = text_data_json["ball"]["y"]
            scoreChanged = text_data_json["scoreChanged"]
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "sync_message",
                                       "player1x": player1x,
                                        "player1y": player1y,
                                        "player1s": player1s,
                                        "player2x": player2x,
                                        "player2y": player2y,
                                        "player2s": player2s,
                                        "ballx": ballx,
                                        "bally": bally,
                                        "scoreChanged": scoreChanged }
            )
        elif (msgType == "INPUT"):
            keyUp = text_data_json["keyboardUp"]
            keyDown = text_data_json["keyboardDown"]
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "input_message",
                                       "keyboardUp": keyUp,
                                        "keyboardDown": keyDown }
            )
        elif (msgType == "FINISH"):
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "finish_message"}
            )

    async def chat_message(self, event):
        message = event["message"]
        await self.send(text_data=json.dumps({"message": message}))
    
    async def sync_message(self, event):
        player1x = event["player1x"]
        player1y = event["player1y"]
        player1s = event["player1s"]
        player2x = event["player2x"]
        player2y = event["player2y"]
        player2s = event["player2s"]
        ballx = event["ballx"]
        bally = event["bally"]
        scoreChanged = event["scoreChanged"]
        await self.send(text_data=json.dumps({"msgType": "SYNC",
                                              "player1": {
                                                  "x": player1x,
                                                  "y": player1y,
                                                  "score": player1s
                                              },
                                              "player2": {
                                                  "x": player2x,
                                                  "y": player2y,
                                                  "score": player2s
                                              },
                                              "ball": {
                                                  "x": ballx,
                                                  "y": bally
                                              },
                                              "scoreChanged": scoreChanged
                                              }))
        
    async def input_message(self, event):
        keyUp = event["keyboardUp"]
        keyDown = event["keyboardDown"]
        await self.send(text_data=json.dumps({"msgType": "INPUT",
                                                "keyboardUp": keyUp,
                                                "keyboardDown": keyDown }))
        
    async def finish_message(self, event):
        await self.send(text_data=json.dumps({"msgType": "FINISH"}))

    async def start_message(self, event):
        await self.send(text_data=json.dumps({"msgType": "START"}))