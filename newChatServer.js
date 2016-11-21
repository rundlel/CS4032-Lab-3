var net = require('net');
var IP = require('quick-local-ip');

var address = IP.getLocalIP4();
var port = 7060;
var studentId = 13321661;

var chatrooms = new Array();
const CHATROOM_COLUMN = 0;



var clientNo = 0;


//note to self: create array to store user and the room they are in? for easy removal?
//maybe use a map?

var server = new net.createServer();

server.listen(port,  address, function(){
	console.log("server listening \n");
});


server.on('connection', function(socket){

	clientNo++;
	console.log("connection received");
	socket.setEncoding('utf8');

	socket.on("data", function(message){

		if(message.includes("JOIN_CHATROOM:"))
		{
			
			joinChatroom(socket, message);


		}
		else if(message.includes("LEAVE_CHATROOM:"))
		{
			var data = message.toString().split("\n");

			var room = data[0].toString().split(" ");	
			var roomRef = room[1].toString();	

			var join = data[1].toString().split(" ");
			var joinId = join[1].toString();

			var client = data[2].toString().split(" ");
			var clientName = client[1].toString();

			socket.write("LEFT_CHATROOM: " + roomRef + "\n" 
								+ "JOIN_ID: " + joinId + "\n");


			var b = " has left this chatroom.\n\n";
			broadcast(roomRef, clientName, b);	

			var sock = chatrooms[roomRef];

			for(var x = 0; x < chatrooms[roomRef].length; x++)
			{
				if(sock.name === clientName)
				{
					chatrooms[roomRef].splice(x, 1);
				}
			}
		}
		else if(message.includes("DISCONNECT:"))
		{
			var data = message.toString().split("\n");
			var client = data[2].toString().split(" ");
			var clientName = client[1].toString();

			leaveChat(clientName);

			//find the chatrooms the client is in
			var sock;
			for(var t = 0; t < chatrooms.length; t++)
			{
				for(var u = 0; u < chatrooms[t].length; t++)
				{
					sock = chatrooms[t][u];
					if(sock.name === clientName)
					{
						chatrooms[t].splice(u,1);
					}
				}
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

	socket.on("error", function(error){

	});

	socket.on("end", function(){
		
	});

});

function broadcast (room, sender, message)
{
	var sock;
	for (var x = 1; x <chatrooms[room].length; x++)
	{
			sock = chatrooms[room][x];
			sock.write("CHAT: " + room + "\n"
					+ "CLIENT_NAME: " + sender + "\n"
					+ "MESSAGE: " + sender + message);
	}
}


function messageBroadcast(room, message, sender)
{
	var sock;
	for (var x = 1; x <chatrooms[room].length; x++)
	{
			sock = chatrooms[room][x];
			sock.write("CHAT: " + room + "\n"
					+ "CLIENT_NAME: " + sender + "\n"
					+"MESSAGE: " + message + "\n\n");
	}
}

	function joinChatroom(socket, message)
	{
		var data = message.toString().split('\n');
		var room = data[0].toString().split(' ');
		var name = data[3].toString().split(' ');

		chatroomName = room[1].toString();
		username = name[1].toString();

		var index = roomAlreadyExists(chatroomName);

		if(index < 0)
		{
			index = chatrooms.length;
			var temp = new Array();
			chatrooms[index] = temp;
			chatrooms[index][0] = chatroomName;
		}

	
		socket.write("JOINED_CHATROOM: "+ chatroomName + "\n"
					+ "SERVER_IP: " + address + "\n"
					+ "PORT: " + port + "\n"
					+ "ROOM_REF: "  + index + "\n"
					+ "JOIN_ID: " + clientNo + "\n");

		socket.name = username;
		chatrooms[index].push(socket);



		var b = username + " has joined this chatroom.\n\n";

		var sock;
		for (var x = 1; x <chatrooms[index].length; x++)
		{
			sock = chatrooms[index][x];
			sock.write("CHAT: " + index + "\n"
					+ "CLIENT_NAME: " + username + "\n"
					+ "MESSAGE: " + b);
		}	

		
		//broadcast(index, username, b);		
	}

	function roomAlreadyExists(name)
	{
		for(var i = 0; i<chatrooms.length; i++)
		{
			if(chatrooms[i][CHATROOM_COLUMN].toString() === name)
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
