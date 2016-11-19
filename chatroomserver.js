var net = require('net');
var IP = require('quick-local-ip');

var address = IP.getLocalIP4();
//var ipAddress = "192.168.0.8";

//COLLEGE IP "10.6.86.103"
//HOME TPLINK IP 192.168.0.8 //DEB4 = .11
//two dimensional array to store the chatrooms and what clients are in the rooms

//INDEX |ROOM NAME|SOCKET|SOCKET| SOCKET.....
//0		|		  |		 |		|
//1		|		  |		 |		|
//2		|		  |		 |		|
//3		|		  |		 |		|


//use a "row" array and push the client names into this and then this into the general array??

var chatrooms = new Array();
var joinedBool = 0;
const NUMBER_OF_ROOMS = 5;
const CHATROOM_COLUMN = 0;

var chat1 = new Array();
var chat2 = new Array();
var chat3 = new Array();
var chat4 = new Array();
var chat5 = new Array();

chat1[0] = "default";
chat2[0] = "default";
chat3[0] = "default";
chat4[0] = "default";
chat5[0] = "default";

chatrooms.push(chat1);
chatrooms.push(chat2);
chatrooms.push(chat3);
chatrooms.push(chat4);
chatrooms.push(chat5);

socketArray = new Array();


var clientNo = 0;


//note to self: create array to store user and the room they are in? for easy removal?
//maybe use a map?

var server = new net.createServer();

server.listen(7060, address, function(){
	console.log("server listening \n");
});


