const BJ_MAP_UTIL = (function () {
  if (typeof BigNumber !== 'function') {
    console.warn('未引入 BigNumber.js，直接计算坐标，速度更快');
  } else {
    console.warn('检测到 BigNumber.js，用以计算坐标，精度更准，但速度较慢');
  }
  function isPointInRing(lngLat, range) {
    const [X, Y] = lngLat;
    const LINE_LIST = [];
    let L = range.length;
    if (L < 3) {
      console.warn('坐标少于3个，无法构建多边形！');
      return false;
    }
    const [x_first, y_first] = range[0];
    const [x_last, y_last] = range[L - 1];
    if (x_first === x_last && y_first == y_last) {
      // console.warn("首尾坐标相同，自动去除最后一点");
    }
    range.splice(-1, 1);
    L = range.length;
    if (L < 3) {
      console.warn('坐标少于3个，无法构建多边形！');
      return false;
    }

    range.forEach((p, i) => {
      const NEXT_I = i + 1;
      const NEXT_TEMP = NEXT_I == L ? 0 : NEXT_I;
      const NEXT_P = range[NEXT_TEMP];
      LINE_LIST.push([p, NEXT_P]);
    });
    let leftSide = 0;
    let rightSide = 0;
    let isOnLine = false;
    const ONLINE_RESULT = 1;
    const l = LINE_LIST.length;
    for (let index = 0; index < L; index++) {
      let line = LINE_LIST[index];
      let [x1, y1] = line[0];
      let [x2, y2] = line[1];

      let x_max = Math.max(x1, x2);
      let x_min = Math.min(x1, x2);
      let y_max = Math.max(y1, y2);
      let y_min = Math.min(y1, y2);
      if (y_min <= Y && Y <= y_max) {
        if (x1 == x2) {
          if (X == x1) {
            isOnLine = true;
            return ONLINE_RESULT;
          }
          if (x1 < X) {
            rightSide++;
          }
          if (X < x1) {
            leftSide++;
          }
        } else if (y1 == y2) {
          if (x_min <= X && X <= x_max) {
            isOnLine = true;
            return ONLINE_RESULT;
          }
          if (x_max < X) {
            rightSide++;
          }
          if (X < x_min) {
            leftSide++;
          }
        } else {
          let X0 = ((Y - y1) / (y2 - y1)) * (x2 - x1) + x1;
          if (typeof BigNumber === 'function') {
            x0 = BigNumber(Y)
              .minus(BigNumber(y1))
              .div(BigNumber(y2).minus(BigNumber(y1)))
              .multipliedBy(BigNumber(x2).minus(BigNumber(x1)))
              .plus(BigNumber(x1))
              .toNumber();
          }
          if (X == X0) {
            isOnLine = true;
            return ONLINE_RESULT;
          }
          if (X0 < X) {
            rightSide++;
          }
          if (X < X0) {
            leftSide++;
          }
        }
      }
    }
    if (isOnLine) {
      return 1;
    }
    if (leftSide % 2 == 1 && rightSide % 2 == 1) {
      return true;
    }
    return false;
  }

  /** 通用赋值警告 */
  var set = function () {
    console.warn('This object has not setter ! ');
  };
  /** 将要暴露的变量，添加到_obj 中  */
  var _obj = {};
  Object.defineProperty(_obj, 'isPointInRing', {
    get() {
      return isPointInRing;
    },
    set,
  });
  return _obj;
})();
