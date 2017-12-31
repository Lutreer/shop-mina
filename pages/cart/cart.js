var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var comConst = require('../../config/common.js');

var app = getApp();

Page({
  data: {
    selectedCount:0.33, // 非编辑状态下勾选的商品数量
    editSelectedCount: 0, // 编辑状态下勾选的商品数量
    cartCount:0, // 总数
    checkedGoodsPrice:0.00,
    savePrice: 0.00,
    cartGoods: [],
    
    isEditCart: false,
    checkedAllStatus: true
  },
  _reset: function () {
    this.setData({
      selectedCount: 0,
      editSelectedCount: 0,
      cartGoods: [],
      cartCount: 0,
      checkedGoodsPrice: new Number(0).toFixed(2),
      savePrice: new Number(0).toFixed(2),
      isEditCart: false,
      checkedAllStatus: true
    })
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    // 页面显示
    this._reset();
    this.getCartList();
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // this._getCartCount()
    
    // 如果购物车有更新再而三重新加载
    if (app.globalData.cartChanged == true) {
      this._reset();
      this.getCartList();
      this.setCheckedGoodsPrice()
      app.globalData.cartChanged = false
    }
  },
  _getCartCount: function() {
    this.setData({
      cartCount: app.globalData.cartCount
    })
  },
  onPullDownRefresh: function () {
    this._reset();
    this.getCartList();
  },
  onHide: function () {
    // 页面隐藏

  },
  onUnload: function () {
    // 页面关闭

  },
  // 初次进入页面时获取购物车的商品，并格式化一些数据
  getCartList: function () {
    wx.showLoading({
      title: '加载中...',
    });
    let that = this;
    util.request(api.CartList).then(function (res) {
      if (res.errno === 0) {
        let cartList = res.data.cartList
        for (let i = 0, l = cartList.length; i < l; i++) {
          cartList[i]['selected'] = false
          cartList[i]['editSelected'] = false
          cartList[i].goods.sku = null
          cartList[i].goods.sku_picker = []
          cartList[i].goods.skuIndex = -1

          for (let m = 0, n = cartList[i].goods.goods_sku.length; m < n; m++) {
            if (cartList[i].goods.goods_sku[m].id == cartList[i].sku_id){
              cartList[i].goods.sku = cartList[i].goods.goods_sku[m]

              cartList[i].goods.skuIndex = m
            }
          }

          // 若商品一下架，则continue
          if (cartList[i].goods.status != 1 || cartList[i].goods.is_on_sale != 1) {
            continue
          }
          cartList[i].goods.sku = cartList[i].goods.goods_sku.filter(function (el) {
            return el.id === cartList[i].sku_id
          })[0]

          // cartList[i].goods.sku.length == 0 表示该规格已经下架
          if (cartList[i].goods.sku) {
            cartList[i].goods.sku_picker = cartList[i].goods.goods_sku.map(function (el) {
              return ' ￥' + el.retail_price + '  / ' + el.name
            })
          }

        }
        that.setData({
          cartGoods: cartList
        });
      }
      wx.hideLoading();
      wx.stopPullDownRefresh()
    });
  },
  toGoodsDetail: function (event) {
    let goods = event.currentTarget.dataset.goods;
    if (goods.goods.is_on_sale == 0 || goods.goods.status == 0 || !goods.goods.sku || !goods.goods.sku.id ) { // 下架了
      util.showErrorToast('商品已下架')
      return false
    }else {
      wx.navigateTo({
        url: '/pages/goods/goods?id=' + goods.goods_id +'&skuId=' + goods.sku_id
      })
    }

  },
  setCheckedGoodsPrice: function() {
    let goods = this.data.cartGoods
    let savePrice = 0
    let checkedGoodsPrice = 0
    for (let itemIndex = 0, l = goods.length; itemIndex < l; itemIndex++) {
      let sku = goods[itemIndex].goods.sku
      if (goods[itemIndex].selected && goods[itemIndex].goods.status == 1 && goods[itemIndex].goods.is_on_sale == 1 && sku) {
          // 计算总价
          let num = goods[itemIndex].number
          let _checkedGoodsPrice = checkedGoodsPrice * 1 + sku.retail_price * num
          let _savePrice = savePrice * 1 + ((sku.market_price || sku.retail_price) - sku.retail_price) * num
          checkedGoodsPrice = _checkedGoodsPrice.toFixed(2)
          savePrice = _savePrice.toFixed(2)
        }
    }
  
    this.setData({
      checkedGoodsPrice: checkedGoodsPrice,
      savePrice: savePrice
    })
  },
  // 非编辑状态下check单个商品
  checkedItem: function (event) {
    let itemIndex = event.target.dataset.itemIndex;
    let key = 'cartGoods[' + itemIndex + '].selected'
    let good = this.data.cartGoods[itemIndex]
    let checked = !good.selected

    let checkedGoodsPrice = this.data.checkedGoodsPrice
    checked ? this.setData({ selectedCount: ++this.data.selectedCount }) : this.setData({ selectedCount: --this.data.selectedCount })

    // 选择状态 
    this.setData({
      [key]: !good.selected
    });
    // this._getTotalPrice()

    // 计算总价
    let savePrice = this.data.savePrice
    let num = good.number
    let sku = good.goods.sku
    let _checkedGoodsPrice, _savePrice

    // 如果商品或规格已下架则不再计算价格
    if (good.goods.status == 1 && good.goods.is_on_sale && sku){
      if (checked) {
        _checkedGoodsPrice = checkedGoodsPrice * 1 + sku.retail_price * num
        _savePrice = savePrice * 1 + ((sku.market_price || sku.retail_price) - sku.retail_price) * num
      } else {
        _checkedGoodsPrice = checkedGoodsPrice * 1 - sku.retail_price * num
        _savePrice = savePrice * 1 - ((sku.market_price || sku.retail_price) - sku.retail_price) * num
      }

      checkedGoodsPrice = _checkedGoodsPrice.toFixed(2) * 1
      savePrice = _savePrice.toFixed(2) * 1

      // 计算价格
      this.setData({
        checkedGoodsPrice: checkedGoodsPrice,
        savePrice: savePrice
      })
    }
  },
  // 编辑状态下check单个商品
  checkedEditItem: function (event) {
    let itemIndex = event.target.dataset.itemIndex;
    let key = 'cartGoods[' + itemIndex + '].editSelected'
    this.data.cartGoods[itemIndex].editSelected ? this.setData({ editSelectedCount: --this.data.editSelectedCount }) : this.setData({ editSelectedCount: ++this.data.editSelectedCount })
    this.setData({
      [key]: !this.data.cartGoods[itemIndex].editSelected
    });
  },
 
  //非编辑状态下全选
  checkedAll: function () {
    let checkedAll = this.data.selectedCount < this.data.cartGoods.length // 事件将要导致的状态
    let selectedCount = this.data.selectedCount
    let savePrice = this.data.savePrice
    let checkedGoodsPrice = this.data.checkedGoodsPrice
    for (let itemIndex = 0, l = this.data.cartGoods.length; itemIndex < l; itemIndex++) {
      let key = 'cartGoods[' + itemIndex + '].selected'
      let good = this.data.cartGoods[itemIndex]
      if (checkedAll) {
        if (!good.selected) {
          this.setData({
            [key]: true
          });
          ++selectedCount

          // 计算总价
          if (good.goods.status == 1 && good.goods.is_on_sale && good.goods.sku) {
            let num = good.number
            let sku = good.goods.goods_sku.filter(el => {
              return el.id == good.sku_id
            })[0]
            let _checkedGoodsPrice = checkedGoodsPrice * 1 + sku.retail_price * num
            let _savePrice = savePrice * 1 + ((sku.market_price || sku.retail_price) - sku.retail_price) * num
            checkedGoodsPrice = _checkedGoodsPrice.toFixed(2)
            savePrice = _savePrice.toFixed(2)
          }
        }
        

      } else {
        --selectedCount
        this.setData({
          [key]: false
        });
      }
    }
    this.setData({ selectedCount: selectedCount })
    // 计算价格
    if (checkedAll) {
     // 全选总价
      this.setData({
        checkedGoodsPrice: checkedGoodsPrice,
        savePrice:  savePrice
      })
    } else {
      this.setData({
        checkedGoodsPrice: 0,
        savePrice: 0
      })
    }
  },
  // 编辑状态下全选
  editCheckedAll: function() {
    let checkedAll = this.data.editSelectedCount < this.data.cartGoods.length
    let editSelectedCount = this.data.editSelectedCount

    for (let itemIndex = 0, l = this.data.cartGoods.length; itemIndex < l; itemIndex++) {
      let key = 'cartGoods[' + itemIndex + '].editSelected'
      let good = this.data.cartGoods[itemIndex]
      if (checkedAll){
        if (!good.editSelected) {
          ++editSelectedCount
          this.setData({
            [key]: true
          });
        }
      }else{
        --editSelectedCount
        this.setData({
          [key]: false
        });
        this.setData({
          [key]: false
        });
      }
      
    }
    this.setData({ editSelectedCount: editSelectedCount })
  },
  // 点击编辑or完成
  editCart: function () {
    // 如果点击的是完成，要计算非编辑状态下选择的商品的总价
    if (this.data.isEditCart) {
      this.setCheckedGoodsPrice()
    }
    this.setData({
      isEditCart: !this.data.isEditCart
    })

    for (let i = 0, l = this.data.cartGoods.length; i < l; i++) {
      let key = 'cartGoods[' + i + '].editSelected'
      this.setData({
        [key]: false
      })
    }
    this.setData({
      editSelectedCount: 0
    })
  },
  updateCart: function (data, cb) {
    let that = this;
    util.request(api.CartUpdate, {
      user_id: data.user_id,
      goods_id: data.goods_id,
      sku_id: data.sku_id,
      num: data.num,
      id: data.id
    }, 'POST').then(function (res) {
      if(res.errno == 0) {
        cb()
      }else{
        util.showErrorToast(res.errmsg)
      }
      })
  },
  // 减商品数量
  cutNumber: function (event) {
    let itemIndex = event.target.dataset.itemIndex;
    let cartItem = this.data.cartGoods[itemIndex];
    let key = 'cartGoods[' + itemIndex + '].number'
    if (cartItem.number - 1 >= 1) {
     
      this.updateCart({ num: cartItem.number - 1, id: cartItem.id, sku_id: cartItem.sku_id, goods_id: cartItem.goods_id }, ()=>{
        this.setData({
          [key]: cartItem.number - 1
        });
        app.setCartCount(-1)
        this._getCartCount()
      });
    }
  },
  addNumber: function (event) {
    let itemIndex = event.target.dataset.itemIndex;
    let cartItem = this.data.cartGoods[itemIndex];
    let key = 'cartGoods[' + itemIndex + '].number'
    if (cartItem.number + 1 <= 1000) {
      this.updateCart({ num: cartItem.number + 1, id: cartItem.id, sku_id: cartItem.sku_id, goods_id: cartItem.goods_id }, () => {
        this.setData({
          [key]: cartItem.number + 1
        });
        app.setCartCount(1)
        this._getCartCount()
      });
    }
  },
  bindPickerChange:function(e) {
    const goodsIndex = e.target.dataset.goodsIndex
    const skuIndex = e.detail.value*1 // 选中的sku

    const sku = this.data.cartGoods[goodsIndex].goods.goods_sku[skuIndex]

    const skuId = sku.id// 选中的sku id
    const goodsId = this.data.cartGoods[goodsIndex].goods.id
    const oldSkuId = this.data.cartGoods[goodsIndex].sku_id

    //判断下是否改变了选择
    if (skuId == oldSkuId){
      return false
    }

    let isMerge = false

    for (let i = 0, l = this.data.cartGoods.length; i < l; i++){
      // 如果购物车中有相同的商品则做合并处理 
      if (this.data.cartGoods[i].goods_id == goodsId && this.data.cartGoods[i].sku_id == skuId){
        const numberKey = 'cartGoods[' + i + '].number'
        // 将数量合并到已有的商品上去
        const num = this.data.cartGoods[i].number + this.data.cartGoods[goodsIndex].number
        this.updateCart({ num: num, id: this.data.cartGoods[i].id, sku_id: skuId, goods_id: goodsId }, () => {
          this.setData({
            [numberKey]: num
          })
          // 删掉当前重复的商品
          util.request(api.CartDelete, {
            cartId:[ this.data.cartGoods[goodsIndex].id]
          }, 'POST').then(res => {
            if (res.errno === 0) {
              // 删除掉this.data中的该数据
              let _cartList = this.data.cartGoods
              let spliceGood = _cartList.splice(goodsIndex, 1)
              this.setData({
                cartGoods: _cartList
              })

              // 修checked数量
              if (spliceGood.selected == true){
                this.setData({
                  selectedCount: this.data.selectedCount == 0 ? 0 : this.data.selectedCount - 1
                })
              }
              if (spliceGood.editSelected == true) {
                this.setData({
                  editSelected: this.data.editSelected == 0 ? 0 : this.data.editSelected - 1
                })
              }
            }
          });
        });
        isMerge = true
        break
      }
    }

    if (!isMerge) {
      const skuIdKey = 'cartGoods[' + goodsIndex + '].sku_id'
      const skuKey = 'cartGoods[' + goodsIndex + '].goods.sku'
      const skuIndexKey = 'cartGoods[' + goodsIndex + '].goods.skuIndex'
      this.updateCart({ num: this.data.cartGoods[goodsIndex].number, id: this.data.cartGoods[goodsIndex].id, sku_id: sku.id, goods_id: goodsId }, () => {
        this.setData({
          [skuIdKey]: sku.id,
          [skuKey]: sku,
          [skuIndexKey]: skuIndex
        })
      })
      
    }
    
  },
  // 下单所选商品
  checkoutOrder: function () {
    let cartGoods = JSON.parse(JSON.stringify(this.data.cartGoods))
    //获取已选择的商品（包括下架的）
    let justCheckedGoods = cartGoods.filter(el => {
      return el.selected
    });
    let realCheckedGoods = justCheckedGoods.filter(el => {
      return el.goods.status == 1 && el.goods.is_on_sale == 1 && el.goods.sku
    });
    // 如果只选择了下架的商品则提示
    if (realCheckedGoods.length == 0 && justCheckedGoods.length > 0) {
      util.showErrorToast("所选商品已下架")
      return false
    }

    //获取已选择的在售商品
    let checkedGoods = cartGoods.filter(el => {
      return el.selected && el.goods.status == 1 && el.goods.is_on_sale == 1 && el.goods.sku
    });
    let checkGoodsSku = []

    if (checkedGoods.length <= 0) {
      util.showWarnToast("请选择商品")
      return false
    }else {
      for(let i = 0, l = checkedGoods.length; i < l; i++) {
        // 删去不必要的字段, 减小storage的大小
        delete checkedGoods[i].goods.goods_sku
        delete checkedGoods[i].goods.sku_picker
        delete checkedGoods[i].goods.desc_pic_url
        delete checkedGoods[i].goods.swipe_pic_url
        delete checkedGoods[i].goods.goods_desc
        delete checkedGoods[i].goods.promotion_tag
        delete checkedGoods[i].goods.sku.remark

        checkedGoods[i].goods.number = checkedGoods[i].number
        checkGoodsSku.push(checkedGoods[i].goods)
      }
      wx.setStorage({
        key: comConst.checkoutGoods.storageName,
        data: { goods: checkGoodsSku, isFilter: justCheckedGoods.length > checkedGoods.length, source: comConst.checkoutGoods.source.cart},
        success: function() {
          wx.navigateTo({
            url: '../shopping/checkout/checkout'
          })
        }
      })
    }    
  },
  deleteCart: function () {
    //获取已选择的商品
    let checkedGoods = []
    let subtractNum = 0
    this.data.cartGoods.forEach(el => {
      if (el.editSelected == true) {
        checkedGoods.push(el.id)
        subtractNum = subtractNum - el.number
      }
    });

    if (checkedGoods.length <= 0) {
      util.showWarnToast("请先选择商品")
      return false
    }

    
    util.request(api.CartDelete, {
      cartId: checkedGoods
    }, 'POST').then(res => {
      if (res.errno === 0) {
        this._afterDelete(checkedGoods)
        //更新购物车数量
        app.setCartCount(subtractNum)
        this._getCartCount()
        wx.showToast({
          title: '删除成功',
          icon: 'success',
          duration: 1200
        })
      }
    });
  },

  _afterDelete: function(goods) {

    // 删除掉this.data.cartGoods中的数据
    let removeSelectNumber = 0
    let removeEditSelectNumber = 0

    for (var i = 0; i < this.data.cartGoods.length; i++) {
      if (goods.indexOf(this.data.cartGoods[i].id) >= 0) {
        if (this.data.cartGoods[i].editSelected == true){// 肯定true
          removeEditSelectNumber += 1
        }
        if (this.data.cartGoods[i].selected == true) {
          removeSelectNumber += 1
        }
        this.data.cartGoods.splice(i, 1)
        i--
      }
    }

    this.setData({
      cartGoods: this.data.cartGoods
    })
    // 修checked数量
    this.setData({
      selectedCount: this.data.selectedCount - removeSelectNumber <= 0 ? 0 : this.data.selectedCount - removeSelectNumber
    })
  
  this.setData({
    editSelectedCount: this.data.editSelectedCount - removeEditSelectNumber <= 0 ? 0 : this.data.editSelectedCount - removeEditSelectNumber
  })
  },
  stopPop: function(){

  }
})