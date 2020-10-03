class Game extends Phaser.Scene 
{
    constructor(conf)
    {
        super(conf);
        //
        this.players_scale = 0.03;
        this.textBufferSize = 5;
        //
        this.walls;
        this.this_player;
        this.players;
    }

    preload()
    {
        this.load.image('wall', '/sprites/wall.png');
        this.load.image('background', '/sprites/background.jpg');
        this.load.image('player', '/sprites/player_sprite.png');
    }

    create()
    {
        //buuu Dark Image
        this.add.image(0, 0, 'background').setTint(0x444444).setScale(0.4).setOrigin(0, 0);
        //Adding walls into group
        this.walls = this.add.group(
            [
                this.add.image(250, 250, 'wall'),
                this.add.image(500, 500, 'wall').setRotation(1.27),
                this.add.image(300, 500, 'wall').setRotation(1.78),
                this.add.image(500, 250, 'wall')
            ]
        );
        //Обработка события 
        //Создание сокета на стороне клиента
        this.socket = io();
        let scene = this; 
        this.players = this.add.group();
        this.popUpTexts = [];
        this.socket.on('currentPlayers', (current_players) => 
        {
            // console.log(Object.keys(current_players).length);
            // console.log(this.players.getLength());
            //В случаи если после перезапуска сервера остались устаревшие спрайты
            if(this.players.getLength() > 0)
                this.players.children.each(elem => elem.destroy());
            //В том числе и спрайт самого игрока
            if(this.this_player)
                this.this_player.destroy();
            Object.keys(current_players).forEach(id =>
            {
                if(id == this.socket.id)
                    this.addPlayer(current_players[id]);
                else
                    this.addOtherPlayer(current_players[id]);
            });
        });
        this.socket.on('newPlayer', (player) => 
        {
            this.addOtherPlayer(player); 
            this.addText('Player with Id: ' + player.playerId + ' was connected');
        });
        this.socket.on('disconnect', (id) => 
        {
            this.players.children.each(elem => 
            {   
                if(elem.playerId == id)
                {
                    elem.destroy();
                    this.addText('Player with Id: ' + id + ' was disconnected');
                }
            })
        });
    }

    update()
    {

    }

    addPlayer(player)
    {
        this.this_player = this.add.image(player.x, player.y, 'player').setTint(0xFF33FF).setScale(this.players_scale);
        this.this_player.rotation = player.rotation;
        this.this_player.playerId = player.playerId;
    }

    addOtherPlayer(player)
    {
        let oth_player = this.add.image(player.x, player.y, 'player').setScale(this.players_scale);
        oth_player.rotation = player.rotation;
        oth_player.playerId = player.playerId;
        oth_player.on('pointermove', (pointer) => 
        {

        });
        this.players.add(oth_player);
    }

    addText(string, delay = 1500)
    {
        let text = this.add.text(0, 550, string);
        this.popUpTexts.forEach(elem => 
        {
            elem.y -= 25;
        });
        if(this.popUpTexts.length >= this.textBufferSize)
        {
            fadeOut(this.popUpTexts.pop());
        }
        this.popUpTexts.unshift(text);
        this.fadeOut(text, delay);
    }

    fadeOut(elem, delay_t = 0)
    {
        this.tweens.add(
        {
            targets: elem,
            alpha: { from: 1, to: 0 },
            duration: 1000,
            delay: delay_t,
            onComplete: () => 
            {
                elem.destroy();
            }
        });
    }
}

var config = 
{
    type: Phaser.AUTO,
    width: 800, 
    height: 600,
    scene: Game,
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
        gravity: { y: 0 }
      }
    }
};

var game = new Phaser.Game(config);

