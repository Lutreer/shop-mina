var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');

Page({
  data:{
    orderId: 0,
    orderInfo: {},
    orderGoods: [],
    handleOption: {},
    submitOrderTryTimes: 0
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      orderId: options.id
    });
    this.getOrderDetail();
  },
  getOrderDetail() {
    let that = this;
    util.request(api.OrderDetail, {
      orderId: that.data.orderId
    }).then(function (res) {

      if (res.errno === 0) {

        that.setData({
          orderInfo: res.data
        });
      }
    });
  },
  payTimer (){
    let that = this;
    let orderInfo = that.data.orderInfo;
    
    setInterval(() => {
      console.log(orderInfo);
      orderInfo.add_time -= 1;
      that.setData({
        orderInfo: orderInfo,
      });
    }, 1000);
  },
  payOrder() {

    wx.showLoading({
      title: '下单中',
      mask: true
    })

    util.request(api.Prepay, { orderId: this.data.orderInfo.id}, 'POST').then(res => {
      wx.hideLoading()
      if (res.errno === 0) {
        wx.requestPayment({
          'timeStamp': res.data.timeStamp,
          'nonceStr': res.data.nonceStr,
          'package': res.data.package,
          'signType': res.data.signType,
          'paySign': res.data.paySign,
          'success': function (wxPayRes) {
            // 支付成功，修改订单状态
            util.request(api.OrderPayClientSuccess, { id: res.data.orderId }, 'POST').then(successRes => {
              if (successRes.errno === 0) {
                wx.redirectTo({
                  url: '/pages/payResult/payResult?status=1', // 1:支付成功；2：支付失败
                })
              } else {
                wx.redirectTo({
                  url: '/pages/payResult/payResult?status=2&orderId=' + res.data.orderId
                })
              }
            })

          },
          'fail': function (successRes) {
            wx.redirectTo({
              url: '/pages/payResult/payResult?status=2&orderId=' + res.data.statusCode
            })
          },
          'complete': function (successRes) {

          }
        })
    
        wx.hideLoading()
      } else if (res.errno == 2008 || res.errno == 2009){
        // 失效
        wx.showModal({
          title: '提示',
          content: res.msg || '订单失效：付款超时',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              wx.setStorageSync('page_order_relunch_data', true)
              wx.navigateBack({
                delta: 1
              })
            }
          }
        })

      }else if(res.errno == 400) {
        util.showErrorToast(res.errmsg);
        setTimeout(function(){
          wx.navigateBack({
            delta: 1
          })
        },1500)
        
        wx.setStorageSync('page_order_relunch_data', true)
      }else {
        this.setData({
          submitOrderTryTimes: this.data.submitOrderTryTimes + 1
        })
        //  用户主动尝试 3 次，仍失败则返回上一页
        if (this.data.submitOrderTryTimes >= 3) {
          wx.setStorageSync('page_order_relunch_data', true)
          wx.navigateBack({
            delta: 1
          })
        }
        util.showErrorToast(res.errmsg);
      }

    });
  },
  goGoodDetail(e){
    let goodId = e.currentTarget.dataset.goodId
    let skuId = e.currentTarget.dataset.skuId

    if (!goodId || !skuId) return false
    wx.navigateTo({
      url: '/pages/goods/goods?id=' + goodId + '&skuId=' + skuId
    })
  },
  confirmOrder(){
    let that = this
    wx.showModal({
      title: '提示',
      content: '您确认收到该商品了吗？',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({
            mask: true
          })

          util.request(api.OrderConfirm, { orderId: that.data.orderInfo.id }, 'POST').then(res => {
            wx.hideLoading()
            if (res.errno === 0) {
              // TODO 这里其实是不能直接跳回去的
              wx.setStorageSync('page_order_relunch_data', true)
              wx.navigateBack({
                delta: 1
              })
            }else{
              util.showErrorToast(res.errmsg);
            }
          })
        }
      }
    })
    
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})