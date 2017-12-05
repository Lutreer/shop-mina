var util = require('./utils/util.js');
var api = require('./config/api.js');
var user = require('./services/user.js');

App({
  onLaunch: function () {
    //获取用户的登录信息
    user.checkLogin().then(res => {
      this.globalData.userInfo = wx.getStorageSync('userInfo');
      this.globalData.token = wx.getStorageSync('token');
    }).catch((rs) => {
        // 用户授权登录
        user.loginByWeixin().then(res => {
            this.globalData.userInfo = wx.getStorageSync('userInfo');
            this.globalData.token = wx.getStorageSync('token');
        }).catch((rs) => {
        });
    });
  },
  
  globalData: {
    userInfo: {
      nickname: 'Hi,客官',
      username: '点击去登录',
      avatar: '../../../static/images/no_login.png'
    },
    token: '',
    cartCount: 0, // 购物车商品数量
    tabParam: {}, // 非footer切换Tab时的参数
    cartChanged:false //是否有新商品加入购物车，避免购物车重复请求数据
  },
  addGoodsToCart: function(goodId, skuId,count, cb) {
    //添加到购物车
    util.request(api.CartAdd, { goodsId: goodId, skuId: skuId, goodsNum: count }, "POST")
      .then(res => {
        if (res.errno == 0) {
          this.globalData.cartCount += count
          this.globalData.cartChanged = true
          wx.showToast({
            title: '添加成功'
          });
          cb && cb()
        } else {
          util.showErrorToast('添加购物车失败');
        }

      });
  },
  setCartCount: function (count) {
    //添加到购物车
    this.globalData.cartCount += count
  },
  // 非footer切换Tab
  switchTab: function(option) {
    if(option.params && option.params.length > 3){
      option.params.split('&').forEach(item => {
        const param = item.split('=')
        this.globalData.tabParam[param[0]] = param[1]
      })
    }
    wx.switchTab({
      url: option.url,
      success: option.success || null,
      fail: option.error || null,
      complete: option.complete || null,
    })
  }
})
      // {
      //   "pagePath": "pages/topic/topic",
      //   "iconPath": "static/images/ic_menu_topic_nor.png",
      //   "selectedIconPath": "static/images/ic_menu_topic_pressed.png",
      //   "text": "专题"
      // },