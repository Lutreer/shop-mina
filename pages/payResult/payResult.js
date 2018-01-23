var app = getApp();
var util = require('../../utils/util.js');
var api = require('../../config/api.js');

Page({
  data:{
    status: 2,
    orderId:null,
    time:5
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      orderId: options.orderId,
      status: options.status // 1:支付成功；2：支付失败
    })
    if(this.data.status == 1){
      let temp = setInterval( () => {
        this.setData({
          time: this.data.time-1
        })
        if(this.data.time <= 0){
          clearInterval(temp)
          wx.switchTab({
            url: '/pages/index/index'
          })
        }
      }, 1000)
    }
  },
  onReady:function(){
    
  },
  onShow:function(){
    // 页面显示
    
  },
  onHide:function(){
    // 页面隐藏
    
  },
  onUnload:function(){
    // 页面关闭
    
  },
  payOrder: function(){
    let that = this
    wx.showLoading({
      title: '支付中',
    })
    util.request(api.Prepay, { orderId: this.data.orderId}, 'POST').then(res => {
      wx.hideLoading()
      if (res.errno === 0) {
        wx.requestPayment({
          'timeStamp': res.data.timeStamp,
          'nonceStr': res.data.nonceStr,
          'package': res.data.package,
          'signType': res.data.signType,
          'paySign': res.data.paySign,
          'success': function (wxPayRes) {
            wx.showLoading()
            // 支付成功，修改订单状态
            util.request(api.OrderPayClientSuccess, { id: res.data.orderId, sn: wxPayRes.data.orderSN, status: wxPayRes.data.orderId }, 'POST').then(successRes => {
              wx.hideLoading()
              if (successRes.errno === 0) {
                that.setData({
                  status: 1
                })
              } else {
                that.setData({
                  status: 2
                })
                wx.showModal({
                  title: '提示',
                  content: msg || '请求支付失败',
                  showCancel: false,
                  success: function (res) {
                    if (res.confirm) {
                      wx.redirectTo({
                        url: '/pages/ucenter/order/order',
                      })
                    }
                  }
                })

              }
            })

          },
          'fail': function (successRes) {
            that.setData({
              status: 2
            })
            wx.showModal({
              title: '提示',
              content: msg || '请求支付失败',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.redirectTo({
                    url: '/pages/ucenter/order/order',
                  })
                }
              }
            })
          },
          'complete': function (successRes) {

          }
        })
      }else{
        let msg = res.errmsg
        wx.showModal({
          title: '提示',
          content: msg || '请求支付失败',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
             wx.navigateTo({
               url: '/pages/ucenter/order/order',
             })
            }
          }
        })
      }
    })
  }
})