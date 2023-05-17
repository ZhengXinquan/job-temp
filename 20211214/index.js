
let AddOrders = [];
const BUSINESS_CHANNEL = [
  'APP MOD',
  'APP MOP',
  'Elema',
  'Meituan',
  'Wechat WSG',
  'Wechat MOD',
  'Wechat MOP',
  'Koubei MOP',
  'Instore POS',
];
let BUSINESS_CHANNEL_CHECKED = [...BUSINESS_CHANNEL];

// 智能自提柜

// 招行掌上生活MOP

// 默认渲染所有订单
function showAllOrderPosition() {
  return $("#showAllOrder").prop('checked');
}
const POLYGONS = [];
let MAP_SHOPS = [];
let MAP_ORDERS = [];
let MAP_OVER_LINES = [];
let MAP_OVER_MARKERS_SHOP = [];
let MAP_OVER_MARKERS_ORDER = [];

const RES_STORE = {
  first: null,
  last: null,
};
/********  初始化地图  ********************/
var map = new AMap.Map('container', {
  center: [113.324698, 23.119207],
  // 设置地图级别，级别为数字。
  // PC上，参数zoom可设范围：[3,18]；
  // 移动端：参数zoom可设范围：[3,19]
  zoom: 10,
  resizeEnable: true,
});

/**  测距  **/
var ruler = new AMap.RangingTool(map);
function rangingToolSwitchChange() {
  if (document.getElementById('rangingToolSwitch').checked == true) {
    ruler.turnOn();
  } else {
    ruler.turnOff();
  }
}

/***************/
let STORES_ADDRESS, FILTER_STORE_NO_LIST, ABC, ABC_ARR, STORE_ABC_JSON;
async function drawStores(data) {
  STORES_ADDRESS = await GET_STORES_ADDRESS(data);

  FILTER_STORE_NO_LIST = STORES_ADDRESS.map(e => e.fohStoreNo);
  map.panTo(STORES_ADDRESS[0].lnglat);
  console.log(STORES_ADDRESS);

  ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  ABC_ARR = ABC.split('');
  STORE_ABC_JSON = {};
  FILTER_STORE_NO_LIST.forEach((no, i) => {
    let ii = i % 26;
    let iii = Math.floor(i / 26);
    temp = (iii || '') + ABC_ARR[ii];

    STORE_ABC_JSON[no] = temp;
  });

  $('#stores').html('');

  FILTER_STORE_NO_LIST.forEach(n => {
    $('#stores').append(
      `<div><input type="checkbox" id="store_${n}" /><label for="store_${n}">${STORE_ABC_JSON[n]}店铺编码：${n}</label></div>`,
    );

    $('#stores').on('change', '#store_' + n, function (e) {
      const id = $(this).attr('id');
      const storeNo = id.split('_')[1];
      const flag = $(this).prop('checked');
      console.log(storeNo, flag);

      removeStorePolygonAndPoint(storeNo);
      if (flag) {
        const FIND = STORES_ADDRESS.find(ee => ee.fohStoreNo == storeNo);

        if (FIND && FIND.normal_scopes && FIND.normal_scopes.length) {
          storePolygonJson[storeNo] = drawDBX(FIND.normal_scopes, 'blue');
        }

        let finder = MAP_SHOPS.filter(e=>e.fohStoreNo == storeNo);
        if(finder&&finder.length>0){
         finder[0].marker.show();
        }
      }

      if ($('#onlyShowRelatedOrder').prop('checked')) {
        showOrdersByStoreNo(storeNo, flag);
      }
    });
  });

  doRes({ data: STORES_ADDRESS });
}

var storePolygonJson = {};
const STORE_LABEL = {
  orderAll: false,
  orderOn: true,
  orderOff: false,
  goodsAll: false,
  goodsOn: false,
  goodsOff: false,
};
$(document).ready(function () {
  console.log('JQ Ready');
  $('#orderAll').change(function () {
    STORE_LABEL.orderAll = $(this).prop('checked');
  });
  $('#orderOn').change(function () {
    STORE_LABEL.orderOn = $(this).prop('checked');
  });
  $('#orderOff').change(function () {
    STORE_LABEL.orderOff = $(this).prop('checked');
  });
  $('#orderMod').change(function () {
    STORE_LABEL.orderMod = $(this).prop('checked');
  });
  $('#goodsAll').change(function () {
    STORE_LABEL.goodsAll = $(this).prop('checked');
  });
  $('#goodsOn').change(function () {
    STORE_LABEL.goodsOn = $(this).prop('checked');
  });
  $('#goodsOff').change(function () {
    STORE_LABEL.goodsOff = $(this).prop('checked');
  });
  $('#goodsMod').change(function () {
    STORE_LABEL.goodsMod = $(this).prop('checked');
  });

  //   drawStores();

  const JQ_OTS = $('#orderTypeSpan');

  const BUSINESS_CHANNEL_IDS = BUSINESS_CHANNEL.map(e => e.replaceAll(' ', ''));
  BUSINESS_CHANNEL.forEach((channel, i) => {
    let _id = BUSINESS_CHANNEL_IDS[i];
    let _html = `<input type="checkbox" id="${_id}" checked /><label for="${_id}" >${channel}</label>`;
    JQ_OTS.append(_html);

    JQ_OTS.on('change', '#' + _id, function (e) {
      BUSINESS_CHANNEL_CHECKED = [];
      BUSINESS_CHANNEL_IDS.forEach((id, i) => {
        let flag = $('#' + id).prop('checked');
        if (flag) {
          BUSINESS_CHANNEL_CHECKED.push(BUSINESS_CHANNEL[i]);
        }
      });
    });
  });
});
function removeStorePolygonAndPoint(no) {

 let finder = MAP_SHOPS.filter(e=>e.fohStoreNo == no);
 if(finder&&finder.length>0){
  finder[0].marker.hide();
 }


  if (storePolygonJson[no]) {
    map.remove(storePolygonJson[no]);
  }
}

