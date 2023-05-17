// 平均差（Mean Deviation）是表示各个变量值之间差异程度的数值之一。指各个变量值同平均数的离差绝对值的算术平均数。
function meanDeviation(arr) {
    let l = arr.length;
    let av =
      arr.reduce((t, n) => {
        return t + n;
      }) / l;
    return (
      arr.reduce((t, n) => {
        return t + Math.abs(n - av);
      }, 0) / l
    );
  }
  