var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var comConst = require('../../../config/common.js');

var app = getApp();

Page({
  data:{
    checkedGoodsList:[], // 下单商品
    checkedAddress: {}, // 收货地址
    freightPrice:1, // 规定运费
    freightLimit: 0, // 运费最低消费
    addressId: -1, // 没有地址时默认小于0
    werunDedPrice:0.00,// 微信步数抵扣
    freight: 0.00, // 实付运费
    goodsPrice:0.00, // 商品合计
    payPrice: 0.00, // 实付

    werunDedStatus: false, // 微信抵扣功能是否可用
    werunDedSteps: 50000, // 抵扣基数，每werunDedSteps步可抵扣werunDedStepsPeice元
    werunDedStepsPeice: 0.01, //每werunDedSteps步可抵扣werunDedStepsPeice元
    werunDedOrderMiniPrice: 100, //订单每满werunDedOrderMiniPrice元可使用一次抵扣werunDedStepsPeice元
    restWerunSteps: 0,// 剩余可抵扣的步数
    werunMaxDedUnits: 0, // 最大可抵扣的单位数量

    useWerun: true,

    submitOrderTryTimes: 0
  },
  onLoad:function(options){
    // 第一进入时删除掉之前选择的收货地址
    wx.removeStorageSync('addressId')
  },
  getCheckedGoods: function (cb) {
    let that = this
    wx.getStorage({
      key: comConst.checkoutGoods.storageName,
      success: function (res) {
        // 再次校验是否有商品
        if (res.data.goods.length == 0){
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

          cb && cb()
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
  getCheckoutInfo: function (cb) {
    let that = this;
    let params = { addressId: that.data.addressId }
    if (that.data.addressId < 0){
      delete params.addressId
    }
    util.request(api.CartCheckout, params).then(function (res) {
      if (res.errno === 0) {
        console.log(res.data);
        if (res.data.checkedAddress.id) {
          that.setData({
            addressId: res.data.checkedAddress.id
          })
        }
        that.setData({
          checkedAddress: res.data.checkedAddress, //收货地址详细
          freightLimit: res.data.appConfig.freight_limit,// 运费最低消费
          freightPrice: res.data.appConfig.freight_price, // 规定运费
          //freight: res.data.appConfig.freight_price, // 实付运费
          werunDedStatus: res.data.appConfig.werun_ded_status == 1, // 微信抵扣功能是否可用
          werunDedSteps: res.data.appConfig.werun_ded_steps, // 抵扣基数，每werunDedSteps步可抵扣werunDedStepsPeice元
          werunDedStepsPeice: res.data.appConfig.werun_ded_steps_peice, //每werunDedSteps步可抵扣werunDedStepsPeice元
          werunDedOrderMiniPrice: res.data.appConfig.werun_ded_order_mini_price, //订单每满werunDedOrderMiniPrice元可使用一次抵扣werunDedStepsPeice元
          restWerunSteps: res.data.restWerunSteps,// 剩余可抵扣的步数
          werunMaxDedUnits: res.data.werunMaxDedUnits // 最大可抵扣的单位数量
        })
        cb && cb()
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
    wx.navigateTo({
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
    this.getCheckedGoods(() => {
      this.getCheckoutInfo(() => {

        // 1.商品合计
        let goodsPrice = 0
        this.data.checkedGoodsList.forEach(el => {
          goodsPrice = goodsPrice + el.number * el.sku.retail_price
        })
        this.setData({
          goodsPrice: goodsPrice.toFixed(2)
        })
        // 2.运费（超过免运费标准则为0.00）
        if (this.data.goodsPrice * 1 >= this.data.freightLimit) {
          this.setData({
            freight: Number(0.00).toFixed(2)
          })
        }else{
          this.setData({
            freight: this.data.freightPrice
          })
        }

        //restWerunSteps: res.data.restWerunSteps,// 剩余可抵扣的步数
          // werunMaxDedUnits
        // 3.计算微信步数可抵扣的部分
        let werunDedPrice = 0.00
        // a.微信抵扣可用；b.用户使用抵扣；c.步数达到最低抵扣数;d.商品总价达到最低可抵扣额度
        if (this.data.werunDedStatus && this.data.useWerun && this.data.werunMaxDedUnits > 0 && this.data.goodsPrice >= this.data.werunDedOrderMiniPrice) {
          let werunGoodsDedUnits = parseInt(((this.data.goodsPrice * 1) / this.data.werunDedOrderMiniPrice), 10) //订单最多实际可以抵扣的单位
          let realUnits = this.data.werunMaxDedUnits > werunGoodsDedUnits ? werunGoodsDedUnits : this.data.werunMaxDedUnits
          werunDedPrice = realUnits * this.data.werunDedStepsPeice

          this.setData({
            werunDedPrice: werunDedPrice
          })
        }

        let payPrice = this.data.goodsPrice * 1 + this.data.freight * 1 - this.data.werunDedPrice
        this.setData({
          payPrice: payPrice.toFixed(2)
        })

      });
    });
    
  },
  switchUseWerun: function (event) {
    let isUseWerun = event.detail.value
    this.setData({
      useWerun: isUseWerun
    })
    if (isUseWerun) {
      let payPrice = this.data.goodsPrice * 1 + this.data.freight * 1 - this.data.werunDedPrice
      this.setData({
        payPrice: payPrice.toFixed(2)
      })
    }else {
      let payPrice = this.data.goodsPrice * 1 + this.data.freight * 1
      this.setData({
        payPrice: payPrice.toFixed(2)
      })
    }
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
    // wx.removeStorageSync(comConst.checkoutGoods.storageName)// 删除本地缓存的商品
    // wx.removeStorageSync('addressId')
  },

  // 提交订单
  submitOrder: function(){
    wx.showLoading({
      title:'下单中',
      mask: true
    })
    // 校验是否有收货地址
    if (!this.data.checkedAddress.id) {
      util.showErrorToast('请选择收货地址');
      return false;
    }
    //校验是否有商品（到这一步一般不会出现无商品）
    if (this.data.checkedGoodsList.length <= 0){
      util.showErrorToast('请选择商品');
      return false;
    }
    // 封装提交的数据：收货地址id，是否使用微信步数抵扣，商品id和对应的规格id，实付(用于后台校验订单的准确性)
    let orderData = {
      address: { id: this.data.checkedAddress.id},
      isUseWerun: this.data.useWerun,
      werunMoney: this.data.werunDedPrice,
      freightMoney: this.data.freight,
      goods: [],
      payMoney: this.data.payPrice
    }
    for(let i = 0, l = this.data.checkedGoodsList.length; i < l; i++){
      orderData.goods.push({
        goodId: this.data.checkedGoodsList[i].id,
        skuId: this.data.checkedGoodsList[i].sku.id,
        number: this.data.checkedGoodsList[i].number
      })
    }

    util.request(api.OrderSubmit, orderData, 'POST').then(res => {

      if (res.errno === 0) {
        // TODO
        wx.requestPayment({
          'timeStamp': res.data.timeStamp,
          'nonceStr': res.data.nonceStr,
          'package': res.data.package,
          'signType': res.data.signType,
          'paySign': res.data.paySign,
          'success': function (wxPayRes) {
            // 支付成功，修改订单状态
            util.request(api.OrderPayClientSuccess, { id: wxPayRes.data.statusCode, sn: wxPayRes.data.orderSN, status: wxPayRes.data.orderId}, 'POST').then(successRes => {
              debugger
              if (successRes.errno === 0) {
                wx.navigateTo({
                  url: '/pages/payResult/payResult?status=1', // 1:支付成功；2：支付失败
                })
              }else{
                wx.navigateTo({
                  url: '/pages/payResult/payResult?status=2&orderId=' + res.data.statusCode
                })
              }
            })

          },
          'fail': function (successRes) {
            wx.navigateTo({
              url: '/pages/payResult/payResult?status=2&orderId=' + res.data.statusCode
            })
          },
          'complete': function (successRes) {

          }
        })
        // wx.redirectTo({
        //   url: '/pages/pay/pay?orderId=' + res.data.orderInfo.id + '&actualPrice=' + res.data.orderInfo.actual_price
        // })
      
        wx.hideLoading()
      } else {
        this.setData({
          submitOrderTryTimes: this.data.submitOrderTryTimes + 1
        })
        //  用户主动尝试 3 次，仍失败则返回上一页
        if (this.data.submitOrderTryTimes >= 3){
        wx.navigateBack({
          delta: 1
        })
        }
        wx.hideLoading()
        util.showErrorToast(res.errmsg);
      }
      
    });
  },

// 干扰因素太多不利于用户下单，尽量减少干扰因素
  pushWerun: function () {
    wx.showLoading({
      title: '更新步数',
    });
    let that = this
    // 获取用户步数并上传，然后返回可以抵扣的相关数据
    wx.getWeRunData({
      success(res) {
        util.request(api.PushWerun, { encryptedData: res }, 'POST').then(res => {
          wx.hideLoading();
          if (res.errno === 0) {
            // 上传自己的步数后获取可使用的抵扣信息
            // 要更新页面数据：可抵扣钱数，实付金额
            that.setData({
              werunMaxDedUnits: res.data.werunMaxDedUnits // 最大可抵扣的单位数量
            })
            // 3.计算微信步数可抵扣的部分
            let werunDedPrice = 0.00
            // a.微信抵扣可用；b.用户使用抵扣；c.步数达到最低抵扣数;d.商品总价达到最低可抵扣额度
            if (that.data.werunDedStatus && that.data.useWerun && that.data.werunMaxDedUnits > 0 && that.data.goodsPrice >= that.data.werunDedOrderMiniPrice) {
              let werunGoodsDedUnits = parseInt(((that.data.goodsPrice * 1) / that.data.werunDedOrderMiniPrice), 10) //订单最多实际可以抵扣的单位
              let realUnits = that.data.werunMaxDedUnits > werunGoodsDedUnits ? werunGoodsDedUnits : that.data.werunMaxDedUnits
              werunDedPrice = realUnits * that.data.werunDedStepsPeice
              that.setData({
                werunDedPrice: werunDedPrice,
                restWerunSteps: res.data.restWerunSteps
              })
            }
            let payPrice = that.data.goodsPrice * 1 + that.data.freight * 1 - that.data.werunDedPrice
            that.setData({
              payPrice: payPrice.toFixed(2)
            })
          } else if (res.errno === 1101) {
            util.showErrorToast('该时段无法更新')
          } else {
            // （一般不会出现的）上传失败，默默的消化这个错误吧，不再打扰用户下单
            util.showErrorToast('更新步数失败')
          }
        })
      },
      // 用户之前拒绝了使用微信运动数据的权限
      fail(e) {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: '该页面需要获取您的“微信步数”，请点击确定去设置。',
          success: function (res) {

            if (res.confirm) {
              wx.openSetting({
                success(res) {
                  if (res.authSetting['scope.werun']) {
                    that.pushWerun() // 用户允许后再次尝试上传
                  } else {
                    // 用户拒绝就拒绝吧，不在干扰用户下单
                    // util.showErrorToast('无法使用优惠')
                  }
                }
              })
            } else if (res.cancel) {
             // 用户拒绝就拒绝吧，不在影响用户下单
            }
          },
          fail: function () {
          }
        })
      }
    })
  }
})