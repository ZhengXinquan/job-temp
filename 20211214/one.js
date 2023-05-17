/**
 *  cd job-temp/20211214 
 *  node one.js
 * 
 */
const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf-8');
let css = fs.readFileSync('css.css', 'utf-8');
let js = fs.readFileSync('index.js', 'utf-8');
let country = fs.readFileSync('country.js', 'utf-8');

html = html.replace('<link rel="stylesheet" href="css.css" />', `<style>${css}</style>`);
html = html.replace('<script type="text/javascript" src="country.js"></script>', `<script>${country}</script>`);
html = html.replace('<script type="text/javascript" src="index.js"></script>', `<script>${js}</script>`);





fs.writeFile('order-dist-annalysis.html', html, err => {
    console.log('生成成功');
  });