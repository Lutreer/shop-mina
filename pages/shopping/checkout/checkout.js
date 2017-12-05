var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var comConst = require('../../../config/common.js');

var app = getApp();

Page({
  data:{
    checkedAddress: {},
    freightPrice:0,
    freightLimit: 0,
    addressId: 0,
    couponId: 0
  },
  onLoad:function(options){
    // 获取默认收货地址
    // util.request(api.AddressDefault, 'GET').then(res => {
    //   if (res.errno === 0) {
    //    this.setData({
    //      checkedAddress: res.data,
    //      addressId: res.data.id || 0
    //    })
    //   } else {
    //     util.showErrorToast(res.data.errmsg);
    //   }
    // })
   

    
  },
  getToBuyGoods: function () {
    
  },
  getCheckedGoods: function () {
    let that = this
    wx.getStorage({
      key: comConst.checkoutGoods.storageName,
      success: function (res) {
        // 再次校验是否有商品
        if (res.data.goods.length <= 0){
          util.showErrorToast('请先选择商品')
          wx.navigateBack({
            delta: 1
          })
        }else{
          if (res.data.source == comConst.checkoutGoods.source.cart && res.data.isFilter){
            util.showInfoToast("已忽略下架商品")

            // 避免修改地址等返回再次提示“已忽略下架商品”
            res.data.isFilter = false
            wx.setStorage({
              key: comConst.checkoutGoods.storageName,
              data: res.data
            })

          }
          that.setData({
            checkedGoodsList: res.data.goods
          }) 
        }
      },
      fail: function() {
        util.showErrorToast('操作失败');
        wx.navigateBack({
          delta: 1
        })
      }
    })
  },
  getCheckoutInfo: function () {
    let that = this;
    util.request(api.CartCheckout, { addressId: that.data.addressId, couponId: that.data.couponId }).then(function (res) {
      if (res.errno === 0) {
        console.log(res.data);
        that.setData({
          checkedAddress: res.data.checkedAddress,
          freightLimit: res.data.freightLimit,// 运费的最低消费
          freightPrice: res.data.freightPrice // 运费
        });
      }
      wx.hideLoading();
    });
  },
  selectAddress(){
    wx.navigateTo({
      url: '/pages/shopping/address/address',
    })
  },
  addAddress() {
    wx.redirectTo({
      url: '/pages/ucenter/addressAdd/addressAdd',
    })
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    wx.showLoading({
      title: '加载中...',
    })
    try {
      var addressId = wx.getStorageSync('addressId');
      if (addressId) {
        this.setData({
          'addressId': addressId
        });
      }
    } catch (e) {
      util.showErrorToast('请选择收货地址')
    }
    this.getCheckoutInfo();
    this.getCheckedGoods();
    
  },
  onHide:function(){
    // 页面隐藏
    
  },
  onUnload:function(){
    // 页面关闭
    
  },
  submitOrder: function(){
    // 校验单个商品价格和总价，库存是否充足
    wx.removeStorage({
      key: comConst.checkoutGoods.storageName
    })
    // if (this.data.addressId <=0) {
    //   util.showErrorToast('请选择收货地址');
    //   return false;
    // }

    // let that = this;
    // util.request(api.OrderSubmit, { addressId: that.data.addressId, couponId: that.data.couponId }, 'POST').then(function (res) {
    //   if (res.errno === 0) {
    //     wx.redirectTo({
    //       url: '/pages/pay/pay?orderId=' + res.data.orderInfo.id + '&actualPrice=' + res.data.orderInfo.actual_price
    //     })
      
    //   } else {
    //     util.showErrorToast(res.data.errmsg);
    //   }
    // });

   
  }
})