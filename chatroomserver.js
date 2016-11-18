var net = require('net');
var IP = require('quick-local-ip');

//var address = IP.getLocalIP4();
var ipAddress = "192.168.0.11";

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


var clientNo = 0;


//note to self: create array to store user and the room they are in? for easy removal?
//maybe use a map?

net.createServer(function(socket){
	
	clientNo++;

	//socket.name = "Client " + clientNo;
	//process.stdout.write("ONE \n");

	//chatClients.push(socket);
	//socket.write("Welcome " + socket.name + "/n");
	//broadcast(socket.name + " joined the chat", socket);


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

			/*
			for(var x = 0; x < chatrooms.length; x++)
			{
				if(chatrooms[x] === chatroomName)
				{
					for (var y = 0; y < chatrooms[x].length; y++)
					{
						if(chatrooms[x][y] === username)
						{
							socket.write("Ooops there's already someone with that username in this chat!");
						}
					}
				}
			}*/

			var position = 0;
			//check if username is taken
	
			//create chatroom
			var index = roomAlreadyExists(chatroomName);

			if(index >= 0)
			{

				position = chatrooms[index].length;
				chatrooms[index][position] = username;

					socket.write("JOINED_CHATROOM: " + chatroomName + "\n"
								+ "SERVER_IP: " + ipAddress + "\n"
								+ "PORT: 7070 \n"
								+ "ROOM_REF: " + index + "\n"
								+ "JOIN_ID: " + clientNo);
			}
			else
			{
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

					chatrooms[index][CHATROOM_COLUMN] = chatroomName

					position = chatrooms[index].length;
					chatrooms[index][position] = username;

					socket.write("JOINED_CHATROOM: " + chatroomName + "\n"
								+ "SERVER_IP: " + ipAddress + "\n"
								+ "PORT: 7070 \n"
								+ "ROOM_REF: " + index + "\n"
								+ "JOIN_ID: " + clientNo);
				}
			}
		}
		else if(message.toString().substring(0,15)==="LEAVE_CHATROOM:")
		{
			//leave room but DON'T CLOSE SOCKET

			var data = message.toString().split("\n");

			var room = data[0].toString().split(" ");	
			var roomRef = room[1].toString();	

			var join = data[1].toString().split(" ");
			var joinId = join[1].toString();

			var client = data[2].toString().split(" ");
			var clientName = client[1].toString();


			for(var x = 0; x < chatrooms[roomRef].length; x++)
			{
				if(chatrooms[roomRef][x] === clientName)
				{
					chatrooms[roomRef].splice(x, 1);
					socket.write("LEFT_CHATROOM: " + roomRef + "\n" 
								+ "JOIN_ID: " + joinId);
				}
			}


		}
		else if(message.toString().substring(0, 11)==="DISCONNECT:")
		{
			//terminate connection
			var data = message.toString().split("\n");
			var client = data[2].toString().split(" ");
			var clientName = client[1].toString();

			leaveChat(clientName);
			//socket.write("LEFT_CHATROOM: " +  + "\n" 
			//					+ "JOIN_ID: " + );
			socket.end();
		}
		else if(message.toString().substring(0,4)==="CHAT:")
		{
			var data = message.toString().split("\n");

			var chatroom = data[0].toString().split(" ");
			var roomRef = chatroom[1].toString();

			var join = data[1].toString().split(" ");
			var joinId = join[1].toString();

			var client = data[2].toString().split(" ");
			var clientName = client[1].toString();

			var theMessage = data[4].toString();

			process.stdout.write(theMessage);



			//broadcast message
			//broadcast(socket.name + "/n >" + message, socket);
		}
		

	});


	socket.on("end", function(){
		//chatClients.splice(chatClients.indexOf(socket), 1);
		//broadcast(socket.name + " left the chat. \n");
	})

	function broadcast(roomRef, message, sender)
	{
		for(var x = 0; x <chatrooms[roomRef].length; x++)
		{
			socket.write()
		}
	}

}).listen(7070);

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
				}
			}
		}
	}
