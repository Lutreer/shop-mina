var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
const common = require('../../../config/common.js');
Page({
  data:{
    orderList: [],
    page: 0,
    size: 8,
    totalPages: 0
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.getOrderList();
    wx.removeStorageSync('page_order_relunch_data')
  },
  onPullDownRefresh: function () {
    this.setData({
      page: 0,
      size: 8,
      totalPages: 0
    })
    this.getOrderList();
  },
  onReachBottom() {
    if (this.data.totalPages > this.data.page) {
      this.getOrderList();
    } else {
      return false;
    }
  },
  getOrderList(){
    wx.showLoading()
    let that = this;
    util.request(api.OrderList, { page: that.data.page, size: that.data.size }).then(function (res) {
      if (res.errno === 0) {
        that.setData({
          orderList: that.data.page > 0 ? that.data.orderList.concat(res.data.data) : res.data.data,
          totalPages: res.data.totalPages,
          page: that.data.page + 1
        });
      }else{
        util.showErrorToast('获取失败')
      }
      wx.stopPullDownRefresh()
      wx.hideLoading()
    });
  },
  payOrder(){
    wx.redirectTo({
      url: '/pages/pay/pay',
    })
  },
  cancelOrder(e){
    wx.showModal({
      content: '确认取消该订单吗',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '取消中',
          })
          let order = this.data.orderList[e.currentTarget.dataset.orderIndex]
          if (order.order_status != 5) return false
          util.request(api.OrderCancel, { id: order.id }).then(res => {
            if (res.errno === 0) {
              let statusStr = 'orderList[' + e.currentTarget.dataset.orderIndex + '].order_status'
              let statusTextStr = 'orderList[' + e.currentTarget.dataset.orderIndex + '].order_status_text'
              this.setData({
                [statusStr]: 2,
                [statusTextStr]: '已取消'
              });
              wx.hideLoading()
            } else {
              util.showErrorToast('无法取消')
            }
          })
        } 
      }
    })
    
  },
  delOrder(e) {
    wx.showModal({
      content: '确认删除该订单吗',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中',
          })
          let index = e.currentTarget.dataset.orderIndex
          let order = this.data.orderList[index]
          if (!(order.order_status == 1 || order.order_status == 2)) return false
          util.request(api.OrderDel, { id: order.id }).then(res => {
            wx.hideLoading()
            if (res.errno === 0) {
              this.data.orderList.splice(index, 1)
              this.setData({
                orderList: this.data.orderList
              })
            } else {
              util.showErrorToast('删除失败')
            }
          })
        }
      }
    })
  },
  orderDetail(e){
    let order = this.data.orderList[e.currentTarget.dataset.orderIndex]
    wx.navigateTo({
      url: '/pages/ucenter/orderDetail/orderDetail?id=' + order.id,
    })
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    var value = wx.getStorageSync('page_order_relunch_data')
    if (value){
      this.setData({
        page: 0,
        size: 8,
        totalPages: 0
      })
      this.getOrderList();
    }
    wx.removeStorageSync('page_order_relunch_data')
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})