// setTimeout(() => {
//   submitLocal();
// }, 100);

map.on('click', function (e) {
  lngLatEleSet(e);

  if (onePolygon.isDraw) {
    // 左键 加点
    const marker = new AMap.Marker({
      icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
      position: [e.lnglat.getLng(), e.lnglat.getLat()],
    });
    marker.on('click', markerClickCallback);
    onePolygon.nowMaker.push(marker);
    map.add(marker);
    // 加折线
    if (onePolygon.nowMaker.length >= 2) {
      var path = [
        [
          onePolygon.nowMaker[onePolygon.nowMaker.length - 2].w.position.lng,
          onePolygon.nowMaker[onePolygon.nowMaker.length - 2].w.position.lat,
        ],
        [e.lnglat.getLng(), e.lnglat.getLat()],
      ];
      var polyline = new AMap.Polyline({
        path: path,
        borderWeight: 2, // 线条宽度，默认为 1
        strokeColor: 'red', // 线条颜色
      });
      onePolygon.polyLines.push(polyline);
      MAP_OVER_LINES.push(polyline);
      map.add(polyline);
    }
  }
});

/** ****  右键删除 点和折线  *******      */
map.on('rightclick', function (e) {
  if (onePolygon.nowMaker.length > 0) {
    var marker = onePolygon.nowMaker[onePolygon.nowMaker.length - 1];
    map.remove(marker);
    onePolygon.nowMaker.splice(onePolygon.nowMaker.length - 1, 1);
  }

  if (onePolygon.polyLines.length > 0) {
    var polyline = onePolygon.polyLines[onePolygon.polyLines.length - 1];
    map.remove(polyline);
    onePolygon.polyLines.splice(onePolygon.polyLines.length - 1, 1);
  }
});

// 普通订单 Icon
const ORDER_NORMAL_ICON = new AMap.Icon({
  size: new AMap.Size(25, 35),
  image: 'https://z3.ax1x.com/2021/11/27/om43SH.png', // "order.png",
  imageSize: new AMap.Size(25, 35),
});
// 变更订单 Icon
const ORDER_CHANGE_ICON = new AMap.Icon({
  size: new AMap.Size(25, 35),
  image: 'order-change.png',
  imageSize: new AMap.Size(25, 35),
});
// MOD订单 Icon
const ORDER_MOD_ICON = new AMap.Icon({
  size: new AMap.Size(25, 35),
  image: 'https://z3.ax1x.com/2021/11/28/omx9JA.png',
  imageSize: new AMap.Size(25, 35),
});

function orderShowHide() {
  if (document.getElementById('orderShowHide').innerText == '隐藏所有订单') {
    document.getElementById('orderShowHide').innerText = '显示所有订单';
    MAP_ORDERS.forEach(m => {
      m.marker.hide();
    });
  } else {
    document.getElementById('orderShowHide').innerText = '隐藏所有订单';
    MAP_ORDERS.forEach(m => {
      if (AddOrders.includes(m.orderId) || showAllOrderPosition()) {
        m.marker.show();
      } else {
        map.add(m.marker);
        AddOrders.push(m.orderId);
      }
    });
  }
}
function shopShowHide() {
  if (document.getElementById('shopShowHide').innerText == '隐藏所有店铺') {
    document.getElementById('shopShowHide').innerText = '显示所有店铺';
    MAP_OVER_MARKERS_SHOP.forEach(m => {
      m.hide();
    });
  } else {
    document.getElementById('shopShowHide').innerText = '隐藏所有店铺';
    MAP_OVER_MARKERS_SHOP.forEach(m => {
      m.show();
    });
  }
}
// 清空地图
function clearMap() {
  map.clearMap();
  MAP_ORDERS = [];
  MAP_SHOPS = [];
}

//关键字 搜索，当选中某条记录时，地图中心会变更
var auto = new AMap.Autocomplete({
  input: 'tipinput',
});
AMap.event.addListener(auto, 'select', select); //注册监听，当选中某条记录时会触发
function select(e) {
  if (e.poi && e.poi.location) {
    map.setZoom(15);
    map.setCenter(e.poi.location);
  }
}

/**
 * 手绘多边形：开关
 */
var onePolygon = initOnePolygon();
function initOnePolygon() {
  console.log(document.getElementById('switch'));
  document.getElementById('switch').checked = false;
  return {
    isDraw: false,
    nowMaker: [],
    polyLines: [],
  };
}
function switchChange() {
  onePolygon.isDraw = document.getElementById('switch').checked;
}

/**
 * 鼠标点击创建的marker，尝试为封闭多边形（需要开启生效）
 */
function markerClickCallback(e) {
  // 尝试封闭多边形
  const FIRST_MARKER = onePolygon.nowMaker[0];
  const LENGTH_MARKER = onePolygon.nowMaker.length;
  if (FIRST_MARKER._amap_id === e.target._amap_id && LENGTH_MARKER > 2 && onePolygon.isDraw) {
    const LAST_MARKER = onePolygon.nowMaker[LENGTH_MARKER - 1];
    const path = [
      [LAST_MARKER.w.position.lng, LAST_MARKER.w.position.lat],
      [FIRST_MARKER.w.position.lng, FIRST_MARKER.w.position.lat],
    ];
    // 创建折线实例
    const polyline = new AMap.Polyline({
      path: path,
      borderWeight: 2, // 线条宽度，默认为 1
      strokeColor: 'red', // 线条颜色
    });
    MAP_OVER_LINES.push(polyline);
    map.add(polyline);
    // 封闭成功，初始化
    const TEMP = onePolygon.nowMaker.map(e => {
      return {
        x: e.w.position.lng,
        y: e.w.position.lat,
      };
    });
    POLYGONS.push(TEMP);
    polygonEleSet(TEMP);
    map.remove(onePolygon.nowMaker);
    onePolygon = initOnePolygon();
  }
}

