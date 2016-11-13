var net = require('net');

var chatClients[];
 var clientNo =0;

net.createServer(function(socket){
	clientNo++;
	socket.name = "Client " + clientNo;

	chatClients.push(socket);
	socket.write("Welcome " + socket.name + "/n");
	broadcast(socket.name + " joined the chat", socket);



	socket.on("data", function(message){
		broadcast(socket.name + "/n >" + message, socket);

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

});.listen(7070);
