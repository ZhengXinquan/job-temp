![Node.js](/img.php?202111241689b5a3e6b88e8f73a13b3768bfa7c9.png)

# 判断点是否在多边形内部

## 射线法

[射线法](https://baike.baidu.com/item/%E5%B0%84%E7%BA%BF%E6%B3%95/22231858?fr=aladdin)。该法中常用水平扫描线法或垂直线法来判断一点是否在区域内。假若有一疑问点 `P(x0，y0)`，要判斯它是否在多边形内，可从该疑问点向左引水平扫描线(即射线)。

## 引申 射线法

1. 前提：~多边形是用顺序的点坐标表示~。
2. 多边形各个边 是 线段（端点属于此边），两端点坐标已知 `A(xa,ya)` 和 `B(xb,yb)`，可以求得线段的表达式。
3. 以疑问点 `P(x0，y0)`，作一条水平线 `y=y0`， 如果 `ya ≤ y0 ≤ yb`，则水平线与线段`AB`相交，否则不相交。
4. 若相交，求交点坐标 `J(xj,yj)`, 已知`yj = y0`,则 `xj = ((y0 - ya) / (yb - ya)) * (xb - xa) + xa`
   a. `xj = x0` , `P` 与 `J` 重合，即 点在线上，返回 `1`，结束;
   b. `xj < x0` , `J` 在 `P` 左侧，则 `left++`;
   c. `xj < x0` , `J` 在 `P` 右侧，则 `right++`;
   d. 如果 `left` 和 `right` 都为奇数，则 点在多边形内，返回 `true`
   e. 其它 返回 `false`

## 代码下载

[isPointInRing.min.js](https://www.nanshanqiao.com/dist/isPointInRing.min.js)

## 代码使用

引入后 执行 `BJ_MAP_UTIL.isPointInRing(POINT, PATH)`

`POINT` 为 检测点 `[x,y]`

`PATH`是多边形点集合 `[[x1,y1],[x2,y2]...]`

## 代码精度

与高德地图 API `AMap.GeometryUtil.isPointInRing` 相比：

1. 多边形内外，判断一致
2. 多边形顶点，高德全部返回 `false`；此算法归到`点在线上`，都返回`1`
3. 多边形边上，高德部分返回 `false`，部分返回`true`；此算法归到`点在线上`，都返回`1`

## 代码速度

与高德地图 API `AMap.GeometryUtil.isPointInRing` 相比

耗时减少了近`80%`

（63667 个测试点，高德耗时`21.086s`,此算法耗时`4.676s`）

- postMessage （推荐）
- jsonp
- [其它](https://www.cnblogs.com/lcspring/p/11079754.html)

## 一步一步实现本地 node 代理转发请求

### 1. node 下载与安装

[Node.js 安装配置](https://www.runoob.com/nodejs/nodejs-install-setup.html)

### 2. 安装 Express 框架 方便构建 web 服务

```
npm install express --save
```

### 3. 安装 express-http-proxy 代理插件

```
npm install express-http-proxy --save
```

### 4. 入口文件 `index.js`

```javascript
var express = require('express');

var app = express();
app.use(express.json());

// 转发到 http://api.xxx.com
const httpProxy = require('express-http-proxy');
const userServiceProxy = httpProxy('http://api.xxx.com', {
  //   请求路径解析，去掉标识串 /api
  proxyReqPathResolver: function (req) {
    return req.url.replace('/api', '');
  },
});

// 设置 /api 开头的链接执行代理
app.get('/api/*', (req, res, next) => {
  userServiceProxy(req, res, next);
});

// 把 /public 当作根目录，/public内的文件都为静态资源
app.use('/', express.static('public'));

app.get('*', function (req, res) {
  res.send('404');
});

var server = app.listen(8081, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('应用实例，访问地址为 http://%s:%s', host, port);
});
```

### 5. 测试 HTML 文件 `index.html` （位于/public）

```javascript
// 以/api开头，将被转发
// 实际请求地址为： http://api.xxx.com/getUserInfo
fetch('/api/getUserInfo', {
  method: 'GET',
  headers: new Headers({
    'Content-Type': 'application/json',
  }),
})
  .then(res => res.text())
  .catch(error => {
    console.error('- Error:', error);
  })
  .then(response => {
    console.log('- Success:', response);
    document.write(response);
  });
```