/**
 * 提交事件1
 */
function submitLocal() {
  let tianjin_area = `[{"x":117.670703,"y":38.60348},{"x":117.354846,"y":38.547652},{"x":117.22301,"y":38.629232},{"x":117.074695,"y":38.59704},{"x":117.033496,"y":38.715006},{"x":116.887927,"y":38.682853},{"x":116.830249,"y":38.738576},{"x":116.720386,"y":38.890521},{"x":116.772571,"y":39.061339},{"x":116.91814,"y":39.10611},{"x":116.838489,"y":39.35503},{"x":116.81377,"y":39.584018},{"x":116.956592,"y":39.685548},{"x":117.132373,"y":39.630571},{"x":117.217517,"y":39.829127},{"x":117.157092,"y":39.940827},{"x":117.277942,"y":40.115387},{"x":117.420764,"y":40.22662},{"x":117.670703,"y":40.111186},{"x":117.775073,"y":40.064958},{"x":117.687183,"y":39.982931},{"x":117.533374,"y":39.976617},{"x":117.536121,"y":39.835455},{"x":117.645984,"y":39.700342},{"x":117.629504,"y":39.603066},{"x":117.728381,"y":39.535315},{"x":117.821765,"y":39.586134},{"x":117.937122,"y":39.560729},{"x":117.854724,"y":39.397492},{"x":117.895923,"y":39.318917},{"x":118.074451,"y":39.238126},{"x":118.046985,"y":39.221106},{"x":117.970081,"y":39.082662},{"x":117.961841,"y":38.954626}]`;

  polygonEleSet(tianjin_area);
  drawPolygon();

  DEFAULT_API_DATA().then(res => {
    console.log(res);
    doRes(res);
  });

  // showJson("天津完整返回 copy");
}
function submit() {
  // let tianjin_area = `[{"x":117.670703,"y":38.60348},{"x":117.354846,"y":38.547652},{"x":117.22301,"y":38.629232},{"x":117.074695,"y":38.59704},{"x":117.033496,"y":38.715006},{"x":116.887927,"y":38.682853},{"x":116.830249,"y":38.738576},{"x":116.720386,"y":38.890521},{"x":116.772571,"y":39.061339},{"x":116.91814,"y":39.10611},{"x":116.838489,"y":39.35503},{"x":116.81377,"y":39.584018},{"x":116.956592,"y":39.685548},{"x":117.132373,"y":39.630571},{"x":117.217517,"y":39.829127},{"x":117.157092,"y":39.940827},{"x":117.277942,"y":40.115387},{"x":117.420764,"y":40.22662},{"x":117.670703,"y":40.111186},{"x":117.775073,"y":40.064958},{"x":117.687183,"y":39.982931},{"x":117.533374,"y":39.976617},{"x":117.536121,"y":39.835455},{"x":117.645984,"y":39.700342},{"x":117.629504,"y":39.603066},{"x":117.728381,"y":39.535315},{"x":117.821765,"y":39.586134},{"x":117.937122,"y":39.560729},{"x":117.854724,"y":39.397492},{"x":117.895923,"y":39.318917},{"x":118.074451,"y":39.238126},{"x":118.046985,"y":39.221106},{"x":117.970081,"y":39.082662},{"x":117.961841,"y":38.954626}]`;

  // polygonEleSet(tianjin_area);
  // polygonEleSet(
  //   `[{"x":117.199742,"y":39.115371},{"x":117.219483,"y":39.101785},{"x":117.234589,"y":39.114705},{"x":117.213475,"y":39.126891}]`
  // );

  if (document.getElementById('submit').innerText == '加载中') {
    alert('已经在加载中');
    return;
  }
  document.getElementById('submit').innerText = '加载中';
  getApi(POST_DATA());
}

/**
 * API
 */
function getApi(data) {
  const submit = 'submit';
  let url = getHost() + '/online-process/order-distribution';

  if (!data.fohStoreNoList || data.fohStoreNoList.length == 0) {
    document.getElementById(submit).innerText = '查询API';
    alert('请在右侧勾选店铺');
    return;
  }

  fetch(url, {
    method: 'POST', // or 'PUT'
    body: JSON.stringify(data), // data can be `string` or {object}!
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  })
    .then(res => res.json())
    .catch(error => {
      console.error('Error:', error);
      document.getElementById(submit).innerText = '查询API';
    })
    .then(response => {
      console.log('Success:', response);

      document.getElementById(submit).innerText = '查询API';

      if (response.code === 200 && Array.isArray(response.data) && response.data.length) {
        afterFetch();

        // if (api === 'simulation-distribute') {
        console.log('add RES_STORE.first', RES_STORE.first);
        RES_STORE.first = response;
        // } else {
        //   RES_STORE.last = response;
        // }
        doRes(response);
      } else {
        alert('请检查返回值：' + JSON.stringify(response));
      }
    });
}
/**
 * 处理数据之前
 */
function afterFetch() {
  map.remove(MAP_OVER_MARKERS_SHOP);
  MAP_OVER_MARKERS_SHOP = [];
  map.remove(MAP_OVER_MARKERS_ORDER);
  MAP_OVER_MARKERS_ORDER = [];
  MAP_ORDERS = [];
  MAP_SHOPS = [];
}
/**
 * 过滤结果
 * */
function filterRes(key) {
  if (!RES_STORE[key]) {
    alert('请先提交，获取数据' + key);
    console.log(RES_STORE[key]);
    return;
  }
  afterFetch();
  doRes(hideOffline(RES_STORE[key]));
}
/**
 * 复原结果
 * */
function reSetRes(key) {
  if (!RES_STORE[key]) {
    alert('请先提交，获取数据' + key);
    console.log(RES_STORE[key]);
    return;
  }
  afterFetch();
  doRes(RES_STORE[key]);
}
/**
 * 处理数据：循环店铺
 */
