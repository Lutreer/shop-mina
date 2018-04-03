var NewApiRootUrl = 'https://www.thankni.com/api/';
// var NewApiRootUrl = 'http://localhost:8360/api/';

module.exports = {
    IndexUrl: NewApiRootUrl + 'index/index', //首页数据接口
    CategoryList: NewApiRootUrl + 'category/index',  //分类目录全部分类数据接口
    CategoryCurrent: NewApiRootUrl + 'category/current',  //分类目录当前分类数据接口

    AuthLoginByWeixin: NewApiRootUrl + 'auth/loginByWeixin', //微信登录

    GoodsCount: NewApiRootUrl + 'goods/count',  //统计商品总数
    GoodsList: NewApiRootUrl + 'goods/list',  //获得商品列表
    GoodsCategory: NewApiRootUrl + 'goods/category',  //获得分类数据
    GoodsDetail: NewApiRootUrl + 'goods/detail',  //获得商品的详情
    GoodsRankingBanner: NewApiRootUrl + 'goods/rankingBanner',  //新品1、热门2
    GoodsRanking: NewApiRootUrl + 'goods/ranking',  //新品1、热门2

    BrandList: NewApiRootUrl + 'brand/list',  //品牌列表
    BrandDetail: NewApiRootUrl + 'brand/detail',  //品牌详情

    CartList: NewApiRootUrl + 'cart/index', //获取购物车的数据
    CartAdd: NewApiRootUrl + 'cart/add', // 添加商品到购物车
    CartUpdate: NewApiRootUrl + 'cart/update', // 更新购物车的商品
    CartDelete: NewApiRootUrl + 'cart/delete', // 删除购物车的商品
    // CartGoodsCount: NewApiRootUrl + 'cart/goodscount', // 获取购物车商品件数
    CartCheckout: NewApiRootUrl + 'cart/checkout', // 下单前信息确认, 并不会去后台请求商品数据，只是返回app的配置信息，收货地址，微信运动相关的数据。商品数据由localStorage传送

    OrderSubmit: NewApiRootUrl + 'order/submit', // 提交订单
    OrderPayClientSuccess: NewApiRootUrl + 'pay/orderPayClientSuccess',
    Prepay: NewApiRootUrl + 'pay/prepay', //获取微信统一下单prepay_id

    // CommentList: NewApiRootUrl + 'comment/list',  //评论列表
    // CommentCount: NewApiRootUrl + 'comment/count',  //评论总数
    // CommentPost: NewApiRootUrl + 'comment/post',   //发表评论

    TopicList: NewApiRootUrl + 'topic/list',  //专题列表
    TopicDetail: NewApiRootUrl + 'topic/detail',  //专题详情
    // TopicRelated: NewApiRootUrl + 'topic/related',  //相关专题

    SearchIndex: NewApiRootUrl + 'search/index',  //搜索页面数据
    SearchResult: NewApiRootUrl + 'search/result',  //搜索数据
    // SearchHelper: NewApiRootUrl + 'search/helper',  //搜索帮助
    // SearchClearHistory: NewApiRootUrl + 'search/clearhistory',  //搜索帮助

    AddressList: NewApiRootUrl + 'address/list',  //收货地址列表
    AddressDetail: NewApiRootUrl + 'address/detail',  //收货地址详情
    AddressSave: NewApiRootUrl + 'address/save',  //保存收货地址
    AddressDelete: NewApiRootUrl + 'address/delete',  //保存收货地址
    AddressDefault: NewApiRootUrl + 'address/default',  //获取默认收货地址
    AddressCollege: NewApiRootUrl + 'address/college',  //获取学校列表

    RegionList: NewApiRootUrl + 'region/list',  //获取区域列表

    OrderList: NewApiRootUrl + 'order/list',  //订单列表
    OrderDetail: NewApiRootUrl + 'order/detail',  //订单详情
    OrderCancel: NewApiRootUrl + 'order/cancel',  //取消订单
    OrderDel: NewApiRootUrl + 'order/delete',  //取消订单
    OrderConfirm: NewApiRootUrl + 'order/confirmReceive',  //取消订单

    PushWerun: NewApiRootUrl + 'werun/push', //上传个人步数
    GetWerunList: NewApiRootUrl + 'werun/werunList', // 微步排行
    UpdateWerunInfo: NewApiRootUrl + 'werun/updateWerunInfo', // 更新
    WerunToPraise: NewApiRootUrl + 'werun/praiseOthers', // 点赞

    Feedback: NewApiRootUrl + 'feedback/add', // 点赞
    Kefu: NewApiRootUrl + 'app_config/kefu', // 客服
};