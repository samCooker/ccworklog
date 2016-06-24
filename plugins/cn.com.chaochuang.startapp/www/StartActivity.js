/**
 * Created by cookie on 2016/6/23.
 */
var exec = require('cordova/exec');
//定义导航对象 与 方法
var startApp = {
    startActivity:function(data, successCallback, errorCallback) {
        exec(successCallback, errorCallback, 'StartActivity', 'startActivity', [data]);
    },
    getIntentData: function (data, successCallback, errorCallback) {
        exec(successCallback, errorCallback, 'StartActivity', 'getIntentData', [data]);
    }
};

module.exports= startApp;