function doRes(response) {
  const LIST = response.data;
  // map.panTo([LIST[0].longitude, LIST[0].latitude]);

  /***  计算平均差 START    */
  let businessChannel_list = [];
  let orderType_list = [];
  LIST.forEach(shop => {
    (shop.orderDistributionDetailsVOS || []).forEach(order => {
      if (order.businessChannel && !businessChannel_list.includes(order.businessChannel)) {
        businessChannel_list.push(order.businessChannel);
      }
      if (order.orderType && !orderType_list.includes(order.orderType)) {
        orderType_list.push(order.orderType);
      }
    });
  });

  const TEMP = LIST.map(shop => {
    let o = {};
    (shop.orderDistributionDetailsVOS || []).forEach(order => {
      if (o[order.businessChannel]) {
        o[order.businessChannel] += 1;
      } else {
        o[order.businessChannel] = 1;
      }
      if (o[order.orderType]) {
        o[order.orderType] += 1;
      } else {
        o[order.orderType] = 1;
      }
    });
    return o;
  });

  var logStr = `店铺的各类订单的订单数量的平均差：\n`;
  let modCountList = LIST.map(e => e.orderCount || 0);
  logStr += `所有订单的平均差： ${meanDeviation(modCountList)}；\n`;
  modCountList = LIST.map(e => e.modOrderCount || 0);
  logStr += `MOD订单的平均差： ${meanDeviation(modCountList)}；\n `;
  businessChannel_list.forEach(t => {
    let modCountList = TEMP.map(e => e[t] || 0);
    logStr += `${t}订单的平均差： ${meanDeviation(modCountList)}；\n`;
  });
  orderType_list.forEach(t => {
    let modCountList = TEMP.map(e => e[t] || 0);
    logStr += `Type=${t}订单的平均差： ${meanDeviation(modCountList)}；\n`;
  });
  console.log('%c ' + logStr, 'color:red');
  /***  计算平均差 END    */

  LIST.forEach(TEMP_OBJ => {
    drawShopFn(TEMP_OBJ);
  });
}
// 平均差
function meanDeviation(arr) {
  let l = arr.length;
  let av =
    arr.reduce((t, n) => {
      return t + n;
    }) / l;
  return (
    Math.round(
      (arr.reduce((t, n) => {
        return t + Math.abs(n - av);
      }, 0) /
        l) *
        100,
    ) / 100
  );
}

/**
 * 处理数据：将 店铺 和 关联的订单 展示在地图上
 */
