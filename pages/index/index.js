const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../services/user.js');
const common = require('../../config/common.js');

//获取应用实例
const app = getApp()
Page({
  data: {
    newGoods: [],
    hotGoods: [],
    topics: [],
    brands: [],
    floorGoods: [],
    banner: [],
    channel: [],
    cartCount: 0,
    addAnimation: false
  },
  // 右上角转发菜单触发
  onShareAppMessage: function () {
    return {
      title: common.shareTitle_a,
      path: '/pages/index/index'
    }
  },

  getIndexData: function () {
    wx.showLoading({
      title: '加载中...',
    });
    let that = this;
    util.request(api.IndexUrl).then(function (res) {
      if (res.errno === 0) {
        that.setData({
          newGoods: res.data.newGoodsList,
          hotGoods: res.data.hotGoodsList,
          topics: res.data.topicList,
          brand: res.data.brand,
          banner: res.data.banner,
          channel: res.data.channel,
          cartCount: res.data.cartCount
        });

        app.setCartCount(res.data.cartCount)
      }
      wx.hideLoading();
      wx.stopPullDownRefresh()
    });
  },
  navigate: function(event) {
    const item = event.currentTarget.dataset.item
    // 1:tab;2:!tab
    if (item.type == 1) {
      // tab 跳转传参
      app.switchTab({
        url: item.url,
        params: item.param
      })
    } else {
      wx.navigateTo({
        url: item.url + "?" + item.param,
      })
    }
  },
  addToCar: function (event) {
    const goodId = event.currentTarget.dataset.goodid
    const skuId = event.currentTarget.dataset.skuid
    // 更新购物车
    app.addGoodsToCart(goodId, skuId, 1, () => {
      this.setData({
        cartCount: ++this.data.cartCount
      })
    })
  },
  onPullDownRefresh:function() {
    this.getIndexData();
  },
  onLoad: function (options) {
    this.getIndexData();
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    this.setData({
      cartCount: app.globalData.cartCount
    })
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
})
