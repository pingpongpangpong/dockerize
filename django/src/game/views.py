import json
from django.http import JsonResponse, HttpResponse
from .models import Room

def createRoom(request):
    if request.method == 'POST':
        try:
            data_json = json.loads(request.body)
            if Room.objects.filter(room_name=data_json['roomName']).exists():
                return JsonResponse({'result': 'fail',
                                     'msg': 'Already have a room with the same name.'})
            else: 
                Room.objects.create(room_name = data_json['roomName'], 
                    goal_point = data_json['gamePoint'],
                    password = data_json['password'],
                    player1 = data_json['player1'],
                    player2 = 'unknown',
                    status = 'ready')
                return JsonResponse({'result': 'success',
                                     'roomName': data_json['roomName'],
                                     'gamePoint': data_json['gamePoint']})
        except KeyError:
            return HttpResponse("key error", status=400)
    
def listRoom(request):
    if request.method == 'POST':
        try:
            print(request.body)
            data_json = json.loads(request.body)
            roomList_json = []
            count = 1
            page = int(data_json['page'])
            roomList = Room.objects.exclude(status='running')
            total_page = int(roomList.count() / 5) + (1 if roomList.count() % 5  else 0)
            if roomList.exists():
                if page > total_page:
                    page = total_page
                elif page < 1:
                    page = 1
                for room in roomList:
                    if (page - 1) * 5 < count & count <= page * 5:
                        roomList_json.append({'name': room.room_name,
                                              'password': room.password != ""})
                    count += 1
                    if (page * 5 < count):
                        break 
            return JsonResponse({'total_page': total_page,
                                'cur_page': page,
                                'roomList': roomList_json})
        except KeyError:
            return HttpResponse("key error", status=400)
    

def joinRoom(request):
    if request.method == 'POST':
        try:
            data_json = json.loads(request.body)
            if Room.objects.filter(room_name=data_json['roomName']).exists():
                room = Room.objects.get(room_name=data_json['roomName'])
                if (room.password == data_json['password']):
                    room.player2 = data_json['player2']
                    room.status = 'running'
                    room.save()
                    return JsonResponse({'status': 'success',
                                         'roomName': room.room_name,
                                         'player1': room.player1,
                                         "gamePoint": room.goal_point})
                else:
                    return JsonResponse({'status': 'fail',
                                         'msg': 'Wrong password'})
            else:
                return HttpResponse("The Room doens't exist", status=400)
        except KeyError:
            return HttpResponse("key error", status=400)
        
def searchRoom(request):
    if request.method == 'POST':
        try:
            data_json = json.loads(request.body)
            roomList_json = []
            roomList = Room.objects.filter(room_name=data_json['roomName'], status='ready')
            for room in roomList:
                roomList_json.append({'name': room.room_name,
                                      'password': room.password != ""})
            return JsonResponse({'total_page': 1,
                                 'cur_page': 1,
                                 'roomList': roomList_json})
        except KeyError:
            return HttpResponse("key error", status=400)
def finishRoom(request):
    if request.method == 'POST':
        try:
            data_json = json.loads(request.body)
            if Room.objects.filter(room_name=data_json['roomName']).exists():
                Room.objects.get(room_name=data_json['roomName']).delete()
                return JsonResponse({'result': 'success'})
            else:
                return JsonResponse({'result': 'fail'})
        except KeyError:
            return HttpResponse("key error", status=400)