function drawShopFn(o) {
  //   if (!FILTER_STORE_NO_LIST.includes(Number(o.fohStoreNo))) {
  //     return;
  //   }
  const lnglat = [o.longitude, o.latitude];
  // if (Array.isArray(lnglat)) {
  //   lnglat = new AMap.LngLat(lnglat[0], lnglat[1]);
  // }

  const ORDERS = o.orderDistributionDetailsVOS;
  /************     订单 MARKERS   ****************/
  let __orderCount_on = 0;
  let __orderCount_off = 0;
  let __orderCount_mod = 0;
  let __goodsCount_on = 0;
  let __goodsCount_off = 0;
  let __goodsCount_mod = 0;
  if (ORDERS) {
    const ORDERS_LEN = ORDERS.length;
    for (let iii = 0; iii < ORDERS_LEN; iii++) {
      const order = ORDERS[iii];
      //   if (order.goodsCount == 0 || !order.goodsCount) {
      //     continue;
      //   }
      // 没有打勾的订单类型不展示
      if (!BUSINESS_CHANNEL_CHECKED.includes(order.businessChannel)) {
        if (order.onlineType == 1) {
          __orderCount_on++;
          __goodsCount_on += Number(order.goodsCount || 0);
          if (order.modOnlineType == 1) {
            __orderCount_mod++;
            __goodsCount_mod += Number(order.goodsCount || 0);
          }
        } else {
          __orderCount_off++;
          __goodsCount_off += Number(order.goodsCount || 0);
        }
        continue;
      }

      if (order.longitude && order.latitude && order.onlineType == 1) {
        // 是否为变更店铺
        const IS_CHANGE =
          order.finalFohStoreNo &&
          order.originFohStoreNo &&
          order.originFohStoreNo != order.finalFohStoreNo;
        const ORDER_ICON =
          order.modOnlineType == 1
            ? ORDER_MOD_ICON
            : IS_CHANGE
            ? ORDER_CHANGE_ICON
            : ORDER_NORMAL_ICON;

        const ORDER_TYPE =
          order.onlineType == 1 ? (order.modOnlineType == 1 ? '线上MOD' : '线上其它') : '线下';

        let title = '';
        if (IS_CHANGE) {
          title = `
订单编号：${order.orderId}
商品数量：${order.goodsCount}
原始店铺：${order.originFohStoreNo || ''}
分配店铺：${order.finalFohStoreNo || ''}`;
        } else {
          title = `
订单编号：${order.orderId}
订单类型：${ORDER_TYPE}
下单时间：${new Date(order.orderTime).format('yyyy-MM-dd hh:mm:ss')}
订单经度：${order.longitude}
订单纬度：${order.latitude}
商品数量：${order.goodsCount}
店铺编号：${o.fohStoreNo}`;
        }
        const ORDER_MARKER = new AMap.Marker({
          icon: ORDER_ICON,
          position: [order.longitude, order.latitude],
          title: title,
        });
        if (order.goodsCount) {
          const labelColor = order.modOnlineType == 1 ? 'blue' : 'green';
          ORDER_MARKER.setLabel({
            offset: new AMap.Pixel(3, 2),
            content: `<div class="shop-label ${labelColor}">${STORE_ABC_JSON[o.fohStoreNo]}${
              order.goodsCount
            }</div>`,
          });
        }

        ORDER_MARKER.on('click', orderMarkerClickCallback);
        if (IS_CHANGE || 1) {
          ORDER_MARKER.on('mouseover', changeOrderMouseoverCreateLineFn);
          ORDER_MARKER.on('mouseout', changeOrderMouseoverRemoveLineFn);
        }
        if (showAllOrderPosition()) {
          map.add(ORDER_MARKER);
        }

        MAP_OVER_MARKERS_ORDER.push(ORDER_MARKER); //收集覆盖物

        MAP_ORDERS.push({
          marker: ORDER_MARKER,
          _amap_id: ORDER_MARKER._amap_id,
          lnglat: [order.longitude, order.latitude],
          fohStoreNo: o.fohStoreNo,
          ...order,
        }); // 记录订单数据
      }
    }
  }

  setTimeout(() => {
    /************     店铺 MARKER   ****************/

    const STORE_COUNT = {};
    STORE_COUNT['orderAll'] = Number(o.orderCount || 0) - __orderCount_on - __orderCount_off;
    STORE_COUNT['orderOn'] = Number(o.onlineCount || 0) - __orderCount_on;
    STORE_COUNT['orderOff'] = Number(o.offlineCount || 0) - __orderCount_off;
    STORE_COUNT['orderMod'] = Number(o.modOrderCount || 0) - __orderCount_mod;
    STORE_COUNT['goodsAll'] = Number(o.goodsCount || 0) - __goodsCount_on - __goodsCount_off;
    STORE_COUNT['goodsOn'] = Number(o.onlineGoodsCount || 0) - __goodsCount_on;
    STORE_COUNT['goodsOff'] = STORE_COUNT['goodsAll'] - STORE_COUNT['goodsOn'] - __orderCount_off;
    STORE_COUNT['goodsMod'] = Number(o.modGoodsCount || 0) - __goodsCount_mod;

    const SHOP_MARKER = new AMap.Marker({
      position: lnglat,
      title: `
店铺名称：${o.storeName}
店铺编号：${o.fohStoreNo}
店铺经度：${o.longitude}
店铺纬度：${o.latitude}
商品数量：${STORE_COUNT.goodsAll}
MOD商品：${o.modGoodsCount}
线上商品：${STORE_COUNT.goodsOn}
线下商品：${STORE_COUNT.goodsOff}
订单数量：${STORE_COUNT.orderAll}
MOD订单：${o.modOrderCount}
线上订单：${STORE_COUNT.orderOn}
线下订单：${STORE_COUNT.orderOff}
                      `,
      icon: SHOP_ICON(STORE_COUNT.orderAll),
    });

    // if (!STORE_COUNT.orderAll) {
    //   return;
    // }
    let labels = [];
    for (let key in STORE_LABEL) {
      if (STORE_LABEL[key]) {
        labels.push(STORE_COUNT[key]);
      }
    }

    const contentHTML = `<div class="shop-label red">${STORE_ABC_JSON[o.fohStoreNo]} ${labels.join(
      ',',
    )}</div>`;

    SHOP_MARKER.setLabel({
      offset: new AMap.Pixel(-4, -14),
      content: contentHTML,
    });

    SHOP_MARKER.on('mouseover', shopMouseoverCreateLineFn);
    SHOP_MARKER.on('mouseout', shopMouseoverRemoveLineFn);
    MAP_OVER_MARKERS_SHOP.push(SHOP_MARKER); //收集覆盖物
    MAP_SHOPS.push({
      marker: SHOP_MARKER,
      _amap_id: SHOP_MARKER._amap_id,
      fohStoreNo: o.fohStoreNo,
      lnglat: lnglat,
      orders: ORDERS || [],
    }); // 记录店铺数据

    map.add(SHOP_MARKER);
  }, 100);
}

/**
 *
 * */
function showOrdersByStoreNo(storeNo, flag) {
  const SHOPE = MAP_SHOPS.find(ee => {
    return ee.fohStoreNo == storeNo;
  });
  if (SHOPE) {
    MAP_ORDERS.filter(O => SHOPE.orders.map(e => e.orderId).includes(O.orderId)).forEach(m => {
      if (flag) {
        if (AddOrders.includes(m.orderId) || showAllOrderPosition()) {
          m.marker.show();
        } else {
          map.add(m.marker);
          AddOrders.push(m.orderId);
        }
      } else {
        m.marker.hide();
      }
    });
  }
}
/**
 * 店铺：鼠标悬浮，连线到关联订单
 */
const SHOP_ORDER_LINE_LIST = [];
function shopMouseoverCreateLineFn(e) {
  // 隐藏其它店铺
  if (document.getElementById('hideForShop').checked) {
    MAP_OVER_MARKERS_SHOP.forEach(m => {
      m.hide();
    });
    const OVER_SHOPE = MAP_OVER_MARKERS_SHOP.find(ee => {
      return ee._amap_id === e.target._amap_id;
    });
    OVER_SHOPE.show();
  }
  //连线
  if (document.getElementById('showLineForShop').checked) {
    const SHOPE = MAP_SHOPS.find(ee => {
      return ee._amap_id === e.target._amap_id;
    });
    if (SHOPE) {
      const SHOP_LNG_LAT = SHOPE.lnglat;
      SHOPE.orders.forEach(order => {
        // 更改123
        if (order.longitude) {
          const ORDER_LNG_LAT = [order.longitude, order.latitude];
          const SHOP_ORDER_PATH = [SHOPE.lnglat, ORDER_LNG_LAT];
          // 创建折线实例
          const SHOP_ORDER_LINE = new AMap.Polyline({
            path: SHOP_ORDER_PATH,
            borderWeight: 2, // 线条宽度，默认为 1
            strokeColor: 'red', // 线条颜色
          });
          map.add(SHOP_ORDER_LINE);
          SHOP_ORDER_LINE_LIST.push(SHOP_ORDER_LINE);
        }
      });
    }
  }
}
function shopMouseoverRemoveLineFn(e) {
  MAP_OVER_MARKERS_SHOP.forEach(m => {
    m.show();
  });
  map.remove(SHOP_ORDER_LINE_LIST);
}
/**
 *订单：鼠标悬浮，连线到关联店铺 （仅：变更的订单）
 */
