var NewApiRootUrl = 'http://127.0.0.1:8360/api/';

module.exports = {
  appName: '丫米',
  shareTitle_a: '丫米，郑州高校学生的品牌果园',
  shareTitle_b: '丫米，属于大学生的品牌',
  sharaPath: '/pages/index/index',
  bottomSlogen_a:"V1.0.1    丫米技术",

 localStorage:{
   historyKeyword: 'historyKeyword'
 },

 rankingType: {
   newGoods: 1,
   hotGoods: 2
 },
 checkoutGoods: {
   source: {
     cart: 1,
     goodDetail: 2
   },
   storageName: 'checked_goods'
 },
 address: {
   allStorageName: 'all_address',
   selectedStorageName: 'selected_address'
 },
 addAddressFrom: {
   shopping:'shopping',
   ucenter: 'ucenter'
 }
};