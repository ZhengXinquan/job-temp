![笛卡尔坐标系.png](/img.php?20211201519078050950266c7b33fe1f66626198.png)


[MDN Web Docs：缩放 Scaling ] (https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Transformations)
>使用translate(0,canvas.height); scale(1,-1); 以y轴作为对称轴镜像反转， 就可得到著名的笛卡尔坐标系，左下角为原点

因此，修改之前的代码如下

```javascript

var ctx = document.getElementById('myCanvas').getContext('2d');
	let canvasWidth = 600, canvasHeight = 400
	let area = [{"x":39.075069,"y":117.22905},{"x":39.074902,"y":117.22673}...];
	let points=[{"x":39.047335,"y":117.203573}];
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
  let yoffset =  yMax * scale - canvasHeight / 3 / 2 *5 ;  //  * 这里开始不同 * 

	
	//以y轴作为对称轴镜像反转， 就可得到著名的笛卡尔坐标系，左下角为原点 Start
	ctx.translate(-xoffset,canvasHeight+yoffset); 
  ctx.font = '14px Arial';
  ctx.strokeText(`坐标原点：${xoffset / scale},${yoffset / scale}`,xoffset+14,-yoffset-14);
  ctx.scale(1,-1);
	//以y轴作为对称轴镜像反转， 就可得到著名的笛卡尔坐标系，左下角为原点 End

	//标记原点
	drawPoint(xoffset,yoffset);
	
    //放大坐标
	area=area.map(obj=>{
	return [obj.x*scale,obj.y*scale];
	})

    //画多边形
	drawArea(area)
 
	//放大坐标  画点
	points.forEach(obj => {
		drawPoint(obj.x*scale,obj.y*scale);
	});
	
	function drawArea(area) {
		ctx.beginPath(); //开始绘制
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
		ctx.stroke(); //进行绘制
	}

	// 用一个短的线段表示点
	function drawPoint(xxx, yyy) {
		ctx.beginPath(); //开始绘制
		ctx.lineWidth = 4;
		ctx.strokeStyle = 'red';

		ctx.moveTo(xxx, yyy); //坐标起点
		ctx.lineTo(xxx + 2, yyy + 2); //终点,或者理解为下一个点
		ctx.closePath();
		ctx.stroke(); //进行绘制
	}

```