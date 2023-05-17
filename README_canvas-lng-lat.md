![根据地图经纬度绘制canvas电子围栏2.png](/img.php?20211130b285526967be4ddcde1eba959fd5ec73.png)

# 根据地图经纬度绘制 canvas 电子围栏

## 画个坐标轴

![根据地图经纬度绘制 canvas 电子围栏-画个坐标.png](/img.php?20211130ab22faf1899d3f9f76c417f5da3d7519.png)

## 坐标转换

把输入的经纬度坐标转换为显示在 canvas 上的坐标

![根据地图经纬度绘制canvas电子围栏-坐标转换.jpg](/img.php?20211130c4b4b20e1e6425728304219bcb7336ac.jpeg)

## 坐标放大

地图上的一小寸，是人类实际跨越的一大大大大……步

比如 `A [39.075069,117.22905]` 和 `B [39.074902,117.22673]` ，两个坐标点的值相差的量级只有 `0.001`。

而 canvas 是最小显示是`1像素`。

所以要把坐标放大，比如 100 万倍： 39.075069117 × 1000000 - 39.074902117 × 1000000 = 167，就可以在 canvas 上显示出两个点的距离了。

```javascript
// 转换 并 放大 原始坐标
area = area.map(p => {
  return [p.x * scale + x0, (y0 - p.y) * scale];
});
```

![根据地图经纬度绘制canvas电子围栏-坐标放大.jpg](/img.php?2021113067c23230984964053b5217b70761068f.jpeg)

这样，解决了坐标值的差距问题，又出现了另一个问题：_ 看不见点了！_

因为 canvas 的可见视野就是预设的 1000\*800，如上图所示：蓝色框外都不可见！！

## 原点移动

![根据地图经纬度绘制canvas电子围栏-原点平移.jpg](/img.php?20211130ee5fec6e83da600b29acff19076d066a.jpeg)

通过 ` ctx.translate(-xoffset, -yoffset);` 平移坐标原点，把经纬点所在的区域显示在视野里！

## 结果展示

最终结果是这样的（测试红点是不是在电子围栏内？）

![根据地图经纬度绘制canvas电子围栏2.png](/img.php?20211130b285526967be4ddcde1eba959fd5ec73.png)

## 在线 DEMO

[经纬度转直角坐标-根据地图经纬度绘制 canvas 电子围栏](http://demo.nanshanqiao.com/canvas-lng-lat.html)

## 核心代码

```javascript
    let myCanvas = document.querySelector('canvas');
    let ctx = myCanvas.getContext('2d');
    //原始数据
    let points = [{"x":39.047335,"y":117.203573}]; //检测点
    let area = [{"x":39.075069,"y":117.22905},{"x":39.074902,"y":117.22673}...] // 电子围栏坐标
    // 所有点
    const ALL_POINT = [...points, ...area];
    let xMax = Math.max(...ALL_POINT.map(e => e.x));
    let xMin = Math.min(...ALL_POINT.map(e => e.x));
    let yMax = Math.max(...ALL_POINT.map(e => e.y));
    let yMin = Math.min(...ALL_POINT.map(e => e.y));
    // 根据canvas宽高计算缩放级别 占坐标视野的2/3
    let xScale = ((canvasWidth / 3) * 2) / (xMax - xMin); // 每1坐标占多少宽度
    let yScale = ((canvasHeight / 3) * 2) / (yMax - yMin); // 每1坐标占多少宽度
    let scale = Math.min(xScale, yScale);
    // 计算canvas原点坐标偏移量  居中显示
    let xoffset = xMin * scale - canvasWidth / 3 / 2;
    let yoffset = (y0 - yMax) * scale - canvasHeight / 3 / 2;
    ctx.translate(-xoffset, -yoffset);
    // 计算当前坐标轴的原点，并在canvas上画出数值
    const X00 = x0 + xoffset;
    const Y00 = y0 + yoffset;
    // drawPoint(X00, Y00);
    console.log('X00,Y00 放大：', X00, Y00);
    console.log('X00,Y00 实际', X00 / scale, y0 - Y00 / scale);
    ctx.font = '14px Arial';
    ctx.strokeText(`坐标原点：${X00 / scale},${y0 - Y00 / scale}`, X00 - 16, Y00 + 16);
    // 转换并放大原始坐标
    area = area.map(p => {
      return [p.x * scale + x0, (y0 - p.y) * scale];
    });
    // 画多边形
    drawArea(area);
    // 画点
    points.forEach(p => {
      const xx = p.x * scale + x0;
      const yy = (y0 - p.y) * scale;
      drawPoint(xx, yy);
    });
    function drawArea(area) {
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'blue';
      area.forEach(([xx, yy], i) => {
        if (i == 0) {
          ctx.moveTo(xx, yy);
        } else {
          ctx.lineTo(xx, yy);
        }
      });
      ctx.closePath();
      ctx.stroke();
    }
    function drawPoint(xxx, yyy) {
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'red';
      ctx.moveTo(xxx, yyy);
      ctx.lineTo(xxx + 2, yyy + 2);  // 用一个短的线段表示点
      ctx.closePath();
      ctx.stroke();
    }
```