const CHANGE_LINE_LIST = [];
function changeOrderMouseoverCreateLineFn(e) {
  // 隐藏其它店铺
  if (document.getElementById('hideForOrder').checked) {
    MAP_OVER_MARKERS_ORDER.forEach(m => {
      m.hide();
    });
    const OVER_ORDER = MAP_OVER_MARKERS_ORDER.find(ee => {
      return ee._amap_id === e.target._amap_id;
    });
    OVER_ORDER.show();
  }
  // 连线
  const ORDER = MAP_ORDERS.find(ee => {
    return ee._amap_id === e.target._amap_id;
  });

  if (!ORDER) {
    return;
  }

  const ORDER_LNG_LAT = ORDER.lnglat;

  const FUNC = function (SHOPE, color) {
    if (SHOPE) {
      const SHOP_ORDER_PATH = [SHOPE.lnglat, ORDER_LNG_LAT];

      log(SHOPE.marker.w.title + ORDER.marker.w.title);

      // 创建折线实例
      const SHOP_ORDER_LINE = new AMap.Polyline({
        path: SHOP_ORDER_PATH,
        borderWeight: 2, // 线条宽度，默认为 1
        strokeColor: color, // 线条颜色
      });
      map.add(SHOP_ORDER_LINE);
      CHANGE_LINE_LIST.push(SHOP_ORDER_LINE);
    }
  };

  if (ORDER && ORDER.finalFohStoreNo && ORDER.originFohStoreNo) {
    const SHOPE_ORIGIN = MAP_SHOPS.find(ee => {
      return ee.fohStoreNo == ORDER.originFohStoreNo;
    });
    const SHOPE_FINAL = MAP_SHOPS.find(ee => {
      return ee.fohStoreNo == ORDER.finalFohStoreNo;
    });

    FUNC(SHOPE_FINAL, '#fd0015');
    FUNC(SHOPE_ORIGIN, '#fa9fa7');
  } else {
    const SHOPE_NORMAL = MAP_SHOPS.find(ee => {
      return ee.fohStoreNo == ORDER.fohStoreNo;
    });
    FUNC(SHOPE_NORMAL, '#2c8a45');
  }
}
function changeOrderMouseoverRemoveLineFn(e) {
  MAP_OVER_MARKERS_ORDER.forEach(m => {
    m.show();
  });
  map.remove(CHANGE_LINE_LIST);
}
/**
 *订单：点击事件，记录订单编号到参数中 （需要开启生效）
 */
function orderMarkerClickCallback(e) {
  const ORDER = MAP_ORDERS.find(ee => {
    return ee._amap_id === e.target._amap_id;
  });
  const ORDER_ID = ORDER.orderId;
  if (SELECT_ORDERS.canSelectOrder) {
    SELECT_ORDERS.ids.push(ORDER_ID);
  }
  document.getElementById('orderList').value = SELECT_ORDERS.ids.join(',');
}
/**
 * 根据订单数量 获取不同的ICON
 */
function SHOP_ICON(ORDER_COUNT = 1) {
  const n = getIconNum(ORDER_COUNT);

  let url = 'https://z3.ax1x.com/2021/11/27/om4I1J.png'; //
  if (n == 1) {
    url = 'https://z3.ax1x.com/2021/11/27/om4I1J.png';
  }
  if (n == 2) {
    url = 'https://z3.ax1x.com/2021/11/27/om5pjA.png';
  }
  if (n == 3) {
    url = 'https://z3.ax1x.com/2021/11/27/om5iHP.png';
  }
  if (n == 4) {
    url = 'https://z3.ax1x.com/2021/11/27/om5AN8.png';
  }
  if (n == 5) {
    url = 'https://z3.ax1x.com/2021/11/27/om51EV.png';
  }
  // 创建一个 Icon
  return new AMap.Icon({
    size: new AMap.Size(25, 35),
    image: url, //"shop" + n + ".png",

    imageSize: new AMap.Size(25, 35),
  });
}
function getIconNum(orderCount) {
  var a = document.getElementById('ia').value || 0,
    b = document.getElementById('ib').value || 0,
    c = document.getElementById('ic').value || 0,
    d = document.getElementById('id').value || 0;

  if (orderCount < a) {
    return 1;
  }
  if (orderCount < b) {
    return 2;
  }
  if (orderCount < c) {
    return 3;
  }
  if (orderCount < d) {
    return 4;
  }
  return 5;
}
/**
 * 请求参数获取
 * */
