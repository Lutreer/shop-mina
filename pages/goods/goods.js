var app = getApp();
var WxParse = require('../../lib/wxParse/wxParse.js');
var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var comConst = require('../../config/common.js');

Page({
  data: {
    id: 0,
    skuId: null,
    goods: {},
    activeSku:{},
    goodsNum:1,

    issueList: [],
    relatedGoods: [],
    cartGoodsCount: 0
  },
  getGoodsInfo: function () {
    wx.showLoading({
      title: '加载中...',
    });
    util.request(api.GoodsDetail, { id: this.data.id }).then(res => {
      if (res.errno === 0) {
        if (!res.data.goods.goods_sku) {
          util.showErrorToast("商品已下架")
          setTimeout(function() {
            wx.navigateBack({
              delta: 1
            })
          }, 1500)
          return false
        }
        res.data.goods.list_pic_url = res.data.goods.list_pic_url.split(",");
        res.data.goods.swipe_pic_url = res.data.goods.swipe_pic_url.split(",");
        res.data.goods.desc_pic_url = res.data.goods.desc_pic_url.split(",");

        res.data.goods.promotion_tag = res.data.goods.promotion_tag.split("*");

        this.setData({
          activeSku: res.data.goods.goods_sku[0],
          goods: res.data.goods,
          cartGoodsCount: res.data.cartCount
        });
        if(this.data.skuId){
          for (let i = 0, l = res.data.goods.goods_sku.length; i < l; i++) {
            if (this.data.skuId == res.data.goods.goods_sku[i].id){
              this.setData({
                activeSku: res.data.goods.goods_sku[i]
              });
              break
            }
          }
        }else{
          this.setData({
            activeSku: res.data.goods.goods_sku[0]
          });
        }
      }else{
        wx.navigateBack({
          delta: 1
        })
      }
      wx.hideLoading();
      wx.stopPullDownRefresh()
    });
  },
  /**
   * 点击价格计划
   */
  selectSku: function (event) {
    let selectSku = event.currentTarget.dataset.sku
    if (selectSku.id != this.data.activeSku.id) {
      this.setData({
        activeSku: event.currentTarget.dataset.sku
      });
    }
  },
  clickSkuValue: function (event) {
    let that = this;
    let specNameId = event.currentTarget.dataset.nameId;
    let specValueId = event.currentTarget.dataset.valueId;

    //判断是否可以点击

    //TODO 性能优化，可在wx:for中添加index，可以直接获取点击的属性名和属性值，不用循环
    let _specificationList = this.data.specificationList;
    for (let i = 0; i < _specificationList.length; i++) {
      if (_specificationList[i].specification_id == specNameId) {
        for (let j = 0; j < _specificationList[i].valueList.length; j++) {
          if (_specificationList[i].valueList[j].id == specValueId) {
            //如果已经选中，则反选
            if (_specificationList[i].valueList[j].checked) {
              _specificationList[i].valueList[j].checked = false;
            } else {
              _specificationList[i].valueList[j].checked = true;
            }
          } else {
            _specificationList[i].valueList[j].checked = false;
          }
        }
      }
    }
    this.setData({
      'specificationList': _specificationList
    });
    //重新计算spec改变后的信息
    this.changeSpecInfo();

    //重新计算哪些值不可以点击
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      id: parseInt(options.id)
      // id: 1181000
    });
    if (options.skuId) {
      this.setData({
        skuId: parseInt(options.skuId)
      });
    }
    this.getGoodsInfo();
  },
  onPullDownRefresh: function () {
    this.getGoodsInfo();
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
  openCartPage: function () {
    wx.switchTab({
      url: '/pages/cart/cart',
    });
  },
  addToCar: function (event) {
    const goodId = event.currentTarget.dataset.goodid
    const skuId = event.currentTarget.dataset.skuid

    // 更新购物车
    app.addGoodsToCart(goodId, skuId, this.data.goodsNum, () => {
      this.setData({
        cartGoodsCount: this.data.cartGoodsCount + this.data.goodsNum
      });
    })
  },
  // 结算
  toClearing: function() {
    this.data
    debugger
    let goods = JSON.parse(JSON.stringify(this.data.goods))
    let sku = JSON.parse(JSON.stringify(this.data.activeSku))
    goods.sku = sku
    goods.number = this.data.goodsNum

    // 删去不必要的字段, 减小storage的大小
    delete goods.sku.remark

    delete goods.goods
    delete goods.goods_sku
    delete goods.sku_picker
    delete goods.desc_pic_url
    delete goods.swipe_pic_url
    delete goods.goods_desc
    delete goods.promotion_tag
    
    wx.setStorage({
      key: comConst.checkoutGoods.storageName,
      data: { goods: [goods], isFilter: false, source: comConst.checkoutGoods.source.goodDetail },
      success: function () {
        wx.navigateTo({
          url: '../shopping/checkout/checkout'
        })
      }
    })
  },
  // 减商品数量
  cutNumber: function (event) {
    if (this.data.goodsNum <= 1){
      return false
    }
    this.setData({
      goodsNum: this.data.goodsNum - 1
    });
  },
  addNumber: function (event) {
    if (this.data.goodsNum >= 500) {
      return false
    }
    this.setData({
      goodsNum: this.data.goodsNum + 1
    });
  }
})