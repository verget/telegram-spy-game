const fs = require('fs');
const { Extra } = require('micro-bot');
const Telegraf  = require('micro-bot');
const app = new Telegraf(process.env.BOT_TOKEN);

_startNewGame = (ctx) => {
  console.log(currentGame.active);
  if (currentGame.active) {
    ctx.reply('Game already started');
    return false;
  }
  currentGame.active = true;
  currentGame.playersCount = ++ctx.match[1];
  currentGame.players = [];
  console.log(currentGame.playersCount + " players");
  currentGame.spyNum = Math.floor(Math.random() * currentGame.playersCount) + 1;
  console.log(currentGame.spyNum + " is spy");
  const locations = _getLocationList();
  const randomLocationNum = Math.floor(Math.random() * locations.length);
  currentGame.location = locations[randomLocationNum];
  return _joinGame(ctx);
};

_joinGame = (ctx) => {
  let message = ctx.update.message || ctx.update.callback_query.message;
  let alreadyIn = currentGame.players.find((user) => user.id === message.from.id);
  if (alreadyIn) {
    return ctx.reply('You are already in');
  }
  currentGame.players.push({
    id: message.from.id,
    username: message.from.username
  });
  if (currentGame.players.length === currentGame.spyNum) {
    ctx.reply('Congratulations! You are spy, good luck. (you can get locations list by send /locations)')
      .catch(err => console.log(err));
  } else {
    ctx.reply(currentGame.location.title).catch(err => console.log(err));
    ctx.replyWithPhoto({
      source: './img/' + currentGame.location.img,
      caption: currentGame.location.title
    }).catch(err => console.log(err));
  }
  if (currentGame.players.length == (currentGame.playersCount - 1)) {
    sendMessageToPlayers('Game started, lets play');
    //console.log(11);
    setTimeout(() => _finishGame(), 5 * 360000); //end game after 5 minutes
  }
};

_finishGame = () => {
  sendMessageToPlayers('Time is over. Spy won.');
  _resetGame();
};

sendMessageToPlayers = (text) => {
  if (!currentGame.players.length) {
    return false;
  }
  currentGame.players.forEach(player => {
    app.telegram.sendMessage(player.id, text);
  });
};

_getLocationList = () => {
  return JSON.parse(fs.readFileSync('locations.json', 'utf8'));
};

_setCurrentGame = (gameObject = null) => {
  if (!gameObject) {
    gameObject = {
      active: false,
      playersCount: 0,
      players: [],
      spyNum: 0,
      spyPlayer: 0,
      location: ''
    };
  }
  fs.writeFile('game.json', JSON.stringify(gameObject), (err) => {
    if (err) {
      console.error(err);
      return Promise.reject(err)
    }
    return Promise.resolve();
  })
};

_resetGame = () => {
  currentGame = {
    active: false,
    playersCount: 0,
    players: [],
    spyNum: 0,
    spyPlayer: 0,
    location: ''
  };
};

let currentGame = {};

_resetGame();

app.command('start', (ctx) => {
  if (currentGame.active) {
    _joinGame(ctx);
  } else {
    return ctx.reply('How many players?', Extra.HTML().markup((m) =>
      m.inlineKeyboard([
        m.callbackButton('3', 'create_game 3'),
        m.callbackButton('4', 'create_game 4'),
        m.callbackButton('5', 'create_game 5'),
        m.callbackButton('6', 'create_game 6'),
        m.callbackButton('7', 'create_game 7'),
        m.callbackButton('8', 'create_game 8'),
        m.callbackButton('9', 'create_game 9')
      ])
    ));
  }
});

app.command('reset', (ctx) => {
  ctx.reply('Current game cleared, you can start new by send /start');
  _resetGame();
});

app.command('locations', (ctx) => {
  return ctx.replyWithPhoto({
    source: './img/0.jpg'
  }).catch(err => console.log(err));
});

app.action(/create_game (.+)/, (ctx) => {
  ctx.answerCallbackQuery('Go!');
  ctx.deleteMessage();
  _startNewGame(ctx);
});

app.hears(/\/set (.+)/, (ctx) => {
  _startNewGame(ctx);
});

app.on('sticker', ({ reply }) => reply('👍'));

module.exports = app;
