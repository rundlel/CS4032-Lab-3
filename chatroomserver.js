var net = require('net');

var chatroom1[];
var chatroom2[];
var chatroom3[];
var clientNo =0;

//note to self: create array to store user and the room they are in? for easy removal?
//maybe use a map?

net.createServer(function(socket){
	//clientNo++;
	//socket.name = "Client " + clientNo;


	//chatClients.push(socket);
	//socket.write("Welcome " + socket.name + "/n");
	//broadcast(socket.name + " joined the chat", socket);


	socket.on("data", function(message){

		if(message.toString().substring(0,14)==="JOIN_CHATROOM:")
		{
			//convert to array in order to extract room name and client name
			var data = message.toString().split("/n");
			var room = data[0].toString().split(" ");	

			process.stdout.write(data[0] + "/n");
			for( var i = 0; i<room.length; i++)
			{
				process.stdout.write(room[i] + " ");
			}

			if room[1] === "one"
			{
				process.stdout.write("successfully joined chatroom one");
			}
			else if room [1] === "two"
			{

			}
			else if room[1] === "three"
			{

			}
			else
			{
				socket.write("This chat room doesn't exist");
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
		broadcast(socket.name + " left the chat. /n");
	})

	function broadcast(message, sender)
	{
		chatClients.forEach(function(client){
			if client===sender 
			{
				return;
			}
			client.write(message);
		});
		process.stdout.write(message);
	}

}).listen(7070);
