const path = require('path');
const Koa = require('koa');
const app = new Koa();
const generateUniqueId = require('./generateUniqueId');

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

const subscribes = Object.create(null);

router.get('/subscribe', async (ctx) => {
  const id = generateUniqueId();

  await new Promise((resolve, reject) => {
    subscribes[id] = resolve;
    ctx.req.on('close', reject);
  }).then((body) => {
    ctx.body = body;
  }).catch(() => {
    delete subscribes[id];
  });
});

router.post('/publish', async (ctx) => {
  const { message } = ctx.request.body;

  if (!message) {
    ctx.status = 400;
    ctx.body = { error: true, message: 'Invalid message' };
    return;
  }

  Object.entries(subscribes).forEach(([id, subscription]) => {
    subscription(message);
    delete subscription[id];
  });

  ctx.status = 200;
});

app.use(router.routes());

module.exports = app;
