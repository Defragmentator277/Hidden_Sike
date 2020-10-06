express = require('express');
app = express();
http = require('http').Server(app);
io = require('socket.io').listen(http);

var players = {};

app.use('/', express.static(__dirname + '/client'));
app.use('/', express.static(__dirname + '/sprites'));
//connection - встроенный при подключении
io.on('connection', (socket) =>
{
    console.log('Пользователь подключился');
    players[socket.id] = 
    {
        x: Math.round(Math.random() * 800),
        y: Math.round(Math.random() * 600),
        rotation: 0,
        playerId: socket.id,
        team: 'hidden'
    };
    Status_Players(players);
    //Вызов события в клиенте, по добавлению игроков
    socket.emit('currentPlayers', players);
    //Создание нового игрока и обновление информации у других игроков
    socket.broadcast.emit('newPlayer', players[socket.id]);

    //disconnect - встроенный при октлючении
    socket.on('disconnect', () => 
    {
        delete players[socket.id];
        io.emit('disconnect', socket.id);
        console.log('Игрок был удален');
        Status_Players(players);
    })

    socket.on('posChainge', (info) => 
    {
        players[socket.id].x = info.x;
        players[socket.id].y = info.y;
        socket.broadcast.emit('posChainged', players[socket.id]);
    });
});
//
app.get('/', (req, res) => 
{

});

http.listen(8080, () => 
{
    console.log('All fine!');
});
//STATUS FUNCTIONS

function Status_Players(players)
{
    console.log(players);
    console.log(`Всего игроков: ${Object.keys(players).length} Время:${new Date()}`);
}