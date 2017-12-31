var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var user = require('../../../services/user.js');
var app = getApp();
Page({
  data: {
    pushTryTimes: 0,// 上传步数失败的次数，暂时在失败一次后清除登录信息再尝试一次。
    remarkEdit:false,
    remarkEditFacus:false,
    winHeight: "",//窗口高度
    currentTab: 1, //预设当前项的值
    isSwichNav: false,
    werunList: [],
    myWerun:{},
    appConfig:{},
    totalPages:0,
    page:0,
    size:100
  },
  // 滚动切换标签样式
  switchTab: function (e) {
    if(this.data.isSwichNav) {
      this.setData({
        isSwichNav: false
      })
      return false
    }else{
      this.setData({
        currentTab: e.detail.current
      });
      this.switchLoadData(e.detail.current)
    }
    
  },
  // 点击标题切换当前页时改变样式
  swichNav: function (e) {

    var cur = e.target.dataset.current;
    if (this.data.currentTab == cur) { return false; }
    else {
      this.setData({
         currentTab: cur,
         isSwichNav: true
      })
      this.switchLoadData(e.target.dataset.current)
    }
  },
  switchLoadData: function(tabIndex) {
    if (tabIndex == 0) {
      this.getWerunList('yesterday')
    } else {
      this.pushWerun()
    }
  },
  /**
     * 生命周期函数--监听页面显示
     */
  onShow: function () {
    // this.pushWerun()
    app.login(() => {
      this.pushWerun()
    })
   
  },
  pushWerun: function () {
    wx.showLoading({
      title: '更新步数',
    });
    let that = this
    // 获取用户步数并上传，然后获取排行
    wx.getWeRunData({
      success(res) {
        util.request(api.PushWerun, { encryptedData: res }, 'POST').then(res => {
          wx.hideLoading();
          if (res.errno === 0) {
            // 上传自己的步数后获取步数排行
            that.getWerunList()
          } else {
            if (that.data.pushTryTimes < 1){
              that.setData({
                pushTryTimes: 1
              })
              // 删掉登录信息后重试
              wx.removeStorageSync('userInfo')
              wx.removeStorageSync('token')
              wx.redirectTo({
                url: '/pages/ucenter/werun/werun?pushTryTimes=1'
              })
            }else{
              util.showErrorToast('上传步数失败') // 可尝试清除缓存后重试
              setTimeout(function () {
                wx.switchTab({
                  url: '/pages/ucenter/index/index'
                })
              }, 1500)
            }
          }
        })
      },
      fail(e) {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: '该页面需要获取您的“微信步数”，请点击确定去设置。',
          success: function (res) {
            wx.openSetting({
              success(res) {
                if (res.authSetting['scope.werun']) {
                  getWeRun()
                } else {
                  wx.navigateBack({
                    delta: -1
                  })
                }
              }
            })
          },
          fail: function () {
            wx.navigateBack({
              delta: -1
            })
          }
        })
      }
    })
  },
  getWerunList: function (date) {
    let dateType = date || 'today'
    wx.showLoading({
      title: '加载排行',
    });
    util.request(api.GetWerunList, { date: dateType }).then(res => {
      if (res.errno === 0) {
        this.setData({
          myWerun: res.data.myRun,
          werunList: res.data.werunList.data,
          appConfig: res.data.appConfig,
          totalPages: res.data.werunList.totalPages,
          page: this.data.page + 1
        });
      } else {
        util.showErrorToast('获取排行失败')
        setTimeout(function () {
          wx.navigateBack({
            delta: -1
          })
        }, 1500)
      }
      wx.hideLoading();
    })
  },
  onLoad: function (options) {
    this.setData({
      pushTryTimes: options.pushTryTimes || 0
    })
    //  高度自适应
    wx.getSystemInfo({
      success: res => {
        var clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          rpxR = 750 / clientWidth;
        var calc = clientHeight * rpxR-65;
        console.log(calc)
        this.setData({
          winHeight: calc
        });
      }
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.hideLoading();
  },
  goEditRemark: function() {
    wx.navigateTo({
      url: '/pages/ucenter/werunRemarkEdit/werunRemarkEdit?remark=' + this.data.myWerun.remark + '&id=' + this.data.myWerun.id
    })
  },
  // more>>  一些提示和攻略
  goToTips: function() {
    wx.navigateTo({
      url: '/pages/ucenter/werunTips/werunTips'
    })
  },
  praiseOthers: function(e) {
    wx.showLoading({
      title: '拼命点赞ing',
    });
    if (this.data.myWerun.praise_times >= this.data.appConfig.werun_praise_limit){
      util.showErrorToast('每天最多赞' + this.data.appConfig.werun_praise_limit + '次哦' )
      return false
    }
    let id = e.currentTarget.dataset.id
    let index = e.currentTarget.dataset.index * 1
    util.request(api.WerunToPraise, { id: id }, "POST").then(res => {
      if (res.errno === 0) {
        debugger
        this.setData({
          'myWerun.praise_times': this.data.myWerun.praise_times + 1
        })
        const otherKey = 'werunList[' + index + '].praise'
        const praise = this.data.werunList[index].praise + 1
        this.setData({
          [otherKey]: praise
        })
        if(id == this.data.myWerun.id){
          this.setData({
            'myWerun.praise': this.data.myWerun.praise + 1
          })
        }

      } else {
        util.showErrorToast(res.errmsg || '点赞失败')
        
      }
    })
    wx.hideLoading()
  }
})