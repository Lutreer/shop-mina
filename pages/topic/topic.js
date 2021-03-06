var util = require('../../utils/util.js');
var api = require('../../config/api.js');
const common = require('../../config/common.js');

var app = getApp()
Page({
    data: {
        // text:"这是一个页面"
        topicList: [],
        page: 1,
        size: 5,
        totalPages: 0,
        scrollTop: 0
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        this.getTopic();

    },
    onReady: function () {
        // 页面渲染完成
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
    getTopic: function () {

      let that = this;
      that.setData({
        topicList: []
      });
      // 页面渲染完成
      wx.showToast({
        title: '加载中...',
        icon: 'loading'
      });

      util.request(api.TopicList, { page: that.data.page, size: that.data.size }).then(function (res) {
        if (res.errno === 0) {

          that.setData({
            topicList: res.data.data,
            page: res.data.currentPage,
            totalPages: res.data.totalPages
          });
        }
        wx.hideToast();
      })

    },
    nextPage: function (event) {
        var that = this;
        if (this.data.page >= that.data.totalPages) {
            return false;
        }

        
        that.setData({
            "page": parseInt(that.data.page) + 1
        });

        this.getTopic();
        
    },
    
    prevPage: function (event) {
        if (this.data.page <= 1) {
            return false;
        }

        var that = this;
        that.setData({
            "page": parseInt(that.data.page) - 1
        });
        this.getTopic();
    },
    // 右上角转发菜单触发
    onShareAppMessage: function () {
      return {
        title: common.shareTitle_b,
        path: '/pages/rankingGoods/rankingGoods'
      }
    }
})