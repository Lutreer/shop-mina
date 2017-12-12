var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var user = require('../../../services/user.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    myWerun:{},
    werunList:[],
    page: 0,
    size: 100,
    totalPages: 0
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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
    
    this.pushWerun()
  
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
  
  },
  pushWerun: function () {
    wx.showLoading({
      title: '更新步数',
    });
    let that = this
    // 获取用户步数并上传，然后获取排行
    wx.getWeRunData({
      success(res) {
        util.request(api.PushWerun, { encryptedData:  res}, 'POST').then(res => {
          wx.hideLoading();
          if (res.errno === 0) {
            // 上传自己的步数后获取步数排行
            that.getWerunList()
          }else{
            util.showErrorToast('上传步数失败')
            setTimeout(function(){
              wx.navigateBack({
                delta: -1
              })
            }, 1500)
          }
        })
      },
      fail(e) {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: '该页面需要获取您的“微信步数”，请点击确定去设置。',
          success: function (res) {
            wx.openSetting({
              success(res) {
                if (res.authSetting['scope.werun']) {
                  getWeRun()
                } else {
                  wx.navigateBack({
                    delta: -1
                  })
                }
              }
            })
          },
          fail: function() {
            wx.navigateBack({
              delta: -1
            })
          }
        })
      }
    })
  },
  getWerunList: function() {
    wx.showLoading({
      title: '加载排行',
    });
    util.request(api.GetWerunList, { page: this.data.page, size: this.data.size }).then(res => {
      if (res.errno === 0) {
        this.setData({
          myWerun: res.data.myRun,
          werunList: res.data.werunList.data,
          totalPages: res.data.werunList.totalPages,
          page: this.data.page + 1
        });
      } else {
        util.showErrorToast('获取排行失败')
        setTimeout(function () {
          wx.navigateBack({
            delta: -1
          })
        }, 1500)
      }
      wx.hideLoading();
    })
  },
  onPullDownRefresh: function () {
    this.setData({
      page: 0,
      size: 100,
      totalPages: 0
    })
    this.pushWerun();
  },
  onReachBottom() {
    // if (this.data.totalPages > this.data.page) {
    //   this.getWerunList();
    // } else {
    //   return false;
    // }
  },
})