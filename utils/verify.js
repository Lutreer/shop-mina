module.exports = {
  isType: function (obj) {
    return obj && tmsky.isType(obj)
  },
  isUndefined: function (obj) {
    return undefined === obj
  },
  isNull: function (obj) {
    return undefined === obj || null === obj
  },
  // 判断是否为空（undefined/null/空字符） 注意不包含空白字符
  isEmpty: function (str, trim) {
    if (this.isNull(str)) {
      return true
    }
    if (typeof str === 'string') {
      str = trim ? tmsky.string.trim(str) : str
      return str == ''
    }
    //目前只判断undefined、null、string是否为空，其它暂不提供
    return false
  },
  isEmptyObject: function (obj) {
    return this.isNull(obj) || this.isPlanObject(obj)
  },
  isPlanObject: function (obj) {
    if (this.isObject(obj)) {
      var count = 0
      for (name in obj) {
        if (obj.hasOwnProperty(name)) {
          count++
          break
        }
      }
      return count == 0
    } else {
      return false
    }
  },
  isString: function (obj) {
    return obj && typeof obj == "string";
  },
  isObject: function (obj) {
    return obj && tmsky.type(obj) === "object";
  },
  isArray: function (obj) {
    return obj && tmsky.type(obj) === "array";
  },
  isFunction: function (obj) {
    return obj && tmsky.type(obj) === "function";
  },
  isDate: function (obj) {
    return obj && tmsky.type(obj) === 'date'
  },
  isInt: function (str) {
    return /^(-|\+)?\d+$/.test(str);
  },
  isNumber: function (obj) {
    return obj && tmsky.type(obj) === 'number'
  },
  isBoolean: function (obj) {
    return obj && tmsky.type(obj) === 'boolean'
  },
  // 判断是否为正数
  isBigZero: function (str) {
    return /^[1-9][0-9]*$/.test(str);
  },
  isFloatOne: function (str) {
    return /^-?\d+\.?\d{0,1}$/.test(str);
  },
  // 判断是否为负数
  isLessZero: function (str) {
    return /^-\d+$/.test(str);
  },
  // 判断是否为float型数值
  isFloat: function (str) {
    return /^(-?\d+)(\.\d+)?$/.test(str);
  },
  // 判断是否为非负数
  isNoLessZero: function (str) {
    return /^\d+(\.?\d+)?$/.test(str);
  },
  isEmail: function (str) {
    var pattern = /^[a-zA-Z0-9_\-]{1,}@[a-zA-Z0-9_\-]{1,}\.[a-zA-Z0-9_\-.]{1,}$/;
    return pattern.test(str);
  },
  isPhone: function (str) {
    //var reg = /(^[0-9]{3,4}\-[0-9]{3,8}$)|(^[0-9]{3,8}$)|(^\([0-9]{3,4}\)[0-9]{3,8}$)|(^0{0,1}13[0-9]{9}$)/;
    var reg = /^0\d{2,3}-?\d{7,8}$/;
    return reg.test(str);
  },
  isMobile: function (str) {
    var reg = /^(13|14|15|18|17)[0-9]{9}$/;
    return reg.test(str);
  },
  isTel: function (tel) {
    return tmsky.isMobile(tel) || tmsky.isPhone(tel)
  },
  // 是否为中文
  isChinese: function (str) {
    var pattern = /[^\x00-\xff]/g;
    return pattern.test(str);
  },
  isQQ: function (str) {
    return /^\d{5,9}$/.test(str);
  },
  /**
   * 严格验证身份证号码
   * @param o String
   * @returns {*}
   */
  isIDNO: function (o) {
    var info = {
      type: { code: -1, msg: "非法的数据格式" },
      access: { code: 1, msg: "" },
      length: { code: 2, msg: "身份证号码长度或格式错误" },
      area: { code: 3, msg: "身份证号码中的地区非法" },
      birthday: { code: 4, msg: "身份证号码中的出生日期非法" },
      illegal: { code: 5, msg: "身份证号码非法" }
    };
    if (typeof o !== 'string') return info.type
    var aCity = { 11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁", 22: "吉林", 23: "黑龙江", 31: "上海", 32: "江苏", 33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南", 42: "湖北", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 50: "重庆", 51: "四川", 52: "贵州", 53: "云南", 54: "西藏", 61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏", 65: "新疆", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外" }
    var iSum = 0;
    if (!/^\d{17}(\d|x)$/i.test(o)) return info.length;
    o = o.replace(/x$/i, "a");
    if (aCity[parseInt(o.substr(0, 2))] == null) return info.area;
    sBirthday = o.substr(6, 4) + "-" + Number(o.substr(10, 2)) + "-" + Number(o.substr(12, 2));
    var d = new Date(sBirthday.replace(/-/g, "/"));
    if (sBirthday != (d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate())) return info.birthday;
    for (var i = 17; i >= 0; i--) iSum += (Math.pow(2, i) % 11) * parseInt(o.charAt(17 - i), 11);
    if (iSum % 11 != 1) return info.illegal;
    info.access.msg = aCity[parseInt(o.substr(0, 2))] + "," + sBirthday + "," + (o.substr(16, 1) % 2 ? "男" : "女");
    return info.access;
  }
}