var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var app = getApp();
const common = require('../../config/common.js');

Page({
  data: {
    cartCount: 0,

    id: 0,
    brand: {},
    page: 1,
    size: 1000
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    that.setData({
      id: parseInt(options.id)
    });
    this.getBrand();
  },
  getBrand: function () {
    wx.showLoading({
      title: '加载中...',
    });
    let that = this;
    util.request(api.BrandDetail, { id: that.data.id }).then(function (res) {
      if (res.errno === 0) {
        that.setData({
          brand: res.data.brand
        });
      }
      wx.hideLoading();
    });
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
  // 右上角转发菜单触发
  onShareAppMessage: function () {
    return {
      title: common.shareTitle_b,
      path: '/pages/brandDetail/brandDetail?id=' + this.data.id
    }
  }
})