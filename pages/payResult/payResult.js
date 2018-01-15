var app = getApp();

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
    debugger
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
    util.request(api.Prepay, { orderId: this.data.orderId}, 'POST').then(res => {
      if (res.errno === 0) {
        this.setData({
          status: 1,
          time:5
        })
        let temp = setInterval(() => {
          this.setData({
            time: this.data.time - 1
          })
          if (this.data.time <= 0) {
            clearInterval(temp)
            wx.switchTab({
              url: '/pages/index/index'
            })
          }
        }, 1000)

      }else{
        let msg = res.errmsg

        wx.showModal({
          title: '提示',
          content: msg,
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
             
            }
          }
        })
      }
    })
  }
})