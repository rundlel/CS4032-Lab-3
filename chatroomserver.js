var net = require('net');
var IP = require('quick-local-ip');

var address = IP.getLocalIP4();
var port = 7060;
var studentId = 13321661;
//var ipAddress = "192.168.0.8";

//COLLEGE IP "10.6.86.103"
//HOME TPLINK IP 192.168.0.8 //DEB4 = .11
//two dimensional array to store the chatrooms and what clients are in the rooms

//INDEX |ROOM NAME|SOCKET|SOCKET| SOCKET.....
//0		|		  |		 |		|
//1		|		  |		 |		|
//2		|		  |		 |		|
//3		|		  |		 |		|




var chatrooms = new Array();
var presentBool = 0;
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

server.listen(port,  address, function(){
	console.log("server listening \n");
});


server.on('connection', function(socket)
{
	clientNo++;
	console.log("connection received");
	socket.setEncoding('utf8');

	socket.on("data", function(message){
	


		if(message.includes("JOIN_CHATROOM:"))
		{
			//convert to array in order to extract room name and client name
			
			var data = message.toString().split('\n');
			var room = data[0].toString().split(' ');
			var name = data[3].toString().split(' ');

			chatroomName = room[1].toString();
			username = name[1].toString();

			var position = 0;

			//check if username is taken?
	
			//create chatroom
			var index = roomAlreadyExists(chatroomName);

			if(index >= 0)
			{			

				//check that the user is not already in another chatroom
				for(var i = 0; i < socketArray.length; i++)
				{
					if(socketArray[i].name === username)
					{
						presentBool = 1;
					}
				}

				if(presentBool === 0)
				{
					socket.name = username;
					socketArray.push(socket);
				}
				
				presentBool = 0;
				position = chatrooms[index].length;
				chatrooms[index][position] = username;
	
				socket.write("JOINED_CHATROOM: "+ chatroomName + "\n"
								+ "SERVER_IP: " + address + "\n"
								+ "PORT: " + port + "\n"
								+ "ROOM_REF: "  + index + "\n"
								+ "JOIN_ID: " + clientNo + "\n");

				/*socket.write("CHAT: " + index + "\n"
							+ "CLIENT_NAME: " + username + "\n"
							+ "MESSAGE:" + username + " has joined this chatroom." + "\n");*/

				joinBroadcast(index, username);
						
				//broadcast(index, username + " joined the chat", username);					
					
			}
			else
			{
				if(chatrooms[(chatrooms.length-1)][CHATROOM_COLUMN] != "default")
				{
					//server full please join an existing group
					socket.write('Our server cannot accomodate another chatroom, please join an existing one: \nThe existing rooms are: \n');
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

					for(var i = 0; i < socketArray.length; i++)
					{	
						if(socketArray[i].name === username)
						{
							presentBool = 1;
						}
					}
				
					if(presentBool === 0)
					{
						socket.name = username;
						socketArray.push(socket);
					}

					presentBool = 0;
					position = chatrooms[index].length;
					chatrooms[index][position] = username;

					socket.write("JOINED_CHATROOM: " + chatroomName + "\n"
								+ "SERVER_IP: " + address + "\n"
								+ "PORT:" + port + "\n"
								+ "ROOM_REF: " + index + "\n"
								+ "JOIN_ID: " + clientNo + "\n");

					/*socket.write("CHAT: " + index + "\n"
							+ "CLIENT_NAME: " + username + "\n"
							+ "MESSAGE:" + username + " has joined this chatroom." + "\n");*/

					joinBroadcast(index, username);
				}
			}
		}
		else if(message.includes("LEAVE_CHATROOM:"))
		{
			
			//leave room but DON'T CLOSE SOCKET

			var data = message.toString().split("\n");

			var room = data[0].toString().split(" ");	
			var roomRef = room[1].toString();	

			var join = data[1].toString().split(" ");
			var joinId = join[1].toString();

			var client = data[2].toString().split(" ");
			var clientName = client[1].toString();

			var a = parseInt(roomRef,10);
			var b = parseInt(joinId,10);

			socket.write("LEFT_CHATROOM: " + roomRef + "\n" 
								+ "JOIN_ID: " + joinId + "\n");


			leaveBroadcast(roomRef, socket.name);

			for(var x = 0; x < chatrooms[roomRef].length; x++)
			{
				if(chatrooms[roomRef] === clientName)
				{
					chatrooms[roomRef].splice(x, 1);
				}
			}

			//socket.end();
			
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
			socket.destroy();
			server.close();
		}
		else if(message.includes("HELO"))
		{
			socket.write(message 
						+ "IP: " + address + "\n"
						+ "Port: " + port + "\n"
						+ "StudentID: " + studentId + "\n");
		}
		else
		{
			//unknown command
		}
		

	});

	socket.on("error", function(){

	});
	socket.on("close", function(){
		console.log("hello");
	});

	

});

function joinBroadcast (room, sender)
{
	var sock = socketArray[0];
	var name;
	for (var x = 0; x <chatrooms[room].length; x++)
	{
		name = chatrooms[room][x].toString();

		for (var y = 0; y < socketArray.length; y++)
		{
			sock = socketArray[y];
			//process.stdout.write(sock);

			if (sock.name === name)
			{
				sock.write("CHAT: " + room + "\n"
							+ "CLIENT_NAME: " + sender + "\n"
							+ "MESSAGE:" + sender + " has joined this chatroom.\n\n");
			}
		}
	}
}

function leaveBroadcast(room, sender)
{
	
	var sock = socketArray[0];

	var name;
	for (var x = 0; x <chatrooms[room].length; x++)
	{
		name = chatrooms[room][x].toString();
		

		for (var y = 0; y < socketArray.length; y++)
		{
			sock = socketArray[y];
			

			if (sock.name === name)
			{
				
				sock.write("CHAT: " + room + "\n"
						+ "CLIENT_NAME: " + sender + "\n"
						+ "MESSAGE: " + sender + " has left this chatroom.\n\n");
			}
		}
	}
}
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
						sock.write("CHAT: " + room + "\n"
								+ "CLIENT_NAME: " + sender + "\n"
								+"MESSAGE: " + message + "\n\n");
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
