import json
from .models import Room
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


@database_sync_to_async
def getAll():
    return Room.objects.all()
    

class GamePlayer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = "NONE"
        self.role = "NONE"
        self.status = "NONE"
        await self.accept()

    async def disconnect(self, close_code):
        if (self.group_name != "NONE"):
            await self.channel_layer.group_send(
                self.group_name, {"type": "disconnect_message",
                                  "target": self.role})
            await self.channel_layer.group_discard(
                self.group_name, self.channel_name
            )
            self.group_name = "NONE"
            self.role = "NONE"
            self.status = "NONE"

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        msgType = text_data_json["msgType"]
        if (msgType == "ROOM_LIST_REQUEST"):
            if (await database_sync_to_async(Room.objects.count)() != 0):
                roomList_json = []
                roomList = await getAll()
                for room in roomList:
                    roomList_json.append({'name': room.room_name})
                await self.send(text_data=json.dumps({"msgType": "ROOM_LIST_RESPONSE",
                                                        'roomList': roomList_json}))
        elif (msgType == 'CREATE_ROOM' and self.status == "NONE"):
            self.group_name = text_data_json["roomName"]
            await self.channel_layer.group_add(
                self.group_name, self.channel_name
            )
            await database_sync_to_async(Room.objects.create)(room_name = text_data_json['roomName'], 
                                goal_point = text_data_json['goalPoint'],
                                password = text_data_json['password'],
                                player1 = text_data_json['player1'],
                                player2 = 'unknown')
            self.role = "HOST"
            self.status = "READY"
        elif (msgType == "JOIN_ROOM" and self.status == "NONE"):
            self.group_name = text_data_json["roomName"]
            await self.channel_layer.group_add(
                self.group_name, self.channel_name
            )
            self.role = "CLIENT"
            self.status = "READY"
            if (len(self.channel_layer.groups[self.group_name]) == 2):
                await self.send(text_data=json.dumps({"msgType": "JOIN_ROOM_ALLOW",
                                                      }))
        elif (msgType == "SYNC" and self.status == "RUNNING"):
            await self.channel_layer.group_send(
                self.group_name, {"type": "sync_message",
                                       "player1x": text_data_json["player1"]["x"],
                                        "player1y": text_data_json["player1"]["y"],
                                        "player1s": text_data_json["player1"]["score"],
                                        "player2x": text_data_json["player2"]["x"],
                                        "player2y": text_data_json["player2"]["y"],
                                        "player2s": text_data_json["player2"]["score"],
                                        "ballx": text_data_json["ball"]["x"],
                                        "bally": text_data_json["ball"]["y"],
                                        "scoreChanged": text_data_json["scoreChanged"] }
            )
        elif (msgType == "INPUT" and self.status == "RUNNING"):
            await self.channel_layer.group_send(
                self.group_name, {"type": "input_message",
                                       "keyInputUp": text_data_json["keyInputUp"],
                                        "keyInputDown": text_data_json["keyInputDown"] }
            )
        elif (msgType == "FINISH" and self.status == "RUNNING"):
            await self.channel_layer.group_send(
                self.group_name, {"type": "finish_message",
                                  "winner": text_data_json["winner"]}
            )

    async def sync_message(self, event):
        await self.send(text_data=json.dumps({"msgType": "SYNC",
                                              "player1": {
                                                  "x": event["player1x"],
                                                  "y": event["player1y"],
                                                  "score": event["player1s"]
                                              },
                                              "player2": {
                                                  "x": event["player2x"],
                                                  "y": event["player2y"],
                                                  "score": event["player2s"]
                                              },
                                              "ball": {
                                                  "x": event["ballx"],
                                                  "y": event["bally"]
                                              },
                                              "scoreChanged": event["scoreChanged"]
                                              }))
        
    async def input_message(self, event):
        await self.send(text_data=json.dumps({"msgType": "INPUT",
                                                "keyInputUp": event["keyInputUp"],
                                                "keyInputDown": event["keyInputDown"] }))
        
    async def finish_message(self, event):
        await self.send(text_data=json.dumps({"msgType": "FINISH",
                                              "winner": event["winner"]}))
        await self.channel_layer.group_discard(
                self.group_name, self.channel_name
        )
        self.group_name = "NONE"
        self.role = "NONE"
        self.status = "NONE"

    async def start_message(self, event):
        await self.send(text_data=json.dumps({"msgType": "GAME_START"}))

    async def disconnect_message(self, event):
        if (self.group_name != "NONE" and self.role != event["tartget"]):
            await self.send(text_data=json.dumps({"msgType": "DISCONNECT"}))
            await self.channel_layer.group_discard(
                self.group_name, self.channel_name
            )
            self.group_name = "NONE"
            self.role = "NONE"
            self.status = "NONE"