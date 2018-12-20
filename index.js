const koa = require('koa');
const fs = require('fs');
const app = new koa();

const Router = require('koa-router');

const cors = require('koa2-cors');
const koaBody = require('koa-body'); //解析文件流
app.use(koaBody({
  multipart: true,  // 运行多个文件
  formidable: {
    maxFileSize: 200 * 1024 * 1024    // 设置上传文件大小最大限制，默认2M
  }
}));

// const bodyParser = require('koa-bodyparser');  // 不支持 form-data
// app.use(bodyParser({
//   extendTypes: {
//     json: ['application/x-javascript', 'application/x-www-form-urlencoded', 'multipart/form-data', 'text/xml'] // 支持的类型
//   }
// })); // post 获取参数

// 
app.use(cors({
  origin: function (ctx) {
    if (ctx.url === '/test') {
      return "*"; // 允许来自所有域名请求
    }
    return "*"; // 允许来自所有域名请求
    // return 'http://localhost:8080'; // 这样就能只允许 http://localhost:8080 这个域名的请求了
  },
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
  maxAge: 0,
  credentials: true,
  allowMethods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

// 主路由
let home = new Router();
home.get('/', async (ctx) => {
  let url = ctx.url;
  let request = ctx.request;
  let req_query = request.query;
  let req_queryString = request.querystring;
  const body = {
    url,
    req_query,
    req_queryString,
  };
  ctx.body = body;
});

// 子路由
let page = new Router();

page.get('/404', async (ctx) => {
  ctx.body = '404.page!';
})
  .get('/helloworld', async (ctx) => {
    ctx.body = 'hello world page';
  })
  .post('/post', async (ctx) => {
    console.log(ctx.request.query); // 获取 url 后面参数
    const { a, b } = ctx.request.body;
    const body = {
      a, b
    };
    ctx.body = body;
  })
  .post('/postForm', async (ctx) => {
    const { a, b } = ctx.request.body;
    const body = {
      a, b
    };
    ctx.body = body;
  })
  .post('/postText', async (ctx) => { // text/xml
    const body = `
      <a href="http://www.baidu.com">百度链接</a>
    `;
    ctx.body = body;
  })
  .post('/uploadfile', async (ctx) => { //  上传文件
    const file = ctx.request.files.file; // 获取上传文件
    console.log(file);
    const name = file.name;
    ctx.body = { name };
  });


// 装载所有子路由
let router = new Router();
router.use('/', home.routes(), home.allowedMethods());
router.use('/test', page.routes(), page.allowedMethods());

// 加载路由中间件
app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
  console.log('启动成功');
});