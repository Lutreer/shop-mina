var NewApiRootUrl = 'http://127.0.0.1:8360/api/';

module.exports = {
 shareTitle: '三颗梨',
 sharaPath: '/pages/index/index',

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