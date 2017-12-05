var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var comConst = require('../../config/common.js');
var goodsService = require('../../services/goods.js')
var app = getApp();

Page({
  data: {
    cartCount:0,
    type: 0, // 1:新品；2：人气
    goodsList: [],
    page: 0,
    size: 8,
    totalPages: 0,
    bannerInfo: {},
    categoryFilter: false,
    filterCategory: [],
    categoryId: 0,
    currentSortType: 'default',
    currentSortOrder: 'desc'
  },
  getInitData: function (type) {
    wx.showLoading({
      title: '加载中...',
    });
    let bannerPromise = goodsService.getRankingBanner(type)
    let goodsPromise = goodsService.getRankingGoods(type, this.data.page+1, this.data.size)
    Promise.all([bannerPromise, goodsPromise]).then(values => {
      this.setData({
        bannerInfo: values[0],
        goodsList: values[1].data,
        totalPages: values[1].totalPages,
        page: values[1].currentPage
      })
      wx.hideLoading();
    }).catch(value => {
      wx.hideLoading();
      util.showErrorToast('请求失败');
    })

  },
  getGoodsList (){
    wx.showLoading({
      title: '加载中...',
    });
    goodsService.getRankingGoods(this.data.type, this.data.page+1, this.data.size).then(values => {
      this.setData({
        goodsList: this.data.goodsList.concat(values.data),
        totalPages: values.totalPages,
        page: values.currentPage
      })
      wx.hideLoading();
    }).catch(value => {
      wx.hideLoading();
      util.showErrorToast('请求失败----');
    })
  },
  onReachBottom() {
    if (this.data.totalPages > this.data.page) {
      this.getGoodsList();
    } else {
      return false;
    }
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      type: options.type || comConst.rankingType.hotGoods
    })
    
    this.getInitData(this.data.type);
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
  addToCar: function (event) {
    const goodId = event.currentTarget.dataset.goodid
    const skuId = event.currentTarget.dataset.skuid
    // 更新购物车
    app.addGoodsToCart(goodId, skuId, 1, () => {
      this.setData({
        cartCount: ++this.data.cartCount
      })
    })
  }
})