var app = getApp();
var util = require('../../utils/util.js');
var api = require('../../config/api.js');

Page({
  data: {
    id:0,
    topic: {},
    goods:[]
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      id: options.id
    })

    util.request(api.TopicDetail, { id: this.data.id}).then(res => {
      
      res.data.desc_pic_url = res.data.desc_pic_url.split(",")
      if (res.errno === 0) {
        this.setData({
          topic: res.data,
        });

        // WxParse.wxParse('topicDetail', 'html', res.data.content, that);
      }
    });
  },
  getCommentList(){
    let that = this;
    util.request(api.CommentList, { valueId: that.data.id, typeId: 1, size: 5 }).then(function (res) {
      if (res.errno === 0) {

        that.setData({
          commentList: res.data.data,
          commentCount: res.data.count
        });
      }
    });
  },
  postComment (){
    wx.navigateTo({
      url: '/pages/commentPost/commentPost?valueId='+this.data.id + '&typeId=1',
    })
  },
  onReady: function () {

  },
  onShow: function () {
    // 页面显示
    this.getCommentList();
  },
  onHide: function () {
    // 页面隐藏

  },
  onUnload: function () {
    // 页面关闭

  }
})