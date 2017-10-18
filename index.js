const fs = require('fs');
const { Composer, Markup, Extra } = require('micro-bot');
const app = new Composer();

const locationCount = 5;

app.command('start', ({ reply }) =>
  reply('One time keyboard', Markup
    .keyboard([['/new_game', '/join_game']])
    .oneTime()
    .resize()
    .extra()
  )
);

app.command('new_game', (ctx) => {
  return ctx.reply('How many players?', Extra.HTML().markup((m) =>
    m.inlineKeyboard([
      m.callbackButton('3', 'create_game 3'),
      m.callbackButton('4', 'create_game 4'),
      m.callbackButton('5', 'create_game 5'),
      m.callbackButton('6', 'create_game 6'),
      m.callbackButton('7', 'create_game 7'),
      m.callbackButton('8', 'create_game 8'),
      m.callbackButton('9', 'create_game 9')
    ])))
});

app.action(/create_game (.+)/, (ctx) => {
  startNewGame(ctx.match[1]);
  ctx.answerCallbackQuery('Go!');
});

app.command('join_game', (ctx) => ctx.reply('Welcome!'));

app.command('/locations', (ctx) => {
  const locs = getLocationList();
  console.log(locs);
  ctx.reply(locs.join(", "));
});

app.on('sticker', ({ reply }) => reply('👍'));

startNewGame = (playersCount) => {
  const spyNum = Math.floor(Math.random() * playersCount) + 1;
  
  console.log(spyNum);
};

getLocationList = () => {
  return JSON.parse(fs.readFileSync('locations.json', 'utf8'));
};

module.exports = app;
