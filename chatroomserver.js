var net = require('net');
var IP = require('quick-local-ip');

//var address = IP.getLocalIP4();
var ipAddress = "10.6.86.103";
//two dimensional array to store the chatrooms and what clients are in the rooms

//INDEX |ROOM NAME|SOCKET|SOCKET| SOCKET.....
//0		|		  |		 |		|
//1		|		  |		 |		|
//2		|		  |		 |		|
//3		|		  |		 |		|


var chatrooms = new Array();
var joinedBool = 0;
const NUMBER_OF_ROOMS = 5;
chatrooms.push("one");
console.log(chatrooms[0].toString());

var clientNo = 0;


//note to self: create array to store user and the room they are in? for easy removal?
//maybe use a map?

net.createServer(function(socket){

	//socket.name = "Client " + clientNo;
	process.stdout.write("ONE \n");

	//chatClients.push(socket);
	//socket.write("Welcome " + socket.name + "/n");
	//broadcast(socket.name + " joined the chat", socket);
	clientNo++;
	//var ipAddress = socket.address().address;
	

	socket.on("data", function(message){

		if(message.toString().substring(0,14)==="JOIN_CHATROOM:")
		{
			//convert to array in order to extract room name and client name
			var data = message.toString().split("\n");
			var room = data[0].toString().split(" ");
			var name = data[3].toString().split(" ");

			chatroomName = room[1].toString();
			username = name[1].toString();
			//check if username is taken
	
			//create chatroom
			for(var i = 0; i<chatrooms.length; i++)
			{
				if (chatrooms[i] === chatroomName)
				{
					chatrooms.splice(i, username);
					socket.write("JOINED_CHATROOM: " + chatroomName + "\n"
								+ "SERVER_IP: " + ipAddress + "\n"
								+ "PORT: 7070 \n"
								+ "ROOM_REF: " + i + "\n"
								+ "JOIN_ID: " + clientNo);

					joinedBool = 1;

					broadcast(username + " joined the chat", socket);
				}
				
			}

			if(joinedBool===0)
			{
				if (chatrooms.length < NUMBER_OF_ROOMS)
				{
					chatrooms.splice(i, chatroomName, username);
					socket.write("JOINED_CHATROOM: " + chatroomName + "\n"
								+ "SERVER_IP: " + ipAddress + "\n"
								+ "PORT: 7070 \n"
								+ "ROOM_REF: " + i + "\n"
								+ "JOIN_ID: " + clientNo);

					broadcast(username + " joined the chat", socket);

				}
			}
				
			
			//convert to array in order to extract room name and client name
			

		}
		else if(message.substring(0,15)==="LEAVE_CHATROOM:")
		{
			//leave room but DON'T CLOSE SOCKET
		}
		else if(message.substring(0, 11)==="DISCONNECT:")
		{
			//terminate connection
		}
		else
		{
			//broadcast message
			broadcast(socket.name + "/n >" + message, socket);
		}
		

	});


	socket.on("end", function(){
		chatClients.splice(chatClients.indexOf(socket), 1);
		broadcast(socket.name + " left the chat. \n");
	})

	function broadcast(message, sender)
	{
		chatrooms.forEach(function(client){
			if (client===sender)
			{
				return;
			}
			client.write(message);
		});
		process.stdout.write(message);
	}

}).listen(7070);
