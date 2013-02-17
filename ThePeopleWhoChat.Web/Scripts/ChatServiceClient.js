﻿
var baseUrl = "/Chat.svc/";

function service_redirectIfNotLoggedIn(redirect) {
    if (sessionStorage.token == null) { redirect() }
}

function service_login(username, password, success, failure) {
    var login = { username: username, password: password };
    $.ajax({
        type: "PUT",
        url: baseUrl +"token",
        data: JSON.stringify(login),
        contentType: "application/json",
        complete: function (xmlHttpRequest, status) {
            var token = xmlHttpRequest.getResponseHeader('Session-Token');
            sessionStorage.setItem('token', token);
        }
    }).done(success).fail(function (x, msg) {
        failure("login failed: " + x.getResponseHeader('Error-Message'));
    });
}

function service_logout(success, failure) {
    $.ajax({
        type: "DELETE",
        url: baseUrl + "token/" + sessionStorage.token
    }).done(function () {
        sessionStorage.setItem('token', null);
        success();
    }).fail(function (x, msg) { failure("logout failed: " + msg); });
}

function list_sessions(success, failure) {
    $.ajax({
        type: "GET",
        url: baseUrl + "sessions",
        headers: { 'Session-Token': sessionStorage.token }
    }).done(function (data) {
        var cleanData = data.map(function (session) {
            return { userId: session.userId, userName: session.user.name, roomId: session.roomId, lastTouch: session.lastTouch }
        })
        success(cleanData)
    }).fail(function (x, msg) {
        failure("list sessions failed: " + x.getResponseHeader('Error-Message'));
    });
}

//[<WebInvoke(Method = "PUT", UriTemplate="users", RequestFormat = WebMessageFormat.Json, 
//            ResponseFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Bare)>]
//[<OperationContract>]
//member this.AddUser(user:User) =
//this.ImplementationWrapper((fun () -> data.AddUser(getToken(),user)),"")

//[<WebInvoke(Method = "DELETE", UriTemplate="users/{userIdNumPart}")>]
//[<OperationContract>]
//member this.RemoveUser(userIdNumPart:string) =
//this.ImplementationWrapper((fun () -> data.RemoveUser(getToken(),"users/"+userIdNumPart)),())

//[<WebGet(UriTemplate="users",ResponseFormat=WebMessageFormat.Json, BodyStyle=WebMessageBodyStyle.Bare)>]
//[<OperationContract>]
//member this.ListUsers() =
//    this.ImplementationWrapper((fun () -> data.ListUsers(getToken())),Array.empty)
                                        
//[<WebInvoke(Method = "PUT", UriTemplate="rooms", RequestFormat = WebMessageFormat.Json, 
//            ResponseFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Bare)>]
//[<OperationContract>]
//member this.AddRoom(room:Room) =
//this.ImplementationWrapper((fun () -> data.AddRoom(getToken(),room)),"")

//[<WebInvoke(Method = "DELETE", UriTemplate="rooms/{roomIdNumPart}")>]
//[<OperationContract>]
//member this.RemoveRoom(roomIdNumPart:string) =
//this.ImplementationWrapper((fun () -> data.RemoveRoom(getToken(),"rooms/"+roomIdNumPart)),())



function list_rooms(success,failure) {
    $.ajax({
        type: "GET",
        url: baseUrl + "rooms",
        headers: { 'Session-Token': sessionStorage.token }
    }).done(function (data) {
        var cleanData = data.map(function (room) {
            return { id: room.m_Item1, name: room.m_Item2['name'], description: room.m_Item2['description'] }
        })
        success(cleanData)
    }).fail(function (x, msg) {
        failure("list rooms failed: " + x.getResponseHeader('Error-Message'));
    });
}

function enter_room(roomId,success,failure) {
    var params = {};
    params.id = roomId;

    $.ajax({
        type: "PUT",
        url: baseUrl + "currentroom",
        data: JSON.stringify(params),
        contentType: "application/json",
        headers: { 'Session-Token': sessionStorage.token }
    }).done(function () {
        success("entered room: " + roomId);
    }).fail(function (x, msg) {
        failure("enter room failed: " + x.getResponseHeader('Error-Message'));
    });
}

function leave_room(success, failure) {
    $.ajax({
        type: "DELETE",
        url: baseUrl + "currentroom",
        headers: { 'Session-Token': sessionStorage.token }
    }).done(function () {
        success("left the room");
    }).fail(function (x, msg) {
        failure("leave room failed: " + x.getResponseHeader('Error-Message'));
    });
}

function get_messages(success, failure) {
    var date = (6).months().ago().toString("yyyy-MM-ddThh:mm:ss")

    $.ajax({
        type: "GET",
        url: baseUrl + "messages?after=" + date,
        headers: { 'Session-Token': sessionStorage.token }
    }).done(function (data) {
        var cleanData = data.map(function (msg) {
            return { userId: msg.userId, timestamp: msg.timestamp, rawMessage: msg.rawMessage }
        })
        success(cleanData)
    }).fail(function (x, msg) {
        failure("get messages failed: " + x.getResponseHeader('Error-Message'));
    });
}
//[<WebGet(UriTemplate="messages?after={after}",ResponseFormat=WebMessageFormat.Json)>]
//[<OperationContract>]
//member this.GetMessages(after:string) =
//this.ImplementationWrapper((fun () -> 
//    let valid,date = DateTime.TryParse(after)
//    if valid then
//        let results = data.GetMessages(getToken(),date)
//        results
//else failwith (sprintf "Invalid date: %s" after)
//    ), Array.empty)

//[<WebInvoke(Method = "PUT", UriTemplate="messages", RequestFormat = WebMessageFormat.Json, 
//        BodyStyle = WebMessageBodyStyle.Bare)>]
//[<OperationContract>]
//member this.PostMessage(message:string) =
//this.ImplementationWrapper((fun () -> data.PostMessage(getToken(),message)),())