function POST_DATA() {
  let startTime = document.getElementById('startTime').value || '2021-11-26 00:00:00';
  let endTime = document.getElementById('endTime').value || '2021-11-26 23:59:59';
  //   let cityCode = document.getElementById('cityCode').value || '440100';

  storeIds = document.getElementById('storeIds').value || '';

  if (!storeIds) {
    storeIds = [];
    $('#stores input').each(function () {
      if ($(this).prop('checked')) {
        storeIds.push($(this).attr('id').replace('store_', ''));
      }
    });
  } else {
    storeIds = storeIds.replaceAll(' ', '').split(',');
  }

  return {
    // cityCode: cityCode || '440100',
    // scopes: polygonEleGet(),

    startTime: startTime || '2021-11-26 00:00:00',
    endTime: endTime || '2021-11-26 23:59:59',

    fohStoreNoList: storeIds,
  };
}
function lngLatBlur() {
  drawPointFn(lngLatEleGet());
}
function xyReset() {
  try {
    const RE = polygonEleGet().map(e => {
      return {
        x: e.y,
        y: e.x,
      };
    });
    polygonEleSet(RE);
  } catch (error) {
    console.error(error);
  }
}
function mapToDrawPolygon() {
  drawPolygon(true);
}
function drawPolygon(mapTo = false) {
  try {
    const data = polygonEleGet();
    if (mapTo) map.panTo([data[0].x, data[0].y]);
    drawDBX(data);
  } catch (error) {
    console.error(error);
  }
}
function drawDBX(data, color = 'red') {
  onePolygon = initOnePolygon();

  data.forEach(d => {
    if (Array.isArray(d)) {
      d = {
        x: d[0],
        y: d[1],
      };
    }
    // 左键 加点
    const marker = new AMap.Marker({
      icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
      position: [d.x, d.y],
    });
    marker.on('click', markerClickCallback);
    onePolygon.nowMaker.push(marker);
    map.add(marker);
    // 加折线
    if (onePolygon.nowMaker.length >= 2) {
      var path = [
        [
          onePolygon.nowMaker[onePolygon.nowMaker.length - 2].w.position.lng,
          onePolygon.nowMaker[onePolygon.nowMaker.length - 2].w.position.lat,
        ],
        [d.x, d.y],
      ];
      var polyline = new AMap.Polyline({
        path: path,
        borderWeight: 2, // 线条宽度，默认为 1
        strokeColor: color, // 线条颜色
      });
      onePolygon.polyLines.push(polyline);
      MAP_OVER_LINES.push(polyline);
      map.add(polyline);
    }
  });
  // 尝试封闭多边形
  const FIRST_MARKER = onePolygon.nowMaker[0];
  const LENGTH_MARKER = onePolygon.nowMaker.length;
  const LAST_MARKER = onePolygon.nowMaker[LENGTH_MARKER - 1];
  const path = [
    [LAST_MARKER.w.position.lng, LAST_MARKER.w.position.lat],
    [FIRST_MARKER.w.position.lng, FIRST_MARKER.w.position.lat],
  ];
  // 创建折线实例
  const polyline = new AMap.Polyline({
    path: path,
    borderWeight: 2, // 线条宽度，默认为 1
    strokeColor: 'red', // 线条颜色
  });
  onePolygon.polyLines.push(polyline);
  MAP_OVER_LINES.push(polyline);
  map.add(polyline);

  const TEMP_POLY_LINES = [...onePolygon.polyLines];
  // 封闭成功，初始化
  const TEMP = onePolygon.nowMaker.map(e => {
    return {
      x: e.w.position.lng,
      y: e.w.position.lat,
    };
  });
  POLYGONS.push(TEMP);
  polygonEleSet(TEMP);

  map.remove(onePolygon.nowMaker);
  onePolygon = initOnePolygon();
  return TEMP_POLY_LINES;
}

function checkInCircle() {
  try {
    // 点
    let point = lngLatEleGet();
    point = new AMap.LngLat(point[0], point[1]);
    // 圆
    let radius = document.getElementById('ban_jing').value;
    let lnglat = document.getElementById('yuan_xin').value.split(',');
    if (Array.isArray(lnglat)) {
      lnglat = new AMap.LngLat(lnglat[0], lnglat[1]);
    }
    let circle = new AMap.Circle({
      center: lnglat, // 圆心位置
      radius: radius, //半径
      strokeColor: '#F33', //线颜色
      strokeOpacity: 1, //线透明度
      strokeWeight: 3, //线粗细度
      fillColor: '#ee2200', //填充颜色
      fillOpacity: 0.1, //填充透明度
    });
    // 测
    const flag = circle.contains(point);
    // 果
    document.getElementById('inCircle').innerText = flag ? '内部' : '外部';
  } catch (error) {
    console.error(error);
  }
}
function checkInPolygon() {
  try {
    const PATH = polygonEleGet().map(e => [e.x, e.y]);
    const flag = isPointInRingFn(lngLatEleGet(), PATH);
    document.getElementById('inPolygon').innerText = flag ? '内部' : '外部';
  } catch (error) {
    console.error(error);
  }
}
function drawPointFn(lnglat, title = '') {
  if (Array.isArray(lnglat)) {
    lnglat = new AMap.LngLat(lnglat[0], lnglat[1]);
  }
  console.log('画一个点', lnglat);

  // 创建一个 Marker 实例：
  let marker = new AMap.Marker({
    position: lnglat, // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
    title: title,
  });
  marker.on('click', function (e) {
    lngLatEleSet(e);
  });

  // 将创建的点标记添加到已有的地图实例：
  map.add(marker);
  return marker;
  // map.panTo(lnglat);
}
function isPointInRingFn(point, path) {
  var isPointInRing = AMap.GeometryUtil.isPointInRing(point, path);
  console.log(isPointInRing ? '内部' : '外部');
  return isPointInRing;
}
function lngLatEleGet() {
  return (document.getElementById('lnglat').value || '0,0').split(',');
}
function lngLatEleSet(a, b) {
  if (Array.isArray(a)) {
    document.getElementById('lnglat').value = a.join(',');
  } else if (Number(a) == a) {
    document.getElementById('lnglat').value = a + ',' + b;
  } else if (typeof a == 'string') {
    document.getElementById('lnglat').value = a;
  } else if (typeof a == 'object' && a.lnglat) {
    document.getElementById('lnglat').value = a.lnglat.getLng() + ',' + a.lnglat.getLat();
  }
}
function polygonEleGet() {
  return JSON.parse(document.getElementById('onePolygonResult').value || '[]');
}
function polygonEleSet(ArrayString) {
  if (typeof ArrayString == 'object') {
    ArrayString = JSON.stringify(ArrayString);
  }
  document.getElementById('onePolygonResult').value = ArrayString;
}

