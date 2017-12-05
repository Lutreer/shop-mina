/**
 * 商品相关服务
 */

const util = require('../utils/util.js');
const api = require('../config/api.js');

module.exports = {
  getRankingBanner: function (type){
    return new Promise(function (resolve, reject) {
      let bannerApi = api.GoodsRankingBanner + '?type=' + type
      util.request(bannerApi).then(res => {
        if (res.errno === 0) {
          resolve(res.data)
        } else {
          reject('请求失败')
        }
      });
    })
  },
  getRankingGoods: function(type, page, size) {
    return new Promise(function (resolve, reject) {
      let goodsApi = api.GoodsRanking + '?type=' + type + '&page=' + page + '&size=' + size
      util.request(goodsApi).then(res => {
        if (res.errno === 0) {
          resolve(res.data)
        } else {
          reject('请求失败')
        }
      });
    })
  }
};