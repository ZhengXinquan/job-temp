// 重命名
const fs = require('fs');
const path = require('path');
// 修改文件所在的文件夹
var filePath = path.resolve('./');
fileDisplay(filePath);

//文件遍历方法
function fileDisplay(filePath) {
  //根据文件路径读取文件，返回文件列表: files
  fs.readdir(filePath, (err, files) => {
    if (err) {
      console.warn(err);
    } else {
      //遍历读取到的文件列表
      files.forEach(filename => {
        //获取当前文件的绝对路径
        var fileDir = path.join(filePath, filename);
        //根据文件路径获取文件信息，返回一个fs.Stats对象
        fs.stat(fileDir, (eror, stats) => {
          if (eror) {
            console.warn('获取文件stats失败');
          } else {
            var isFile = stats.isFile(); //是文件
            var isDir = stats.isDirectory(); //是文件夹
            if (isFile) {
              // 读取文件内容
              // var content = fs.readFileSync(fileDir, 'utf-8');
              // 文件重命名
              try {
                // 文件名
                let fileName = fileDir.split('\\').pop();
                let index = fileName.indexOf('xxx');
                if (index != -1) {
                  const newFileName = fileName.replace('xxx', 'FeiJi');
                  // console.log('@', newFileName);
                  let pathList = fileDir.split('\\');
                  pathList.pop();
                  pathList.push(newFileName);
                  const newPathToFile = pathList.join('\\');

                  console.log('@', fileDir);

                  fs.renameSync(fileDir, newPathToFile);
                }
              } catch (err) {
                throw err;
              }
            }
            if (isDir) {
              //递归，如果是文件夹，就继续遍历该文件夹下面的文件
              fileDisplay(fileDir);
            }
          }
        });
      });
    }
  });
}
