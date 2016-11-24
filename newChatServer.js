var net = require('net');
var IP = require('quick-local-ip');

var address = IP.getLocalIP4();
var port = 7060;
var studentId = 13321661;

var chatrooms = new Array();
const CHATROOM_COLUMN = 0;

var clientNo = 0;
var testArray = new Array();
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

			socket.name = username;
			chatrooms[index].push(socket);

			socket.write("JOINED_CHATROOM: "+ chatroomName + "\n"
					+ "SERVER_IP: " + address + "\n"
					+ "PORT: " + port + "\n"
					+ "ROOM_REF: "  + index + "\n"
					+ "JOIN_ID: " + clientNo + "\n");


			var b = username + " has joined this chatroom.\n\n";

			testArray = chatrooms[index];
			var sock;


			for (var x = 1; x <testArray.length; x++)
			{
				sock = testArray[x];
				sock.write("CHAT: " + index + "\n"
					+ "CLIENT_NAME: " + username + "\n"
					+ "MESSAGE: " + b);
			}
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

			var sock;

			for(var x = 1; x < chatrooms[roomRef].length; x++)
			{
				sock =  chatrooms[roomRef][x];
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

			var sock;
			var tempSock;
			var temp = new Array();
			var message = " has left this chatroom. \n\n";

			for(var x = 0; x<chatrooms.length; x++)
			{
				for(var y = 1; y<chatrooms[x].length; y++)
				{
					temp = chatrooms[x];
					sock = chatrooms[x][y];

					if(sock.name === clientName)
					{
						for(var t = 1; t < chatrooms[x].length; t++)
						{
							tempSock = chatrooms[x][t];
							tempSock.write("CHAT: " +  x + "\n" 
							+ "CLIENT_NAME: " + clientName + "\n"
							+ "MESSAGE: " + clientName + message);
						}
						chatrooms[x].splice(y,1);
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

	function roomAlreadyExists(name)
	{
		var temp = new Array();
		for(var i = 0; i<chatrooms.length; i++)
		{
			temp = chatrooms[i];

			if(temp[0] === name)
			{
				return i;
			}
		}
		return -1;
	}
	
	server.on("close", function() {
	console.log("server closed");
});
