/**
 * 收货地址相关服务
 */

const util = require('../utils/util.js');
const api = require('../config/api.js');
const comConst = require('../config/common.js')

module.exports = {
  setAllAdress2Storage: function (userId) {
    return new Promise((resolve, reject) => {
      util.request(api.AddressList).then(function (res) {
        if (res.errno === 0) {
          wx.setStorageSync(comConst.address.allStorageName, res.data)
        }
      });
    })
  }
};