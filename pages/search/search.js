var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var comConst = require('../../config/common.js');
var app = getApp();

var app = getApp()
Page({
  data: {
    keywrod: '',
    searchStatus: false,
    goodsList: [],
    helpKeyword: [],
    historyKeyword: [],
    categoryFilter: false,
    currentSortType: 'default',
    currentSortOrder: '',
    filterCategory: [],
    defaultKeyword: {},
    hotKeyword: [],
    page: 0,
    size: 10,
    totalPages: 0
  },
  //事件处理函数
  closeSearch: function () {
    wx.navigateBack()
  },
  clearKeyword: function () {
    this.setData({
      keyword: '',
      searchStatus: false
    });
  },
  onLoad: function () {

    this.getSearchKeyword();
  },
  onShow: function() {
    this.setData({
      cartCount: app.globalData.cartCount
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
  getSearchKeyword() {
    let that = this;
    util.request(api.SearchIndex).then(res => {
      if (res.errno == 0) {
        this.setData({
          defaultKeyword: res.data.defaultKeyword,
          hotKeyword: res.data.hotKeywordList
        });
      }
    });
    wx.getStorage({
      key: comConst.localStorage.historyKeyword,
      success: function (res) {
        this.setData({
          historyKeyword: res.data.historyKeyword.split(",")
        });
      }
    })
  },

  // inputChange: function (e) {
  //   debugger

  //   this.setData({
  //     keyword: e.detail.value,
  //     searchStatus: false
  //   });
  //   this.getHelpKeyword();
  // },
  getHelpKeyword: function () {
    wx.getStorage({
      key: comConst.localStorage.historyKeyword,
      success: function (res) {
        this.setData({
          helpKeyword: res.data.historyKeyword.split(",")
        });
      }
    })
  },
  inputFocus: function () {
    this.setData({
      searchStatus: false
    });
  },
  clearHistory: function () {
    wx.removeStorage({
      key: comConst.localStorage.historyKeyword,
      success: res => {
        this.setData({
          historyKeyword: []
        })
      }
    })
  },
  getGoodsList: function () {
    let that = this;
    util.request(api.GoodsList, { keyword: that.data.keyword, page: that.data.page, size: that.data.size }).then(function (res) {
      if (res.errno === 0) {
        that.setData({
          searchStatus: true,
          goodsList: that.data.page > 0 ? that.data.goodsList.concat(res.data.data) : res.data.data,
          totalPages: res.data.totalPages,
          page: res.data.currentPage + 1
        });
      }
      //重新获取关键词
      // that.getSearchKeyword();
    });
  },
  // 更新本地搜索历史记录
  updateSearchHistory: function(keyword) {

  },
  onKeywordTap: function (event) {
    this.setData({
      keyword: event.target.dataset.keyword,
      page: 0,
      size: 10,
      goodsList: []
    });
    this.getSearchResult();

  },
  getSearchResult() {
    this.getGoodsList();
  },
  // openSortFilter: function (event) {
  //   let currentId = event.currentTarget.id;
  //   switch (currentId) {
  //     case 'categoryFilter':
  //       this.setData({
  //         'categoryFilter': !this.data.categoryFilter,
  //         'currentSortOrder': 'asc'
  //       });
  //       break;
  //     case 'priceSort':
  //       let tmpSortOrder = 'asc';
  //       if (this.data.currentSortOrder == 'asc') {
  //         tmpSortOrder = 'desc';
  //       }
  //       this.setData({
  //         'currentSortType': 'price',
  //         'currentSortOrder': tmpSortOrder,
  //         'categoryFilter': false
  //       });

  //       this.getGoodsList();
  //       break;
  //     default:
  //       //综合排序
  //       this.setData({
  //         'currentSortType': 'default',
  //         'currentSortOrder': 'desc',
  //         'categoryFilter': false
  //       });
  //       this.getGoodsList();
  //   }
  // },
  // selectCategory: function (event) {
  //   let currentIndex = event.target.dataset.categoryIndex;
  //   let filterCategory = this.data.filterCategory;
  //   let currentCategory = null;
  //   for (let key in filterCategory) {
  //     if (key == currentIndex) {
  //       filterCategory[key].selected = true;
  //       currentCategory = filterCategory[key];
  //     } else {
  //       filterCategory[key].selected = false;
  //     }
  //   }
  //   this.setData({
  //     'filterCategory': filterCategory,
  //     'categoryFilter': false,
  //     categoryId: currentCategory.id,
  //     page: 1,
  //     goodsList: []
  //   });
  //   this.getGoodsList();
  // },
  onKeywordConfirm(event) {
    this.setData({
      keyword: event.detail.value,
      page: 0,
      size: 10,
      goodsList: []
    });
    this.getSearchResult();
  },
  onReachBottom() {
    if (this.data.totalPages > this.data.page) {
      this.getSearchResult();
    } else {
      return false;
    }
  }
})