var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:-1,
    remark:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      id:options.id,
      remark:options.remark
    })
  
  },
  cancel: function() {
    wx.navigateBack({
      delta: 1
    })
  },
  save: function(e) {
    this.setData({
      remark: e.detail.value.remark
    })
    wx.showLoading({
      title: '保存中',
    });
    util.request(api.UpdateWerunInfo, { remark: this.data.remark, id: this.data.id }, 'POST').then(res => {
      
      if (res.errno === 0) {
        wx.navigateTo({
          url: '/pages/ucenter/werun/werun'
        })
      } else {
        util.showErrorToast('保存失败')
      }
      wx.hideLoading();
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})