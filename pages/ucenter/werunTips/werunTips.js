//index.js
//获取应用实例
var app = getApp()
var pxVsrpx = app.globalData.deviceInfo.screenWidth / 750
Page({
  data: {
    dataList: [],
    height: 0,
    scrollY: true
  },
  swipeCheckX: 100 * pxVsrpx, //激活检测滑动的阈值
  swipeCheckState: 0, //0未激活 1激活
  maxMoveLeft: 380 * pxVsrpx, //消息列表项最大左滑距离
  correctMoveLeft: 350 * pxVsrpx, //显示菜单时的左滑距离
  thresholdMoveLeft: 120 * pxVsrpx,//左滑阈值，超过则显示菜单

  lastShowId: '', //记录上次显示菜单的消息id
  moveX: 0,  //记录平移距离
  showState: 0, //0 未显示菜单 1显示菜单
  touchStartState: 0, // 开始触摸时的状态 0 未显示菜单 1 显示菜单
  swipeDirection: 0, //是否触发水平滑动 0:未触发 1:触发水平滑动 2:触发垂直滑动
  onLoad: function () {
    this.pixelRatio = app.globalData.deviceInfo.pixelRatio;
    var windowHeight = app.globalData.deviceInfo.windowHeight;
    var height = windowHeight;
    for (var i = 0; i < 30; i++) {
      var msg = {};
      msg.userName = '' + '用户' + i + 1;
      msg.msgText = '您有新的消息'
      msg.id = 'id-' + i + 1;
      msg.headerImg = '../../res/img/head.png';
      this.data.dataList.push(msg);
    }
    this.setData({ dataList: this.data.dataList, height: height });
  },

  ontouchstart: function (e) {
    if (this.showState === 1) {
      this.touchStartState = 1;
      this.showState = 0;
      this.moveX = 0;
      this.translateXItem(this.lastShowId, 0, 300);
      this.lastShowId = "";
      return;
    }

    this.firstTouchX = e.touches[0].clientX;
    this.firstTouchY = e.touches[0].clientY;
    if (this.firstTouchX > this.swipeCheckX) {
      this.swipeCheckState = 1;
    }
    this.lastMoveTime = e.timeStamp;
  },

  ontouchmove: function (e) {
    if (this.swipeCheckState === 0) {
      return;
    }
    //当开始触摸时有菜单显示时，不处理滑动操作
    if (this.touchStartState === 1) {
      return;
    }
    var moveX = e.touches[0].clientX - this.firstTouchX;
    var moveY = e.touches[0].clientY - this.firstTouchY;
    //已触发垂直滑动，由scroll-view处理滑动操作
    if (this.swipeDirection === 2) {
      return;
    }
    //未触发滑动方向
    if (this.swipeDirection === 0) {

      //触发垂直操作
      if (Math.abs(moveY) > 4) {
        this.swipeDirection = 2;

        return;
      }
      //触发水平操作
      if (Math.abs(moveX) > 4) {
        this.swipeDirection = 1;
        this.setData({ scrollY: false });
      }
      else {
        return;
      }

    }
    //禁用垂直滚动
    // if (this.data.scrollY) {
    //   this.setData({scrollY:false});
    // }

    this.lastMoveTime = e.timeStamp;
    //处理边界情况
    if (moveX > 0) {
      moveX = 0;
    }
    //检测最大左滑距离
    if (moveX < -this.maxMoveLeft) {
      moveX = -this.maxMoveLeft;
    }
    this.moveX = moveX;
    this.translateXItem(e.currentTarget.id, moveX, 0);
  },
  ontouchend: function (e) {
    this.swipeCheckState = 0;
    var swipeDirection = this.swipeDirection;
    this.swipeDirection = 0;
    if (this.touchStartState === 1) {
      this.touchStartState = 0;
      this.setData({ scrollY: true });
      return;
    }
    //垂直滚动，忽略
    if (swipeDirection !== 1) {
      return;
    }
    if (this.moveX === 0) {
      this.showState = 0;
      //不显示菜单状态下,激活垂直滚动
      this.setData({ scrollY: true });
      return;
    }
    if (this.moveX === this.correctMoveLeft) {
      this.showState = 1;
      this.lastShowId = e.currentTarget.id;
      return;
    }
    if (this.moveX < -this.thresholdMoveLeft) {
      this.moveX = -this.correctMoveLeft;
      this.showState = 1;
      this.lastShowId = e.currentTarget.id;
    }
    else {
      this.moveX = 0;
      this.showState = 0;
      //不显示菜单,激活垂直滚动
      this.setData({ scrollY: true });
    }
    this.translateXItem(e.currentTarget.id, this.moveX, 500);
    //this.translateXItem(e.currentTarget.id, 0, 0);
  },
  onDeleteTap: function (e) {
    this.deleteItem(e);
  },
  onDeleteLongtap: function (e) {
    console.log(e);
  },
  onMarkTap: function (e) {
    console.log(e);
  },
  onMarkLongtap: function (e) {
    console.log(e);
  },
  getItemIndex: function (id) {
    var dataList = this.data.dataList;
    for (var i = 0; i < dataList.length; i++) {
      if (dataList[i].id === id) {
        return i;
      }
    }
    return -1;
  },
  deleteItem: function (e) {
    var animation = wx.createAnimation({ duration: 200 });
    animation.height(0).opacity(0).step();
    this.animationWrapItem(e.currentTarget.id, animation);
    var s = this;
    setTimeout(function () {
      var index = s.getItemIndex(e.currentTarget.id);
      s.data.dataList.splice(index, 1);
      s.setData({ dataList: s.data.dataList });
    }, 200);
    this.showState = 0;
    this.setData({ scrollY: true });
  },
  translateXItem: function (id, x, duration) {
    var animation = wx.createAnimation({ duration: duration });
    animation.translateX(x).step();
    this.animationItem(id, animation);
  },
  animationItem: function (id, animation) {
    var index = this.getItemIndex(id);
    var param = {};
    var indexString = 'dataList[' + index + '].animation';
    param[indexString] = animation.export();
    this.setData(param);
  },
  animationWrapItem: function (id, animation) {
    var index = this.getItemIndex(id);
    var param = {};
    var indexString = 'dataList[' + index + '].wrapAnimation';
    param[indexString] = animation.export();
    this.setData(param);
  }
})