server.on('connection', function(socket){
	
	clientNo++;
	console.log("connection received");
	socket.setEncoding('utf8');

	socket.on("data", function(message){
	console.log("message received 1");


		if(message.includes("JOIN_CHATROOM:"))
		{
			//convert to array in order to extract room name and client name
			console.log("message received 2");
			var data = message.toString().split("\n");
			var room = data[0].toString().split(" ");
			var name = data[3].toString().split(" ");

			chatroomName = room[1].toString();
			username = name[1].toString();

			var position = 0;

			//check if username is taken?
	
			//create chatroom
			var index = roomAlreadyExists(chatroomName);

			if(index >= 0)
			{			
				console.log("message received 3");
				socket.name = username;
				socketArray.push(socket);

				position = chatrooms[index].length;
				chatrooms[index][position] = username;
	
				socket.write("JOINED_CHATROOM: " + chatroomName + "\n"
								+ "SERVER_IP: " + address + "\n"
								+ "PORT: 7070 \n"
								+ "ROOM_REF: " + index + "\n"
								+ "JOIN_ID: " + clientNo);

				socket.write("CHAT: " + index + "\n"
							+ "CLIENT_NAME: " + username + "\n"
							+ "MESSAGE:" + username + " has joined this chatroom." + "\n");
						
				//broadcast(index, username + " joined the chat", username);					
					
			}
			else
			{
				console.log("message received 3");
				if(chatrooms[(chatrooms.length-1)][CHATROOM_COLUMN] != "default")
				{
					//server full please join an existing group
					socket.write("Our server cannot accomodate another chatroom, please join an existing one: \nThe existing rooms are: \n");
					for(var x =0; x<chatrooms.length; x++)
					{
						socket.write(chatrooms[x][CHATROOM_COLUMN].toString() + "\n");
					}

				}
				else
				{
					for(var j = chatrooms.length-1; j>=0; j--)
					{
						if(chatrooms[j][CHATROOM_COLUMN] === "default")
						{
							var index = j;
						}
					}

					chatrooms[index][CHATROOM_COLUMN] = chatroomName;

					socket.name = username;
					socketArray.push(socket);

					position = chatrooms[index].length;
					chatrooms[index][position] = username;

					socket.write("JOINED_CHATROOM: " + chatroomName + "\n"
								+ "SERVER_IP: " + address + "\n"
								+ "PORT: 7070 \n"
								+ "ROOM_REF: " + index + "\n"
								+ "JOIN_ID: " + clientNo + "\n");

					socket.write("CHAT: " + index + "\n"
							+ "CLIENT_NAME: " + username + "\n"
							+ "MESSAGE:" + username + " has joined this chatroom." + "\n");

					//broadcast(index, username + " joined the chat", username);
				}
			}
		}
		else if(message.includes("LEAVE_CHATROOM:"))
		{
			console.log("message received 4");
			//leave room but DON'T CLOSE SOCKET

			var data = message.toString().split("\n");

			var room = data[0].toString().split(" ");	
			var roomRef = room[1].toString();	

			var join = data[1].toString().split(" ");
			var joinId = join[1].toString();

			var client = data[2].toString().split(" ");
			var clientName = client[1].toString();
				
			socket.write("LEFT_CHATROOM: " + roomRef + "\n" 
								+ "JOIN_ID: " + joinId  + "\n");

			socket.write("CHAT: " + roomRef + "\n"
							+ "CLIENT_NAME: " + username + "\n"
							+ "MESSAGE:" + username + " has left this chatroom." + "\n");
				
			//broadcast(roomRef, socket.name + " left the chat", clientName);
			chatrooms[roomRef].splice(x, 1);


		}
		else if(message.includes("DISCONNECT:"))
		{
			console.log("message received 5");
			//terminate connection
			var data = message.toString().split("\n");
			var client = data[2].toString().split(" ");
			var clientName = client[1].toString();

			leaveChat(clientName);

			var index = socketArray.indexOf(socket);
			if(index > -1)
			{
				socketArray.splice(index,1);
			}

			for(var x = 0; x <socketArray.length; x++)
			{
				process.stdout.write(socketArray[x].name + "\n");
			}
			
			socket.end();
		}
		else if(message.includes("MESSAGE:"))
		{
			var data = message.toString().split("\n");

			var chatroom = data[0].toString().split(" ");
			var roomRef = chatroom[1].toString();

			var join = data[1].toString().split(" ");
			var joinId = join[1].toString();

			var client = data[2].toString().split(" ");
			var clientName = client[1].toString();

			var theMessage = data[3].toString().split(" ");

			var prepareForBroadcast = "";

			for(var y = 1; y <theMessage.length; y++)
			{
					prepareForBroadcast = prepareForBroadcast + theMessage[y] + " ";
			}

			//broadcast message
			messageBroadcast(roomRef, prepareForBroadcast, clientName);
		}
		else if(message.includes("KILL_SERVICE"))
		{
			server.close();
		}
		else
		{
			var error = 7;
			var errorString = "The server does not understand the action you wish to take. please ensure your message includes: JOIN_CHATROOM:, LEAVE_CHATROOM:, DISCONNECT: or MESSAGE:";
			socket.write("ERROR_CODE: " + error + "\n"
						+"ERROR_DESCRIPTION: " + errorString);
		}
		

	});


	socket.on("end", function(){
		
	});

});

	function broadcast (room, message, sender)
	{
		var sock = socketArray[0];
		var name;

		for(var x = 0; x <chatrooms[room].length; x++)
		{
			name = chatrooms[room][x].toString();

			for(var y = 0; y < socketArray.length; y++)
			{
				sock = socketArray[y];

				if(sock.name === name)
				{
					if(name != sender)
					{
						sock.write(message);
					}
				}
			}
		}
	}



function messageBroadcast(room, message, sender)
{
	var sock = socketArray[0];
	var name;

	for(var x = 0; x <chatrooms[room].length; x++)
	{
		name = chatrooms[room][x].toString();

		for(var y = 0; y < socketArray.length; y++)
		{
			sock = socketArray[y];

			if(sock.name === name)
			{
				if(name != sender)
				{
						sock.write(sender + " says: " + message);
				}
			}
		}
	}
}

/*function addSocket(socket)
{
	for(var i = 0; i <socketArray.lenght)
}*/

	function roomAlreadyExists(name)
	{
		for(var i = 0; i<chatrooms.length; i++)
		{
			if(chatrooms[i][CHATROOM_COLUMN] === name)
			{
				return i;
			}
		}
		return -1;
	}

	function leaveChat(socket, clientName)
	{
		for(var x =0; x < chatrooms.length; x++)
		{
			for(var y = 0; y< chatrooms[x].length; y++)
			{
				if(chatrooms[x][y] === clientName)
				{
					chatrooms[x].splice(y,1);
					broadcast(x, clientName + " left the chat", clientName);
				}
			}
		}
	}
	
	server.on("close", function() {
	console.log("server closed");
});
