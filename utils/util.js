var api = require('../config/api.js');

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 封封微信的的request
 */
function request(url, data = {}, method = "GET") {
  return new Promise(function (resolve, reject) {
    wx.request({
      url: url,
      data: data,
      method: method,
      header: {
        'Content-Type': 'application/json',
        'X-Thankni-Token': wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.statusCode == 200) {
          if (res.data.errno == 401) {
            //需要登录后才可以操作
            let code = null;
            return login().then((res) => {
              code = res.code;
              getUserInfo().then((userInfo) => {
                //登录远程服务器, userIfo 需要解密
                request(api.AuthLoginByWeixin, { code: code, userInfo: userInfo }, 'POST').then(res => {
                  if (res.errno === 0) {
                    //存储用户信息
                    wx.setStorageSync('userInfo', res.data.userInfo);
                    wx.setStorageSync('token', res.data.token);
                    // 授权成功，刷新页面
                    const pages = getCurrentPages()
                    const currentPage = pages[pages.length - 1]
                    let url = currentPage.route

                    let searchParam = ""
                    for(let key in currentPage.options){
                      searchParam = key + "=" + currentPage.options[key]
                    }
                    url = searchParam.length > 0 ? (url + "?" + searchParam) : url
                    try{
                      wx.redirectTo({
                        url: "/" + url
                      })
                    } catch(e) {
                      wx.switchTab({
                        url: 'pages/index/index'
                      })
                    }
                    
                  } else {
                    showErrorToast("系统打盹儿了")
                    wx.navigateBack({
                      delta: 1
                    })
                  }
                }).catch((err) => {
                  showErrorToast("系统打盹儿了")
                  wx.navigateBack({
                    delta: 1
                  })
                });
              }).catch(err => {
                showErrorToast("授权失败！")
                setTimeout(function () {
                  wx.navigateBack({
                    delta: 1
                  })
                }, 1500)

              })
            }).catch((err) => {
              showErrorToast("登录失败！")
              wx.navigateBack({
                delta: 1
              })
            })
          } else {
            resolve(res.data);
          }
        } else {
          showErrorToast("系统打盹儿了")
          reject(res.errMsg);
        }

      },
      fail: function (err) {
        showErrorToast("系统打盹儿了")
        reject(err)
      }
    })
  });
}

/**
 * 检查微信会话是否过期
 */
function checkSession() {
  return new Promise(function (resolve, reject) {
    wx.checkSession({
      success: function () {
        resolve(true);
      },
      fail: function () {
        reject(false);
      }
    })
  });
}

/**
 * 调用微信登录
 */
function login() {
  return new Promise(function (resolve, reject) {
    wx.login({
      success: function (res) {
        if (res.code) {
          //返回code后把code给我们的远程服务器，它会拿着appId和secret去调用微信的接口取得用户信息和token
          resolve(res);
        } else {
          reject(res);
        }
      },
      fail: function (err) {
        reject(err);
      }
    });
  });
}

/**
 * 获取用户数据
 * 如果拒绝授权则返回上一页
 * @returns {Promise}
 */
function getUserInfo() {
  return new Promise(function (resolve, reject) {
    wx.getUserInfo({
      withCredentials: true,
      success: function (res) {
        resolve(res);
      },
      fail: function (err) {
        debugger
        wx.showModal({
          title: '提示',
          content: '该页面需要获取您的“用户信息”，请点击确定去设置。',
          success: function (res) {
            let _resolve = resolve,
                _reject = reject;
            if (res.confirm) {
              wx.openSetting({
                success(res) {
                  if (res.authSetting['scope.userInfo']) {
                    getUserInfo().then(rs => {
                      _resolve(rs)
                    }).catch(err => {
                      _reject(err)
                    })
                  }else {
                    debugger
                    _reject(err)
                  }
                }
              })
            } else if (res.cancel) {
              _reject()
            }
          }
        })
      }
    })
  });
}

function redirect(url) {

  //判断页面是否需要登录
  if (false) {
    wx.redirectTo({
      url: '/pages/auth/login/login'
    });
    return false;
  } else {
    wx.redirectTo({
      url: url
    });
  }
}

function showErrorToast(msg, duration=2000, mask=true) {
  wx.showToast({
    title: msg,
    image: '/static/images/cry_face.png',
    mask: mask,
    duration: duration

  })
}
function showWarnToast(msg, duration = 1500, mask = true) {
  wx.showToast({
    title: msg,
    image: '/static/images/question.png',
    mask: mask,
    duration: duration

  })
}
function showInfoToast(msg, duration = 1500, mask = true) {
  wx.showToast({
    title: msg,
    image: '/static/images/info.png',
    mask: mask,
    duration: duration

  })
}
function px2rpx(px, windowWidth) {
  return Math.round(px * 750 / windowWidth);
}

function rpx2px(rpx, windowWidth) {
  return Math.round(rpx / 750 * windowWidth);
}
module.exports = {
  formatTime,
  request,
  redirect,
  showErrorToast,
  showWarnToast,
  showInfoToast,
  checkSession,
  login,
  getUserInfo,
  px2rpx,
  rpx2px
}


