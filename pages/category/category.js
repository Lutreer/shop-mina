var util = require('../../utils/util.js');
var api = require('../../config/api.js');
const app = getApp()

Page({
  data: {
    cartCount: 0,
    addAnimation: false,

    navList: [],
    categoryList: [],
    currentCategory: {},
    currentGoods: [],
    searchPlaceholder: '',
    goodsCount: 0
  },
  onLoad: function () {
    this.setData({
      cartCount: app.globalData.cartCount
    })

    this.setData({
      currentCategory: {
        id: app.globalData.tabParam.category_id
      }
    })
    
    this._getCategory().then(res => {
      if (!app.globalData.tabParam.category_id) {
        this._getCurrentCategory(res[0].id)
      }
    })
    
    
  },
  addToCar: function (event) {
    const goodId = event.currentTarget.dataset.goodid
    const skuId = event.currentTarget.dataset.skuid
    this.setData({
      cartCount: ++this.data.cartCount
    })
    // 更新购物车
    app.addGoodsToCart(goodId, skuId, 1, () => {
      this.setData({
        cartCount: ++this.data.cartCount
      })
    })
  },
  // 获取分类列表
  _getCategory: function () {
    //categoryList
    return new Promise((resolve, reject) => {
      // 获取分类列表
      util.request(api.CategoryList, 'post').then(res => {
        this.setData({
          navList: res.data.categoryList,
          searchPlaceholder: res.data.searchPlaceholder
        });
        resolve(res.data.categoryList)
      });
    })
  },
  // 获取当前分类下的商品
  _getCurrentCategory: function (id) {
    wx.showLoading({
      title: '加载中...',
    });
    
    let that = this;
    util.request(api.CategoryCurrent, {id: id})
      .then(res => {
        that.setData({
          currentGoods: res.data.currentGoods,
          currentCategory: res.data.currentCategory
        });
        setTimeout( () => {
          this.setData({
            currentCategory: that.data.navList.filter(item => {
              return item.id == id
            })[0]
          })
        }, 0)
       
        wx.hideLoading();
      });
  },
  onReady: function () {
    // 页面渲染完成

  },
  onShow: function () {
    this.setData({
      cartCount: app.globalData.cartCount
    })
    // 分类定位
    if (app.globalData.tabParam.category_id && this.data.currentCategory.id !== app.globalData.tabParam.category_id) {
      this._getCurrentCategory(app.globalData.tabParam.category_id);
    }
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  switchCate: function (event) {
    var currentTarget = event.currentTarget;
    if (this.data.currentCategory.id == currentTarget.dataset.id) {
      return false;
    }
    this._getCurrentCategory(currentTarget.dataset.id);
    this.setData({
      scrollTop: 0
    })
  },
  addToCar: function (event) {
    const goodId = event.currentTarget.dataset.goodid
    const skuId = event.currentTarget.dataset.skuid
    
    // 更新购物车
    app.addGoodsToCart(goodId, skuId, 1, () => {
      this.setData({
        cartCount: ++this.data.cartCount
      })
    })
  },
// 购物车上面的icon
  goToCart: function () {
    app.switchTab({
      url: '/pages/cart/cart'
    })
  },
  scrolltolower: function(event) {
    // TODO 分页 延迟加载
  },
  // 右上角转发菜单触发
  onShareAppMessage: function () {
    return {
      title: common.shareTitle_a,
      path: '/pages/rankingGoods/rankingGoods'
    }
  }
})