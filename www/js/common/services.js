/**
 * Created by Administrator on 2015/11/30.
 */

(function() {
    appModule
        .factory('tipMsg', TipMsgFun) //信息提示
        .factory('tools', ToolsFun) //各工具方法
        .factory('dbTool', DbToolFun) //本地存储
        .factory('commonHttp',CommonHttpFun)
    ;

    /**
     * 各种消息提示框
     * @param $ionicPopup
     * @returns {*}
     * @constructor
     */
    function TipMsgFun($ionicPopup,$ionicLoading) {
        Fac = {
            showMsg: showMsgFun, //Toast提示框
            alertMsg: alertMsgFun, //带确定按钮的提示框
            inputMsg: inputMsgFun, //自定义的可输入信息的对话框
            confirm: confirmFun, //确定对话框
            loading:loadingFun //加载蒙层
        };

        /**
         * Toast提示框
         * @param msg 显示的信息
         * @param duration 持续时间('short','long')默认short
         * @param position 显示位置('top', 'center', 'bottom'),默认center
         */
        function showMsgFun(msg, duration, position) {
            var _duration = duration || 'short';
            var _position = position || 'center';
            if (window.plugins && window.plugins.toast) {
                //有toast插件
                window.plugins.toast.show(msg, _duration, _position);
            } else {
                //无toast插件显示提示框
                alertMsgFun(msg);
            }
        }

        /**
         * 带确定按钮的提示框 title:提示框标题 btnText:按钮的文字
         * @param msg
         * @param title
         * @param btnText
         */
        function alertMsgFun(msg, title, btnText) {
            var alertPopup = $ionicPopup.alert({
                title: title || '提示信息', // String. 弹窗的标题。
                subTitle: '', // String (可选)。弹窗的子标题。
                template: msg, // String (可选)。放在弹窗body内的html模板。
                okText: btnText || '确定' // String (默认: 'OK')。OK按钮的文字。
                    //templateUrl: '', // String (可选)。 放在弹窗body内的html模板的URL。
                    //okType: '' // String (默认: 'button-positive')。OK按钮的类型。
            });
            alertPopup.then(function(res) {
                //点击确定后
            });
        }

        /**
         * 可输入信息的对话框
         * @param $scope
         * @param title
         * @param defval
         * @param subTitle
         * @returns {*}
         */
        function inputMsgFun($scope,defval,title, subTitle) {
            $scope._popData = {text:defval}; //需要预先定义一个弹出窗数据接收对象
            return $ionicPopup.show({
                template: '<input type="text" ng-model="_popData.text">',
                title: title || '请输入内容',
                subTitle: subTitle || '',
                scope: $scope, //弹出窗的scope继承自父页面，可以访问父页面数据
                buttons: [
                    {
                        text: '取消',
                        type: 'button-positive',
                        onTap: function (e) {
                            return false;
                        }
                    },
                    {
                        text: '<b>确定</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                            //不允许用户关闭 e.preventDefault();
                            return $scope._popData.text;
                        }
                    }
                ]
            });
        }

        /**
         * 带有确定、取消的对话框
         * @param msg
         * @param title
         * @returns {*} 对话框对象
         */
        function confirmFun(msg, title) {
            return $ionicPopup.confirm({
                okText: '确定',
                cancelText: '取消',
                title: title || '确认操作',
                template: msg
            });
        }

        /**
         * 加载蒙层
         */
        function loadingFun() {
            return {
                show: function () {
                    $ionicLoading.show({
                        templateUrl: 'templates/common/models/loading.html'
                    });
                },
                hide: function () {
                    $ionicLoading.hide();
                }
            }
        }
        return Fac;
    }

    /**
     * 各工具方法
     * @param $q
     * @returns {*}
     * @constructor
     */
    function ToolsFun($q) {

        return {
            dataPicker: dataPickerFun, //日期控件
            checkEmail: checkEmailFun, //判断电子邮件格式是否正确
            checkConnection:checkConnectionFun,
            isInArray:isInArrayFun
        };

        /**
         * 日期控件(success:选择成功后的回调函数,[options:选择参数])
         * date : ,//初始日期
         * mode : 'date',
         * minDate: ,//能选择的最小日期
         * maxDate: ,//能选择的最大日期
         * cancelText: ,
         * okText: ,
         * todayText: '',
         * nowText: '',
         * is24Hour: false,
         * //android日期选择主题样式:THEME_TRADITIONAL | THEME_HOLO_DARK | THEME_HOLO_LIGHT | THEME_DEVICE_DEFAULT_DARK | THEME_DEVICE_DEFAULT_LIGHT
         * androidTheme: window.plugins.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
         * */
        function dataPickerFun(options) {
            var defer = $q.defer();
            if (window.plugins && window.plugins.datePicker) {
                var opts = options || {};
                opts.date = opts.date || new Date();
                window.plugins.datePicker.show(
                    opts,
                    function(returnDate) {
                        console.log(returnDate);
                        if(returnDate){
                            defer.resolve(returnDate);
                        }else{
                            defer.reject("没有选择日期");
                        }
                    },
                    function(error) {
                        console.log(error);
                        //取消事件
                        defer.reject("取消");
                    }
                );
            } else {
                defer.resolve(false);
            }
            return defer.promise;
        }

        /**
         * 使用正则表达式判断电子邮件格式是否正确
         */
        function checkEmailFun(email) {
            return /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/.test(email);
        }

        /**
         * 判断数组是否包含某个元素
         */
        function isInArrayFun(list,element) {
            if(angular.isArray(list)){
                for(var i=0;i<list.length;i++){
                    if(list[i]===element){
                        return true;
                    }
                }
            }
            return false;
        }

        /**
         * 查看网络连接状况
         *
         * @return {isConn: 'true网络连接正常  false无连接',type:''}
         *
         */
        function checkConnectionFun() {
            if(navigator&&navigator.connection) {
                //网络连接状况
                var _netStates = {};
                _netStates[Connection.UNKNOWN] = '未知网络';
                _netStates[Connection.ETHERNET] = '以太网';
                _netStates[Connection.WIFI] = 'WiFi网络';
                _netStates[Connection.CELL_2G] = '2G网络';
                _netStates[Connection.CELL_3G] = '3G网络';
                _netStates[Connection.CELL_4G] = '4G网络';
                _netStates[Connection.CELL] = '通用连接';
                _netStates[Connection.NONE] = '无网络连接';
                var networkState = navigator.connection.type;
                var _isConn=Connection.NONE != networkState;
                return {isConn:_isConn,type:_netStates[networkState]};
            }
            return {isConn:true,type:'无法检测网络连接'};
        }

    }

    /**
     * 本地存储
     * @param tipMsg
     * @returns {*}
     * @constructor
     */
    function DbToolFun(tipMsg,$q) {
        var Fac = {
            initWebSqlDb: initWebSqlDbFun,
            putFdData: putFdDataFun,
            postOrUpdate: postOrUpdateFun,
            findFdData: findFdDataFun,
            getAllFdData: getAllFdDataFun,
            rmFdData: removeFdDataFun,
            getAllDocs: getAllDocsFun,
            getDb: getDbFun,
            getFavoriteWords:getFavoriteWordsFun,
            getWorklogUser:getWorklogUserFun,
            putWorklogUser:putWorklogUserFun,
            putWorklogSetting:putWorklogSettingFun,
            getWorklogSetting:getWorklogSettingFun,
            putWorklogData: putWorklogDataFun,
            getWorklogData:getWorklogDataFun
        };

        var _db;
        var _fdId = 'fodoItem';
        var _worklogUserId = 'worklogUserId';
        var _worklogSettingId = 'worklogSettingId';
        var _curUser = {};
        var _worklogId = 'worklogId';

        /**
         * 创建一个本地存储数据库
         * @param dbname 数据库名称
         */
        function initWebSqlDbFun(dbname) {
            _db = new PouchDB(dbname, { adapter: 'websql' });

            _db.createIndex({
                index: {
                    fields: ['_id'],//对字段建立索引
                    name:'search-id-index'
                }
            }).catch(function (err) {
                console.log('创建失败。'+err);
            });
        }

        /**
         * 保存数据，_id指定
         * @param data 数据对象
         * @returns {*}
         */
        function putFdDataFun(data) {
            data._id = _fdId + data.title; //指定id
            return _db.put(data).then(function(result) {
                tipMsg.showMsg('保存成功。');
                return result;
            }).catch(function(err) {
                tipMsg.showMsg('保存失败。');
                console.log(err);
            });
        }

        /**
         * 根据_id查找doc
         * @param id
         * @param fields 指定返回的字段，若为空则返回所有
         * @returns {*}
         */
        function findDataByIdFun(id,fields) {
            return _db.find({
                selector: { _id: { $eq: id } },
                fields: fields
            }).then(function(data) {
                if (data.docs && data.docs.length > 0) {
                    return data.docs[0];
                }
                return {};
            });
        }

        /**
         * 保存一条数据，有_id则进行更新操作，否则新增
         * @param data
         * @returns {*}
         */
        function postOrUpdateFun(data) {
            if (data._id) {
                return _db.get(data._id).then(function(doc) {
                    doc.title = data.title;
                    doc.content = data.content;
                    return _db.put(doc).then(function(result) {
                        tipMsg.showMsg('修改成功。');
                        return result;
                    }).catch(function(err) {
                        tipMsg.showMsg('修改失败。');
                    });
                });
            } else {
                return _db.post(data).then(function(result) {
                    tipMsg.showMsg('保存成功。');
                    return result;
                }).catch(function(err) {
                    tipMsg.showMsg('保存失败。');
                });
            }
        }

        /**
         * 根据title查找doc
         * @param title
         * @returns {*}
         */
        function findFdDataFun(title) {
            return _db.find({
                selector: { title: { $eq: title } },
                fields: ['_id', 'title', 'content', 'img']
            }).then(function(data) {
                var itemList = [];
                if (data.docs && data.docs.length > 0) {
                    data.docs.forEach(function(doc) {
                        if (doc.title) {
                            itemList.push(doc);
                        }
                    });
                }
                return itemList;
            });
        }

        /**
         * 获取所有doc数据
         * @returns {*}
         */
        function getAllDocsFun() {
            return _db.allDocs({ include_docs: true });
        }

        /**
         * 获取所有含有title的doc
         * @returns {*}
         */
        function getAllFdDataFun() {
            var data = [];
            return _db.allDocs({ include_docs: true }).then(function(result) {
                if (result.rows && result.rows.length > 0) {
                    result.rows.forEach(function(row) {
                        if (row.doc && row.doc.title) {
                            data.push(row.doc);
                        }
                    });
                }
                return data;
            });
        }

        /**
         * 删除指定的doc
         * @param item
         */
        function removeFdDataFun(item) {
            return _db.remove(item);
        }

        /**
         * 获取创建的数据库
         * @returns _db 在应用启动时创建，见app.js
         */
        function getDbFun() {
            return _db;
        }


        /**
         * 保存最近一次的工作日志信息数据，_id指定
         * @param data 数据对象
         * @returns {*}
         */
        function putWorklogDataFun(data) {
            findDataByIdFun(_worklogId).then(function (result) {
                if(result._id){
                    result.useHours=data.useHours;
                    result.workType=data.workType;
                    result.prjNo=data.prjNo;
                    result.prjName=data.prjName;
                    result.content=data.content;
                    result.evaSelf=data.evaSelf;
                    _db.put(result);
                }else{
                    data._id = _worklogId; //指定id
                    _db.put(data);
                }
            }).catch(function (error) {
                tipMsg.showMsg(error);
            });
        }

        /**
         * 获取保存在本地的工作日志信息数据
         * @returns {*}
         */
        function getWorklogDataFun() {
            return findDataByIdFun(_worklogId,['_id','useHours', 'workType', 'prjNo', 'prjName','content','evaSelf']);
        }

        /**
         * 获取工作日志登陆用户信息
         */
        function getWorklogUserFun() {
            if(_curUser.account){
              var delay = $q.defer();
              delay.resolve(_curUser);
              return delay.promise;
            }
            return findDataByIdFun(_worklogUserId,['_id','account','password','pushFlag']).then(function (data) {
              _curUser=data;
              return data;
            });
        }

        /**
         * 保存工作日志登陆用户信息
         */
        function putWorklogUserFun(data) {
            findDataByIdFun(_worklogUserId).then(function (result) {
                if(result._id){
                    angular.extend(result,data);
                    _db.put(result);
                    _curUser = data;//将当前用户保存到公用的对象中，方便程序在其他地方调用
                }else{
                    data._id = _worklogUserId; //指定id
                    _db.put(data);
                }
            }).catch(function (error) {
                tipMsg.showMsg(error);
                _curUser = {};
            });
        }

        /**
         * 保存工作日志常用设置
         */
        function putWorklogSettingFun(data) {
            return findDataByIdFun(_worklogSettingId).then(function (result) {
                if(result._id){
                    angular.extend(result,data);
                    _db.put(result);
                }else{
                    data._id = _worklogSettingId; //指定id
                    _db.put(data);
                }
                return true;
            }).catch(function (error) {
                tipMsg.showMsg(error);
            });
        }

        /**
         * 获取工作日志常用设置
         */
        function getWorklogSettingFun() {
            return findDataByIdFun(_worklogSettingId,['_id','projectsData','favoriteWords']);
        }

        /**
         * 获取常用词条
         */
        function getFavoriteWordsFun() {
            return findDataByIdFun(_worklogSettingId,['_id','favoriteWords']);
        }

        return Fac;
    }

    /**
     * 对http请求的一个封装，可设置请求json数据方便调试
     */
    function CommonHttpFun($q, $http,$httpParamSerializer, appConfig, tipMsg,tools) {

        var _data={};//可在多个controller中传递的数据对象

        return {
            jsonPost: jsonPostFun,
            formPost: formPostFun,
            workLogPost:workLogPostFun,
            workLogGet:workLogGetFun,
            httpGet:httpGetFun,
            getSubmitData:getSubmitDataFun,//获取数据，在多个controller中传递
            setSubmitData:setSubmitDataFun//设置数据
        };

        /**
         * 发送json数据的post请求
         *
         * 本地调试：获取的是common.json文件的数据，其中key为对应的http请求相对路径 value为模拟后台返回的值
         *
         * @param url 相对路径
         * @param jsonData
         * @returns {*}
         */
        function jsonPostFun(url, jsonData) {
            var delay = $q.defer();
            if (appConfig.getLocalDebug()) {
                //本地调试
                $http.get(appConfig.getLocalHost()).success(function (data) {
                    delay.resolve(data[url]);
                }).error(function (error) {
                    console.log(error);
                    delay.reject('获取数据失败。');
                });
            } else {
                //在线
                var _conn = tools.checkConnection();
                if(_conn.isConn) {//检测网络连接
                    $http.post(appConfig.getHost() + url, jsonData).success(function (data) {
                        delay.resolve(data);
                    }).error(function (error) {
                        console.log(error);
                        delay.reject('服务器连接失败。');
                    });
                }else{
                    delay.reject(_conn.type);
                }
            }
            return delay.promise;
        }

        /**
         *  发送非json格式的post请求,使用$httpParamSerializer数据将转换成 param1=a&param2=b的形式。（详情可查看angularjs源码中$httpParamSerializer的定义）
         *
         *  本地调试：获取的是common.json文件的数据，其中key为对应的http请求相对路径 value为模拟后台返回的值
         *
         * @param url 相对路径
         * @param formData 表单数据
         */
        function formPostFun(url, formData) {
            var delay = $q.defer();
            var req = {
                method: 'POST',
                url: appConfig.getHost() + url,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: $httpParamSerializer(formData)
            };
            if (appConfig.getLocalDebug()) {
                //本地调试
                $http(req).success(function (data) {
                    delay.resolve(data[url]);
                }).error(function (error) {
                    console.log(error);
                    delay.reject('服务器连接失败。');
                });
            } else {
                //在线
                var _conn = tools.checkConnection();
                if(_conn.isConn) {//检测网络连接
                    $http(req).success(function (data) {
                        delay.resolve(data);
                    }).error(function (error) {
                        console.log(error);
                        delay.reject('服务器连接失败。');
                    });
                }else{
                    delay.reject(_conn.type);
                }
            }

            return delay.promise;
        }

        /**
         * http get 请求
         *
         * 本地调试：获取的是common.json文件的数据，其中key为对应的http请求相对路径 value为模拟后台返回的值
         * @param url 相对路径
         * @returns {*}
         */
        function httpGetFun(url) {
            var delay = $q.defer();
            if (appConfig.getLocalDebug()) {
                //本地调试
                $http.get(appConfig.getLocalHost()).success(function (data) {
                    delay.resolve(data[url]);
                }).error(function (error) {
                    console.log(error);
                    delay.reject('获取数据失败。');
                });
            } else {
                //在线
                var _conn = tools.checkConnection();
                if(_conn.isConn) {//检测网络连接
                    $http.get(appConfig.getHost() + url).success(function (data) {
                        delay.resolve(data);
                    }).error(function (error) {
                        console.log(error);
                        delay.reject('服务器连接失败。');
                    });
                }else{
                    delay.reject(_conn.type);
                }
            }
            return delay.promise;
        }

        /**
         * 工作日志系统登录 post
         */
        function workLogPostFun(url,postData) {
            var delay = $q.defer();
            var req = {
                method: 'POST',
                url: 'http://116.10.203.202:7070/ccoa/'+url,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                cache:false,
                data: $httpParamSerializer(postData)
            };
            var _conn = tools.checkConnection();
            if(_conn.isConn) {//检测网络连接
                $http(req).success(function (data) {
                    if (typeof(data) == 'string' && data.indexOf('重定向到登录页') != -1) {
                        delay.reject('你没有登录(～￣(OO)￣)ブ');
                    } else {
                        delay.resolve(data);
                    }
                }).error(function (error) {
                    console.log(error);
                    delay.reject(error);
                });
            }else{
                console.log(_conn.type);
                delay.reject(_conn.type);
            }
            return delay.promise;
        }

        /**
         * 工作日志系统登录 get
         */
        function workLogGetFun(url) {
            var _time=new Date().getTime();
            if(url.indexOf('?')!=-1){
                url=url+'&_='+_time;
            }else{
                url=url+'?_='+_time;
            }
            var delay = $q.defer();
            var req = {
                method: 'GET',
                url: 'http://116.10.203.202:7070/ccoa/'+url,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                cache:false
            };
            var _conn = tools.checkConnection();
            if(_conn.isConn) {//检测网络连接
                $http(req).success(function (data) {
                    if (typeof(data) == 'string' && data.indexOf('重定向到登录页') != -1) {
                        delay.reject('你没有登录(～￣(OO)￣)ブ');
                    } else {
                        delay.resolve(data);
                    }
                }).error(function (error) {
                    console.log(error);
                    delay.reject(error);
                });
            }else{
                delay.reject(_conn.type);
            }
            return delay.promise;
        }

        /**
         * 获取数据，在多个controller中传递
         */
        function getSubmitDataFun() {
            return _data;
        }

        function setSubmitDataFun(data) {
            _data=data;
        }
    }
})();
