var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var app = getApp();
Page({
  data: {
    brandList: [],
    page: 0,
    size: 6,
    totalPages: 0
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.getBrandList();
  },
  getBrandList: function () {
    wx.showLoading({
      title: '加载中',
    });
    let that = this;
    util.request(api.BrandList, { page: that.data.page, size: that.data.size }).then(function (res) {
      if (res.errno === 0) {
        that.setData({
          brandList: that.data.page > 0 ? that.data.brandList.concat(res.data.data) : res.data.data,
          totalPages: res.data.totalPages,
          page: that.data.page + 1
        });
      }
      wx.stopPullDownRefresh()
      wx.hideLoading();
    });
  },
  onPullDownRefresh: function () {
    this.setData({
      page: 0,
      size: 6,
      totalPages: 0
    })
    this.getBrandList();
  },
  onReachBottom (){
    if (this.data.totalPages > this.data.page) {
      this.getBrandList(); 
    } else {
      return false;
    }
  },
  onReady: function () {

  },
  onShow: function () {
    // 页面显示

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
      path: '/pages/brand/brand'
    }
  }
})