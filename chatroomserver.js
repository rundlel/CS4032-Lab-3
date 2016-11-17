var net = require('net');
var IP = require('quick-local-ip');

//var address = IP.getLocalIP4();
var ipAddress = "192.168.0.8";

//COLLEGE IP "10.6.86.103"
//HOME TPLINK IP 192.168.0.8
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
chatrooms.push("one");
console.log(chatrooms[0].toString());

var clientNo = 0;


//note to self: create array to store user and the room they are in? for easy removal?
//maybe use a map?

net.createServer(function(socket){

	//socket.name = "Client " + clientNo;
	//process.stdout.write("ONE \n");

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

					//broadcast(username + " joined the chat", socket);
				}
				
			}

			if(joinedBool===0)
			{
				var index=chatrooms.length;

				if (index < NUMBER_OF_ROOMS)
				{
					process.stdout.write("\n" + index + " " + chatroomName + " " + username + "\n");
					chatrooms.push(chatroomName);

					chatrooms.splice(index, username);
					socket.write("JOINED_CHATROOM: " + chatroomName + "\n"
								+ "SERVER_IP: " + ipAddress + "\n"
								+ "PORT: 7070 \n"
								+ "ROOM_REF: " + i + "\n"
								+ "JOIN_ID: " + clientNo);

					//broadcast(username + " joined the chat", socket);

					joinedBool = 1;

				}
				else
				{
					//ERROR too many chatrooms - pick one already there buddy
				}
			}
							

		}
		else if(message.toString().substring(0,15)==="LEAVE_CHATROOM:")
		{
			//leave room but DON'T CLOSE SOCKET
			process.stdout.write(" \n \n");

			

			for( var i=0; i < chatrooms.length; i++)
			{
				process.stdout.write(chatrooms[i].toString() + " \n");
			}

			var leaveMessage = message.toString().split("\n");
			var roomRef = leaveMessage[0].toString().split(" ");
			//process.stdout.write(roomRef[1].toString());

			var joinRef = leaveMessage[0]

			var clientName = leaveMessage[2].toString().split(" ");
			process.stdout.write(clientName[1].toString());

			//var index = chatrooms.indexOf(clientName);
			chatrooms.splice(chatrooms.indexOf(clientName),1);

			process.stdout.write(" \n \n");

			for( var i=0; i <= chatrooms.length; i++)
			{
				process.stdout.write(chatrooms[i] + " \n");
			}


			

		}
		else if(message.toString().substring(0, 11)==="DISCONNECT:")
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
		//chatClients.splice(chatClients.indexOf(socket), 1);
		//broadcast(socket.name + " left the chat. \n");
	})

	function broadcast(message, sender)
	{
	//	chatrooms.forEach(function(client){
	//		if (client===sender)
			{
				return;
			}
			
		//});
		process.stdout.write(message);
	}

}).listen(7070);
