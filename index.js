
const fs = require('fs');
const { Composer, Markup, Extra } = require('micro-bot');
const app = new Composer();

_startNewGame = (ctx) => {
  currentGame.active = true;
  currentGame.playersCount = ctx.match[1] + 1;
  currentGame.spyNum = Math.floor(Math.random() * currentGame.playersCount) + 1;
  const randomLocationNum = Math.floor(Math.random() * currentGame.locations.length);
  currentGame.location = currentGame.locations[randomLocationNum];
  
  console.log(currentGame.location);
  _joinGame(ctx);
};

_joinGame = (ctx) => {
  let message = ctx.update.message || ctx.update.callback_query.message;
  console.log(message);
  let alreadyIn = currentGame.players.find((user) => user.id === message.from.id);
  if (alreadyIn) {
    return ctx.reply('Вы уже в игре');
  }
  currentGame.players.push({
    id: message.from.id,
    username: message.from.username
  });
  if (currentGame.players.length === currentGame.spyNum) {
    return ctx.reply('Поздравляю, вы - шпион, удачи.').catch(err => console.log(err));
  }
  if (currentGame.players.length == (currentGame.playersCount - 1)) {
    ctx.reply('Расчет окончен, давайте сыграем.');
    _resetGame();
  }
  return ctx.reply(currentGame.location).catch(err => console.log(err));
};

_getLocationList = () => {
  return JSON.parse(fs.readFileSync('locations.json', 'utf8'));
};

_resetGame = () => {
  currentGame = {
    active: false,
    playersCount: 0,
    players: [],
    spyNum: 0,
    spyPlayer: 0,
    locations: _getLocationList(),
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
      ]))).then(next)
  }
});

app.command('reset', () => {
  _resetGame();
});

app.command('locations', (ctx) => {
  const locs = getLocationList();
  console.log(locs);
  ctx.reply(locs.join(', '));
});

app.action(/create_game (.+)/, (ctx) => {
  ctx.answerCallbackQuery('Go!');
  _startNewGame(ctx);
});

app.on('sticker', ({ reply }) => reply('👍'));


module.exports = app;
