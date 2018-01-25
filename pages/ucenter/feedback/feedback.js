var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');



var app = getApp();

Page({
  data: {
    content:"",
    contact:"",
    typeIndex:0,
    array: ['请选择反馈类型', '商品相关', '物流状况', '客户服务', '优惠活动', '功能异常', '产品建议', '其他'],
  },
  bindPickerChange: function (e) {
    this.setData({
      typeIndex: e.detail.value
    })
  },
  bindinputContent(e){
    this.setData({
      content: e.detail.value
    })
  },
  bindinputContact(e){
    this.setData({
      contact: e.detail.value
    })
  },
  submit() {
    if(this.data.typeIndex == 0){
      util.showWarnToast("请选择类型");
      return false
    }
    if (this.data.content.length < 0) {
      util.showWarnToast("请填写意见");
      return false
    }
    wx.showLoading({
      title: '保存中',
    });
    util.request(api.Feedback, { typeStr: this.data.array[this.data.typeIndex], content: this.data.content, contact: this.data.contact}, 'POST').then(res => {
      wx.hideLoading();
      if (res.errno === 0) {
        wx.showToast({
          title: '感谢您的意见',
          icon: 'success'
        })

        setTimeout(function(){
          wx.navigateBack({
            delta: 1
          })
        }, 1500)
      } else {
        util.showErrorToast('保存失败')
      }
      
    })
  },
  onLoad: function (options) {
  },
  onReady: function () {

  },
  onShow: function () {

  },
  onHide: function () {
    // 页面隐藏

  },
  onUnload: function () {
    // 页面关闭
  }
})