function showJson(name = 'res', callback) {
  if (!location.host) {
    alert('Fetch API cannot load  "file:///"。请在服务器环境下使用');
    return;
  }
  fetch('./' + name + '.json')
    .then(function (response) {
      return response.json();
    })
    .then(data => {
      if (callback) {
        callback(data);
      } else {
        if (name == 'res') {
          RES_STORE.first = data;
        } else {
          RES_STORE.last = data;
        }

        doRes(data);
      }
    });
}
function downLoad(objStr, fileName) {
  if (typeof objStr == 'object') {
    objStr = JSON.stringify(objStr);
  }
  const a = document.createElement('a');
  const url = window.URL.createObjectURL(new Blob([objStr], { type: '' }));
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}
function hideOffline(data) {
  console.log('原始');
  console.log(data);
  let d = [];
  let old = null;
  if (Array.isArray(data)) {
    d = data;
  } else {
    d = data.data;
    old = data;
  }
  d = d.filter(e => e.offlineCount);

  d = d.map(shop => {
    let strNum = [];
    let strTime = [];
    let shops = (shop.orderDistributionDetailsVOS || []).filter(
      order => order.onlineType == 1 && order.longitude,
    );
    shops.forEach(order => {
      strNum.push(Number(order.goodsCount || 0));
      strTime.push(new Date(order.orderTime).format('yyyy-MM-dd hh:mm:ss'));
    });

    return {
      ...shop,
      str: strNum.join('+'),
      arr: strNum,
      timeArr: strTime,
      timeStr: strTime.join('+'),
      sumStr: eval(strNum.join('+')),
      orderDistributionDetailsVOS: shops,
    };
  });

  if (old) {
    old.data = d;

    console.log('过滤');
    console.log(old);
    return old;
  }
  console.log('过滤');
  console.log(d);
  return d;
}

Date.prototype.format = function (fmt) {
  var dayArr = ['日', '一', '二', '三', '四', '五', '六'];

  var date2 = new Date(this);
  date2.setMonth(0);
  date2.setDate(1);
  var yearWeek = Math.round((this.valueOf() - date2.valueOf()) / 86400000);
  yearWeek = Math.ceil((yearWeek + (date2.getDay() + 1 - 1)) / 7);
  yearWeek = date2.getDay() == 1 ? yearWeek : yearWeek - 1;

  var o = {
    'M+': this.getMonth() + 1, //月份
    'd+': this.getDate(), //日
    'h+': this.getHours(), //小时
    'm+': this.getMinutes(), //分
    's+': this.getSeconds(), //秒
    'q+': Math.floor((this.getMonth() + 3) / 3), //季度
    S: this.getMilliseconds(), //毫秒
    W: dayArr[this.getDay()], //周几 汉字
    'w+': yearWeek, //今年第几周 数字
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length),
      );
    }
  }
  return fmt;
};

function getHost() {
  return document.getElementById('url').value || 'http://s22rst.natappfree.cc';
}
function log(txt) {
  document.getElementById('result').innerText = txt;
}

async function GET_STORES_ADDRESS(data) {
  let d = data || (await getLocalJson('storeAddress'));

  if (d.RECORDS) {
    d = d.RECORDS;
  }

  return d.map(e => {
    if (typeof e.normal_scopes == 'string' || typeof e.normalScopes == 'string') {
      e['normal_scopes'] = JSON.parse(e.normal_scopes || e.normalScopes);
      console.log(e);
    }
    return {
      ...e,
      fohStoreNo: Number(e.foh_store_no || e.fohStoreNo),
      lnglat: [e.longitude, e.latitude],
      normal_scopes: (e.normal_scopes || []).map(o => [o.y, o.x]),
    };
  });
}

function DEFAULT_API_DATA() {
  return getLocalJson('rep');
}

// 获取多个围栏
function getLocalJson(fileName) {
  return new Promise((resolve, reject) => {
    fetch('./' + fileName + '.json')
      .then(function (response) {
        return response.json();
      })
      .then(res => {
        resolve(res);
      });
  });
}

$(document).ready(function () {
  $('.hover-box').mouseenter(function () {
    $(this).children('span.content').show(100);
  });
  $('.hover-box').mouseleave(function () {
    $(this).children('.content').hide(100);
  });

  $('.hover-box').each(function () {
    const i = $(this).index() - 1;
    $(this).css('top', i * 96 + 60);
  });

  $('#rightClose').click(function () {
    $('.right').animate({ right: '-200px' }, function () {
      $('#rightShow').show();
    });

    $('#result').hide();
  });
  $('#rightShow').mouseenter(function () {
    $('#rightShow').hide();
    $('.right').animate({ right: '0' });
    $('#result').show();
  });
  localStoreInputById(
    'startTime,endTime,storeIds,url,yuan_xin,ban_jing,onePolygonResult,orderAll,orderOn,orderOff,orderMod,goodsAll,goodsOn,goodsOff,goodsMod,ia,ib,ic,id,hideForOrder,hideForShop,showLineForShop,onlyShowRelatedOrder,APPMOD,APPMOP,Elema,Meituan,WechatWSG,WechatMOD,WechatMOP,KoubeiMOP,InstorePOS',
  );
});
function localStoreInputById(ids) {
  ids = ids.split(',');
  ids.forEach(id => {
    const jqEle = $('#' + id);
    const storeKey = 'MAP_CONFIG_INPUT_' + id;
    const oldStoreValue = localStorage.getItem(storeKey);
    if (oldStoreValue) {
      if (jqEle.attr('type') == 'checkbox') {
        jqEle.prop('checked', oldStoreValue === 'true');
      } else {
        jqEle.val(oldStoreValue);
      }
    }
    jqEle.bind('input propertychange', function (e) {
      let jqEleValue;
      if (jqEle.attr('type') == 'checkbox') {
        jqEleValue = $(this).prop('checked');
      } else {
        jqEleValue = $(this).val();
      }
      localStorage.setItem(storeKey, jqEleValue);
    });
  });
}
