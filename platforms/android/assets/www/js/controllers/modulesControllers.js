/**
 * Created by Cookie on 2016/3/27.
 */
(function () {
    appModule
        .controller('worklogHomeController', WorklogHomeController)
        .controller('worklogHomeOtherController', WorklogHomeOtherController)
        .controller('worklogListController', WorklogListController)
        .controller('worklogEditController', WorklogEditController)
        .controller('worklogSettingController', WorklogSettingController)
        .controller('worklogHelpController', WorklogHelpController)
        .factory('worklogFac', worklogFactory)
    ;

    /**
     * 工作日志父类控制器
     * @constructor
     */
    function WorklogHomeController($scope, $ionicModal, $rootScope, $state, commonHttp, tipMsg, dbTool,appConfig){
        $scope.loginData = {};
        $rootScope.isLogin = false;//是否登录
        $scope.worklogLogin = worklogLoginFun;//登录日志系统
        $scope.worklogLogout = worklogLogoutFun;//登出日志系统
        $scope.exitApp = exitAppFun;//退出app
        $scope.toSettingPage = toSettingPageFun;//跳转至常用设置
        $scope.toHelpPage = toHelpPageFun;
        $scope.userSetting = {};//用户设置信息
        $scope.validateCodeUrl = appConfig.getCcWorkLogUrl()+'login/validateCode?_t=0';


        // 创建一个登录对话框
        $ionicModal.fromTemplateUrl('templates/common/models/worklog-login.html', {
            scope: $scope, //继承自父scope
            animation: 'slide-in-up' //弹出动画
        }).then(function (modal) {
            //登录对话框对象
            $scope.worklogLoginModal = modal;
            initWorklogUser().then(function () {
                //$scope.worklogLoginModal.show();
            }).catch(function (error) {
                tipMsg.showMsg(error);
                //$scope.worklogLoginModal.show();
            });
        });

        //获取本地存储的用户数据
        function initWorklogUser() {
            return dbTool.getWorklogUser().then(function (data) {
                $scope.loginData.account = data.account;
                $scope.loginData.password = data.password;
                if (data.pushFlag === undefined) {
                    data.pushFlag = true;//默认为true
                }
                $scope.pushFlag = data.pushFlag;//是否接受推送信息
                pushFlagFun();
                return true;
            });
        }

        //开启或关闭推送
        function pushFlagFun() {
            if (window.plugins && window.plugins.jPushPlugin) {
                if ($scope.pushFlag) {
                    window.plugins.jPushPlugin.resumePush();
                } else {
                    window.plugins.jPushPlugin.stopPush();
                }
            }
            //保存
            dbTool.getWorklogUser().then(function (data) {
                data.pushFlag = $scope.pushFlag || false;
                dbTool.putWorklogUser(data);
            });
        }

        $scope.pushFlagBtnClk = function () {
            $scope.pushFlag = !$scope.pushFlag;
            pushFlagFun();
        };

        //日志系统登录
        function worklogLoginFun() {
            if(!beforeLogin()){
                return;
            }
            tipMsg.loading().show();//显示加载框
            commonHttp.workLogPost('common/login', $scope.loginData).then(function (data) {
                //含有我的工作日志url
                if (data.indexOf(appConfig.getCcWorkLogUrl()+'oa/workDaily/myDaily') != -1) {
                    $rootScope.isLogin = true;
                    $scope.worklogLoginModal.hide();
                    $rootScope.$broadcast('worklog.refreshworklog');
                } else if (data.indexOf('账号或密码不正确') != -1) {
                    tipMsg.showMsg('账号或密码不正确');
                } else if (data.indexOf('验证码不正确！') != -1) {
                    tipMsg.showMsg('验证码不正确！');
                } else {
                    tipMsg.showMsg('未知错误。');
                }
            }).catch(function (error) {
                tipMsg.showMsg('登录出现了错误。');
                //worklogLogoutFun();
            }).finally(function () {
                dbTool.putWorklogUser($scope.loginData);
                tipMsg.loading().hide();//显示加载框
            });
        }

        function beforeLogin(){
            if(!$scope.loginData.account){
                tipMsg.showMsg('请输入用户名。');
                return false;
            }
            if(!$scope.loginData.password){
                tipMsg.showMsg('请输入密码。');
                return false;
            }
            if(!$scope.loginData.code){
                tipMsg.showMsg('请输入验证码。');
                return false;
            }
            return true;
        }

        //日志系统登出
        function worklogLogoutFun() {
            commonHttp.workLogGet('common/logout').then(function (data) {
                //console.log(data);
                tipMsg.showMsg('退出成功\\(^o^)/YES!');
            }).catch(function (error) {
                tipMsg.showMsg('退出成功\\(^o^)/YES!');
            }).finally(function () {
                $rootScope.isLogin = false;
            });
        }

        //退出app
        function exitAppFun() {
            ionic.Platform.exitApp();//退出app
        }

        //跳转至常用设置
        function toSettingPageFun() {
            dbTool.getWorklogSetting().then(function (data) {
                $scope.userSetting.projectsData = data.projectsData || {};
                $scope.userSetting.favoriteWords = data.favoriteWords || {};
                $state.go("worklog.setting");
            }).catch(function (error) {
                tipMsg.showMsg(error);
            });
        }

        function toHelpPageFun() {
            $state.go("help");
        }

        //验证码
        $scope.getValidateCode = function () {
            console.log('change');
            $scope.validateCodeUrl = appConfig.getCcWorkLogUrl()+'login/validateCode?_t=' + new Date().getTime();
        };

    }

    /**
     * 暂时无用
     * 工作日志父类控制器（从其他app进入该页面，不弹出登录对话框，直接在后台登录。）
     * @constructor
     * @
     */
    function WorklogHomeOtherController($scope, $ionicModal, $rootScope, $state, commonHttp, tipMsg, dbTool,appConfig) {
        $scope.loginData = {};
        $rootScope.isLogin = false;//是否登录
        $scope.worklogLogin = worklogLoginFun;//登录日志系统
        $scope.worklogLogout = worklogLogoutFun;//登出日志系统
        $scope.exitApp = exitAppFun;//退出app
        $scope.toSettingPage = toSettingPageFun;//跳转至常用设置
        $scope.toHelpPage = toHelpPageFun;
        $scope.userSetting = {};//用户设置信息
        $scope.validateCodeUrl = appConfig.getCcWorkLogUrl()+'login/validateCode';

        // 创建一个登录对话框
        $ionicModal.fromTemplateUrl('templates/common/models/worklog-login.html', {
            scope: $scope, //继承自父scope
            animation: 'slide-in-up' //弹出动画
        }).then(function (modal) {
            //登录对话框对象
            $scope.worklogLoginModal = modal;
            initWorklogParams().then(function () {
                //获取用户信息
                window.plugins.startApp.getIntentData(null, function (result) {
                    $scope.loginData.account = result.userName;
                    $scope.loginData.password = result.password;
                    worklogLoginFun();
                }, function (error) {
                    tipMsg.showMsg(error);
                });
            }).catch(function (error) {
                tipMsg.showMsg(error);
            });
        });

        //获取存储的用户设置参数数据
        function initWorklogParams() {
            return dbTool.getWorklogUser().then(function (data) {
                if (data.pushFlag === undefined) {
                    data.pushFlag = true;//默认为true
                }
                $scope.pushFlag = data.pushFlag;//是否接受推送信息
                pushFlagFun();
                return true;
            });
        }

        //开启或关闭推送
        function pushFlagFun() {
            if (window.plugins && window.plugins.jPushPlugin) {
                if ($scope.pushFlag) {
                    window.plugins.jPushPlugin.resumePush();
                } else {
                    window.plugins.jPushPlugin.stopPush();
                }
            }
            //保存
            dbTool.getWorklogUser().then(function (data) {
                data.pushFlag = $scope.pushFlag || false;
                dbTool.putWorklogUser(data);
            });
        }

        $scope.pushFlagBtnClk = function () {
            $scope.pushFlag = !$scope.pushFlag;
            pushFlagFun();
        };

        //验证码
        $scope.getValidateCode = function () {
            $scope.validateCodeUrl = appConfig.getCcWorkLogUrl()+'login/validateCode?_t=' + new Date().getTime();
        };

        //日志系统登录
        function worklogLoginFun() {
            tipMsg.loading().show();//显示加载框
            commonHttp.workLogPost('common/login', $scope.loginData).then(function (data) {
                if (data.indexOf('../workdaily/myDaily.do') != -1) {
                    $rootScope.isLogin = true;
                    $scope.worklogLoginModal.hide();
                    $rootScope.$broadcast('worklog.refreshworklog');
                } else if (data.indexOf('验证码不正确！') != -1) {
                    tipMsg.showMsg('验证码不正确！');
                } else if (data.indexOf('用户名或密码错误') != -1) {
                    tipMsg.showMsg('用户名或密码错误');
                } else {
                    tipMsg.showMsg('未知错误。');
                    worklogLogoutFun();
                }
            }).catch(function (error) {
                tipMsg.showMsg('登录出现了错误。');
                logoutFun();
            }).finally(function () {
                dbTool.putWorklogUser($scope.loginData);
                tipMsg.loading().hide();//显示加载框
            });
        }

        //日志系统登出
        function worklogLogoutFun() {
            commonHttp.workLogGet('common/logout.do').then(function (data) {
                //tipMsg.showMsg(data);
            }).catch(function (error) {
                tipMsg.showMsg('退出成功\\(^o^)/YES!');
            }).finally(function () {
                $rootScope.isLogin = false;
            });
        }

        //退出app
        function exitAppFun() {
            ionic.Platform.exitApp();//退出app
        }

        //跳转至常用设置
        function toSettingPageFun() {
            dbTool.getWorklogSetting().then(function (data) {
                $scope.userSetting.projectsData = data.projectsData || {};
                $scope.userSetting.favoriteWords = data.favoriteWords || {};
                $state.go("worklog.setting");
            }).catch(function (error) {
                tipMsg.showMsg(error);
            });
        }

        function toHelpPageFun() {
            $state.go("help");
        }

    }


    /**
     * 工作日志列表控制器
     * */
    function WorklogListController($scope, $rootScope, $filter, $state, $ionicActionSheet, worklogFac, commonHttp, tipMsg, tools, dbTool) {
        $scope.chooseWorkDate = chooseWorkDateFun;//选择一个日期新增日志
        $scope.isLoadEnd = false;//是否已经加载完成
        $scope.editItem = editItemFun;//编辑
        $scope.detailItem = detailItemFun;//详情
        $scope.deleteItem = deleteItemFun;//删除
        $scope.worklogList = [];
        $scope.submitData = {};
        $scope.searchData = {};
        //记录查询日期
        $scope.dateTime = new Date();
        var evaSelfTransfer = {'一般':1, '满意':2, '非常满意':3, '不满意':4};
        var workTypeTransfer = {'项目':1, '学习':2, '请假':7, '其他':9};
        //var limitDate = new Date('2016-02-01');//最多只能获取limitDate时间之后的列表数据


        //接收刷新列表的广播
        $rootScope.$on('worklog.refreshworklog', function (event, data) {
            $scope.doRefresh();
        });

        //下拉刷新(旧)
        //function doRefreshFun() {
        //    //获取当前周的星期一日期
        //    if (getFirstDayOfWeek(true)) {
        //        commonHttp.workLogGet('oa/workDaily/myDaily?day=' + $scope.searchData.day).then(function (data) {
        //            if (data && data.length) {
        //                $scope.worklogList = resolveHtmlData(data);
        //            } else {
        //                tipMsg.showMsg('没获取到数据(╥╯^╰╥)');
        //            }
        //        }).catch(function (error) {
        //            tipMsg.showMsg(error);
        //        }).finally(function () {
        //            $scope.$broadcast('scroll.refreshComplete');//广播下拉完成事件，否则图标不消失
        //            $scope.isLoadEnd = false;
        //        });
        //    }
        //}

        //刷新列表
        $scope.doRefresh = function () {
            //清空列表
            $scope.worklogList = [];
            //分页获取数据
            worklogFac.getWorklogList(true, $scope.searchData).then(function (result) {
                console.log(result);
                if (result && result.rows && result.rows.length > 0) {
                    $scope.worklogList = result.rows;
                } else {
                    tipMsg.showMsg('没有数据。')
                }
            }).catch(function (error) {
                console.log(error);
            }).finally(function () {
                //广播下拉完成事件，否则图标不消失
                $scope.$broadcast('scroll.refreshComplete');
                //数据是否全部加载
                $scope.isLoadEnd = false;
            });
        };

        //加载列表
        $scope.loadMore = function () {
            worklogFac.getWorklogList(false,$scope.searchData).then(function (result) {
                console.log(result);
                if (result && result.rows && result.rows.length > 0) {
                    $scope.worklogList = $scope.worklogList.concat(result.rows);
                } else {
                    //数据已经全部加载完成
                    $scope.isLoadEnd = true;
                    if ($scope.worklogList.length > 10) {
                        tipMsg.showMsg('没有更多数据了。', null, 'bottom');
                    }
                }
            }).catch(function (error) {
                console.log(error);
                //出现异常时，为防止不断加载数据，设置为true
                $scope.isLoadEnd = true;
            }).finally(function () {
                //广播上拉完成事件，否则图标不消失
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        };

        //获取查询日期
        //function getFirstDayOfWeek(isCurrent) {
        //    if (isCurrent) {
        //        //获取当前周的星期一日期
        //        var currentDate = new Date();
        //        var _dayInterval = currentDate.getDay() == 0 ? 6 : currentDate.getDay() - 1;
        //        var _timemill = currentDate.getTime() - _dayInterval * 24 * 60 * 60 * 1000;
        //        var firstDateOfWeek = new Date(_timemill);
        //        //返回 yyyy-MM-dd 格式日期
        //        $scope.searchData.day = firstDateOfWeek.getFullYear() + '-' + (firstDateOfWeek.getMonth() + 1) + '-' + firstDateOfWeek.getDate();
        //        $scope.dateTime = firstDateOfWeek;
        //        return true;
        //    } else {
        //        // 获取查询日期的上一个星期一日期
        //        if (!$scope.searchData.day) {
        //            $scope.isLoadEnd = true;
        //            $scope.$broadcast('scroll.infiniteScrollComplete');
        //            return false;
        //        }
        //        if (!/^\d{4}-\d{1}|\d{2}-\d{2}/.test($scope.searchData.day)) {
        //            tipMsg.showMsg('日期获取异常');
        //            $scope.isLoadEnd = true;
        //            $scope.$broadcast('scroll.infiniteScrollComplete');
        //            return false;
        //        }
        //        var _lastSearchDate = $scope.dateTime.getTime();
        //        var _searchDay = new Date(_lastSearchDate - 7 * 24 * 60 * 60 * 1000);
        //        //最多只能查询limitDate之后的数据
        //        if (_searchDay < limitDate) {
        //            tipMsg.showMsg('你不能再获取更多的数据了=_=||');
        //            $scope.isLoadEnd = true;
        //            return false;
        //        }
        //        $scope.searchData.day = _searchDay.getFullYear() + '-' + (_searchDay.getMonth() + 1) + '-' + _searchDay.getDate();
        //        return true;
        //    }
        //}

        //上拉加载(旧)
        //function loadMoreFun() {
        //    if (getFirstDayOfWeek(false)) {//获取查询日期
        //        commonHttp.workLogGet('oa/workDaily/myDaily?day=' + $scope.searchData.day).then(function (data) {
        //            var _list = resolveHtmlData(data);
        //            if (_list && _list.length) {
        //                $scope.worklogList = $scope.worklogList.concat(_list);
        //            } else {
        //                tipMsg.showMsg('没有更多的数据了=_=||');
        //            }
        //        }).catch(function (error) {
        //            $scope.isLoadEnd = true;
        //            tipMsg.showMsg(error);
        //        }).finally(function () {
        //            $scope.$broadcast('scroll.infiniteScrollComplete');//广播上拉完成事件，否则图标不消失
        //        });
        //    }
        //}

        //解析工作日志的html数据
        //function resolveHtmlData(htmlData) {
        //    var itemList = [];
        //    var htmlArr = htmlData.split('openMyDailyEdit(\'');
        //    angular.forEach(htmlArr, function (item) {
        //        if (/^\d{4}-\d{2}-\d{2}/.test(item) && /【\d.\d】/.test(item)) {
        //            var _date = item.substring(0, item.indexOf('\')">'));
        //            var _arr = item.split(/【/);
        //            for (var i = 1; i < _arr.length; i++) {
        //                var _workLog = {date: _date, index: i - 1};
        //                _workLog.item = '【' + _arr[i].substring(0, _arr[i].indexOf('</div>'));
        //                //图标样式
        //                _workLog.iconColorCls = 'calm';
        //                var _day = new Date(_date).getDay();
        //                if (angular.isNumber(_day))
        //                    _workLog.dayClassName = 'ss-icon-num' + _day;
        //                itemList.push(_workLog);
        //            }
        //        }
        //    });
        //    itemList = itemList.reverse();
        //    return itemList;
        //}

        //解析新建工作日志时返回的html数据
        //function resolveReturnData(htmlData) {
        //    var returnData = {};
        //    var _hd_dailyId = 'name="dailyId"';
        //    var _hd_userId = 'name="userId"';
        //    var _value = 'value="';
        //    var _arr = htmlData.split('<input');
        //    angular.forEach(_arr, function (value) {
        //        if (value.indexOf(_hd_dailyId) != -1) {
        //            var _sp_dailyId = value.split(_value)[1];
        //            returnData.dailyId = _sp_dailyId.substring(0, _sp_dailyId.indexOf('"'));
        //        } else if (value.indexOf(_hd_userId) != -1) {
        //            var _sp_userId = value.split(_value)[1];
        //            returnData.userId = _sp_userId.substring(0, _sp_userId.indexOf('"'));
        //        }
        //    });
        //    return returnData;
        //}

        //选择填写工作日志的日期
        function chooseWorkDateFun() {
            $scope.submitData = {};
            //日期选择,返回promise
            tools.dataPicker({
                androidTheme: 2
            }).then(function (date) {
                if (date === false) {
                    //没有日期控件，需手动输入一个日期
                    inputDateManually();
                } else {
                    tipMsg.loading().show();//显示加载框
                    $scope.submitData.workDateShow = $filter('date')(date, 'yyyy-MM-dd');
                    return commonHttp.workLogGet('oa/workDailyDetail/list?day=' + $scope.submitData.workDateShow).then(function (htmlData) {
                        var _idStr = htmlData.match(/\/list.json\?dailyId=\d+&uid=\d+/);
                        console.log(_idStr);
                        if (_idStr && _idStr.length > 0) {
                            var _dailyId = _idStr[0].match(/dailyId=\d+/);
                            var dailyId = _dailyId[0].split("=")[1];
                            initAndEditWorklog(dailyId);
                        } else {
                            tipMsg.showMsg('不能编辑╮(╯▽╰)╭');
                        }
                    }).catch(function (error) {
                        tipMsg.showMsg(error);
                    }).finally(function () {
                        tipMsg.loading().hide();
                    });
                }
            }).catch(function (error) {
                tipMsg.showMsg(error);
                return false;
            });
        }

        //手动输入一个日期
        function inputDateManually() {
            var defDate = $filter('date')(new Date(), 'yyyy-MM-dd');
            return tipMsg.inputMsg($scope, defDate, '输入一个日期(yyyy-MM-dd)').then(function (workDate) {
                console.log(workDate);
                tipMsg.loading().show();//显示加载框
                if (/\d{4}-\d{2}-\d{2}/.test(workDate)) {
                    commonHttp.workLogGet('oa/workDailyDetail/list?day=' + workDate).then(function (htmlData) {
                        var _idStr = htmlData.match(/\/list.json\?dailyId=\d+&uid=\d+/);
                        console.log(_idStr);
                        if (_idStr && _idStr.length > 0) {
                            var _dailyId = _idStr[0].match(/dailyId=\d+/);
                            var dailyId = _dailyId[0].split("=")[1];
                            $scope.submitData.workDateShow=workDate;
                            initAndEditWorklog(dailyId);
                        } else {
                            tipMsg.showMsg('不能编辑╮(╯▽╰)╭');
                        }
                    }).catch(function (error) {
                        tipMsg.showMsg(error);
                    }).finally(function () {
                        tipMsg.loading().hide();
                    });
                } else if (workDate !== false) {
                    tipMsg.showMsg('请输入指定格式的日期');
                }else{
                    tipMsg.loading().hide();
                }
            });
        }

        // 初始化日志数据
        function initAndEditWorklog(dailyId) {
            dbTool.getWorklogData().then(function (doc) {
                console.log(doc);
                if (doc.useHours && angular.isNumber(doc.useHours)) {
                    $scope.submitData.useHours = doc.useHours >= 4 ? 3.5 : 4;
                } else {
                    $scope.submitData.useHours = 4;
                }
                $scope.submitData.workType = doc.workType || 1;
                //$scope.submitData.content=doc.content;
                $scope.submitData.project = doc.project;
                $scope.submitData.prjName = doc.prjName;
                $scope.submitData.evaSelf = doc.evaSelf || 1;
                $scope.submitData.workDaily = dailyId;
                commonHttp.setSubmitData($scope.submitData);
                $state.go('worklog.edit', null, {reload: true});
            });
        }

        //编辑日志
        function editItemFun(item) {
            tipMsg.loading().show();//显示加载框
            $scope.submitData = {};
            commonHttp.workLogGet('oa/workDailyDetail/edit?id=' + item.id).then(function (result) {
                var _workDaily = result.match(/<input name="workDaily" type="hidden" id="workDaily" value="\d+">/);
                console.log(_workDaily);
                var workDaily = _workDaily[0].substring(_workDaily[0].indexOf('value="')+'value="'.length,_workDaily[0].lastIndexOf('"'));
                console.log(workDaily);
                $scope.submitData.id=item.id;
                $scope.submitData.workDaily=workDaily;
                $scope.submitData.workType=workTypeTransfer[item.workType]||1;
                $scope.submitData.evaSelf=evaSelfTransfer[item.evaSelf]||1;
                $scope.submitData.project = item.prjNo;
                $scope.submitData.prjName = item.prjName;
                $scope.submitData.useHours = item.useHours;
                $scope.submitData.content = item.content;
                $scope.submitData.workDateShow = item.workDateShow;
                commonHttp.setSubmitData($scope.submitData);
                $state.go('worklog.edit', null, {reload: true});
            }).catch(function (error) {
                tipMsg.showMsg('出错了╮(╯▽╰)╭');
            }).finally(function () {
                tipMsg.loading().hide();
            });
        }

        //详情
        function detailItemFun(worklog) {
            //tipMsg.alertMsg('<div class="text-center">'+worklog.date+'</div>'+worklog.item,'详情');
            worklog.iconColorCls = true;
            $ionicActionSheet.show({
                buttons: [
                    {text: '<b class="text-center">编辑</b>'},
                    {text: '<b class="text-center">删除</b>'}
                ],
                cancelText: '取消',
                cancel: function () {
                    worklog.iconColorCls = false;
                },
                titleText: '<div class="text-center">' + worklog.workDateShow + ' 工作详情' + '</div>' + '<p class="text-left"><span>['+worklog.useHours+']&nbsp;&nbsp;</span>' + worklog.content + '</p>',
                buttonClicked: function (index) {
                    switch (index) {
                        case 0:
                            editItemFun(worklog);
                            break;
                        case 1:
                            deleteItemFun(worklog);
                            break;
                        default :
                            console.log(index);
                    }
                    worklog.iconColorCls = false;
                    return true;
                }
            });
        }

        //删除日志
        function deleteItemFun(item) {
            tipMsg.confirm().then(function (res) {
                if (res) {
                    tipMsg.loading().show();//显示加载框
                    commonHttp.workLogGet('oa/workDailyDetail/del.json?ids=' + item.id).then(function (htmlData) {
                        console.log(htmlData);
                        if(htmlData.success){
                            tipMsg.showMsg(htmlData.success);
                        }else{
                            tipMsg.showMsg('删除失败╮(╯▽╰)╭');
                        }
                        $scope.doRefresh();
                    }).catch(function (error) {
                        tipMsg.showMsg('不能删除╮(╯▽╰)╭');
                    }).finally(function () {
                        tipMsg.loading().hide();
                    });
                }
            });
        }

        //获取列表。若无数据则说明没有登录
        worklogFac.getWorklogList(false,$scope.searchData).then(function (result) {
            if (result && result.rows && result.rows.length > 0) {
                $rootScope.isLogin = true;//是否登录
                $scope.worklogList = result.rows;
            } else {
                tipMsg.showMsg('请先登录。');
                $scope.worklogLoginModal.show();
            }
        });

    }

    /**
     * 工作日志填写编辑控制器
     * @constructor
     */
    function WorklogEditController($scope, $ionicHistory, $rootScope, $ionicModal, $ionicScrollDelegate, $state, tipMsg, commonHttp, dbTool) {
        $scope.evaSelfArr = {1: '一般', 2: '满意', 3: '非常满意', 4: '不满意'};//显示评价详情
        $scope.submitWorkLog = submitWorkLogFun;// 提交日志
        $scope.submitData = commonHttp.getSubmitData();//获取日志数据
        $scope.evaSelfName = $scope.evaSelfArr[$scope.submitData.evaSelf];
        $scope.favoriteProjects = [];

        //提交日志
        function submitWorkLogFun() {
            tipMsg.loading().show();//显示加载框
            if (!checkWorkLogBefore()) {
                tipMsg.loading().hide();
                return;
            }
            console.log($scope.submitData);
            commonHttp.workLogPost('oa/workDailyDetail/save.json', $scope.submitData).then(function (data) {
                if (data.message) {
                    tipMsg.showMsg(data.message);
                }
                //本地保存最近一次的提交
                dbTool.putWorklogData($scope.submitData);
                //将工作内容保存入常用词条
                dbTool.getFavoriteWords().then(function (data) {
                    data.favoriteWords['content'] = $scope.submitData.content;
                    dbTool.putWorklogSetting(data);
                });

                $ionicHistory.goBack();
                $rootScope.$broadcast('worklog.refreshworklog');
            }).catch(function (error) {
                console.log(error);
            }).finally(function () {
                tipMsg.loading().hide();//加载框
            });
        }

        // true : 可以提交  false不符合条件
        function checkWorkLogBefore() {
            if (!$scope.submitData.content || $scope.submitData.content.length < 20) {
                tipMsg.showMsg('内容需超过20个字符。');
                return false;
            }
            if (!$scope.submitData.project || !$scope.submitData.prjName) {
                tipMsg.showMsg('没有选择项目。');
                return false;
            }
            return true;
        }

        //-------------选择项目---------------
        // 创建一个选择项目弹出窗模板
        $ionicModal.fromTemplateUrl('templates/common/models/worklog-favorite-prj.html', {
            scope: $scope, //继承自父scope
            animation: 'slide-in-up' //弹出动画
        }).then(function (modal) {
            $scope.worklogFavoritePrjModal = modal;
        });
        //项目弹出窗
        $scope.selectFavoriteProject = function () {
            dbTool.getWorklogSetting().then(function (data) {
                $scope.projectsSelfData = data.projectsData;
                $scope.worklogFavoritePrjModal.show();
            }).catch(function (error) {
                tipMsg.alertMsg(error);
            });
        };
        //添加更多常用项目
        $scope.addMoreProjects = function () {
            $scope.worklogFavoritePrjModal.hide();
            $state.go("worklog.setting");
        };
        //选择项目完成
        $scope.chooseProjectBringBack = function (prjNo) {
            $scope.submitData.project = prjNo;
            $scope.submitData.prjName = $scope.projectsSelfData[prjNo];
            $scope.worklogFavoritePrjModal.hide();
        };
        //刷新常用项目列表
        $scope.doRefreshFavoritePrjList = function () {
            dbTool.getWorklogSetting().then(function (data) {
                $scope.projectsSelfData = data.projectsData;
                $scope.$broadcast('scroll.refreshComplete');//广播下拉完成事件，否则图标不消失
            }).catch(function (error) {
                tipMsg.alertMsg(error);
                $scope.$broadcast('scroll.refreshComplete');//广播下拉完成事件，否则图标不消失
            });
        };

        $scope.contentOffsetTo = function () {
            if (window.cordova && window.cordova.plugins.Keyboard.show) {
                $ionicScrollDelegate.scrollTo(0, 50, true);
            }
        };

        //-------------选择项目 end------------

        //-------------常用词条---------------
        // 创建一个选择词条弹出窗模板
        $ionicModal.fromTemplateUrl('templates/common/models/worklog-words.html', {
            scope: $scope, //继承自父scope
            animation: 'slide-in-up' //弹出动画
        }).then(function (modal) {
            $scope.worklogWordsModal = modal;
        });
        //选择常用用语
        $scope.selectFavoriteWords = function () {
            dbTool.getFavoriteWords().then(function (data) {
                $scope.favoriteWordsList = data.favoriteWords;
            });
            $scope.worklogWordsModal.show();
        };
        //刷新常用用语列表
        $scope.doRefreshFavoriteWordsList = function () {
            dbTool.getFavoriteWords().then(function (data) {
                $scope.favoriteWordsList = data.favoriteWords;
                $scope.$broadcast('scroll.refreshComplete');//广播下拉完成事件，否则图标不消失
            }).catch(function (error) {
                tipMsg.alertMsg(error);
                $scope.$broadcast('scroll.refreshComplete');//广播下拉完成事件，否则图标不消失
            });
        };
        $scope.chooseFavoriteWord = function (data) {
            data = data.trim();
            $scope.submitData.content = $scope.submitData.content ? $scope.submitData.content + data : data;
            $scope.worklogWordsModal.hide();
        };
        //-------------常用词条 end------------
    }

    /**
     * 工作日志常用设置控制器
     */
    function WorklogSettingController($scope, $ionicModal, worklogFac, tipMsg, dbTool) {
        //-----------常用项目设置--------------
        //查询条件
        $scope.searchPrjsParams = {pageNum: 1, numPerPage: 20, prjName: ''};
        //项目列表数据
        $scope.projectsData = [];
        //弹出选择项目对话框
        $scope.selectFavoriteProject = function () {
            $scope.worklogProjectsModal.show();
            $scope.doRefreshProjects();
        };
        //选择项目
        $scope.chooseProject = function (project) {
            if (project.isSelect) {
                //添加
                $scope.userSetting.projectsData[project.prjNo] = project.prjName;
            } else {
                //删除
                delete $scope.userSetting.projectsData[project.prjNo];
            }
        };
        //删除已选的项目
        $scope.deleteSelectedPrj = function (prjId) {
            //删除
            delete $scope.userSetting.projectsData[prjId];
            saveUserSetting();
        };
        //保存工作日志数据
        $scope.saveWorklogSetting = function () {
            dbTool.putWorklogSetting($scope.userSetting).then(function (data) {
                if (data) {
                    tipMsg.showMsg("保存成功\\(^o^)/");
                } else {
                    tipMsg.showMsg("保存出现了问题(⊙ˍ⊙)");
                }
                $scope.worklogProjectsModal.hide()
            });
        };
        // 创建一个选择项目弹出窗模板
        $ionicModal.fromTemplateUrl('templates/common/models/worklog-projects.html', {
            scope: $scope, //继承自父scope
            animation: 'slide-in-up' //弹出动画
        }).then(function (modal) {
            $scope.worklogProjectsModal = modal;
        });
        //刷新项目列表
        //$scope.doRefreshProjects = function () {
        //    $scope.projectsData = [];
        //    $scope.searchPrjsParams.pageNum = 1;
        //    commonHttp.getProjectsList(true, $scope.searchPrjsParams).then(function (result) {
        //
        //    }).catch(function (error) {
        //        tipMsg.showMsg(error);
        //    }).finally(function () {
        //        $scope.$broadcast('scroll.refreshComplete');//广播下拉完成事件，否则图标不消失
        //        $scope.isProjectsLoadEnd = false;
        //    });
        //};
        //刷新列表
        $scope.doRefreshProjects = function () {
            //清空列表
            $scope.projectsData = [];
            //分页获取数据
            worklogFac.getProjectsList(true,$scope.searchPrjsParams).then(function (result) {
                console.log(result);
                if (result && result.rows && result.rows.length > 0) {
                    $scope.projectsData = result.rows;
                } else {
                    tipMsg.showMsg('没有数据。')
                }
            }).catch(function (error) {
                console.log(error);
            }).finally(function () {
                //广播下拉完成事件，否则图标不消失
                $scope.$broadcast('scroll.refreshComplete');
                //数据是否全部加载
                $scope.isProjectsLoadEnd = false;
            });
        };
        //加载项目数据
        //$scope.loadMoreProjects = function () {
        //    $scope.searchPrjsParams.pageNum++;
        //    commonHttp.workLogPost('project/projectSelect.do', $scope.searchPrjsParams).then(function (htmlData) {
        //        var _arr = resolveProjectsHtmlData(htmlData);
        //        if ($scope.totalPrjs <= $scope.projectsData.length) {
        //            //加载结束
        //            $scope.isProjectsLoadEnd = true;
        //        } else {
        //            $scope.projectsData = $scope.projectsData.concat(_arr);
        //        }
        //    }).catch(function (error) {
        //        tipMsg.showMsg(error);
        //        $scope.isProjectsLoadEnd = true;
        //    }).finally(function () {
        //        $scope.$broadcast('scroll.infiniteScrollComplete');//广播下拉完成事件，否则图标不消失
        //    });
        //};
        //加载列表
        $scope.loadMoreProjects = function () {
            worklogFac.getProjectsList(false,$scope.searchPrjsParams).then(function (result) {
                console.log(result);
                if (result && result.rows && result.rows.length > 0) {
                    $scope.projectsData = $scope.projectsData.concat(result.rows);
                } else {
                    //数据已经全部加载完成
                    $scope.isProjectsLoadEnd = true;
                    if ($scope.projectsData.length > 10) {
                        tipMsg.showMsg('没有更多数据了。', null, 'bottom');
                    }
                }
            }).catch(function (error) {
                console.log(error);
                //出现异常时，为防止不断加载数据，设置为true
                $scope.isProjectsLoadEnd = true;
            }).finally(function () {
                //广播上拉完成事件，否则图标不消失
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        };
        //解析返回的项目数据
        function resolveProjectsHtmlData(htmlData) {
            var _prjList = [];
            if (!htmlData) {
                tipMsg.showMsg('无数据');
                return;
            }
            if (htmlData.indexOf('重定向到登录页') != -1) {
                //加载结束
                tipMsg.showMsg('你没有登录(～￣(OO)￣)ブ');
                $scope.isProjectsLoadEnd = true;
                return;
            }
            var _id = "{id:'";
            var _name = "name:'";
            var _totalI = 'totalCount="';
            var _total = htmlData.match(/totalCount="\d+"/)[0];
            $scope.totalPrjs = _total.substring(_total.indexOf(_totalI) + _totalI.length, _total.lastIndexOf('"'));
            var _arr = htmlData.match(/jQuery\.bringBack.{10,50}\}\)/g);
            for (var i = 0; i < _arr.length; i++) {
                var _obj = {};
                _obj.id = _arr[i].substring(_arr[i].indexOf(_id) + _id.length, _arr[i].indexOf("',"));
                _obj.name = _arr[i].substring(_arr[i].indexOf(_name) + _name.length, _arr[i].indexOf("'}"));
                if (isInSelectedProjects(_obj.id)) {
                    _obj.isSelect = true;
                }
                _prjList.push(_obj);
            }
            return _prjList;
        }

        //判断项目是否在常用项目列表中
        function isInSelectedProjects(prjId) {
            if ($scope.userSetting.projectsData) {
                var _prjData = $scope.userSetting.projectsData;
                for (var _item in _prjData) {
                    if (_prjData.hasOwnProperty(_item)) {
                        if (_item == prjId && _prjData[_item]) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        //-----------常用项目设置 end-----------

        //-----------常用词汇设置--------------
        $scope.inputModel = {wordDetail: ''};
        // 保存常用词汇
        $scope.saveFavoriteWord = function () {
            if ($scope.inputModel.wordDetail) {
                var _time = new Date().getTime();
                $scope.userSetting.favoriteWords[_time] = $scope.inputModel.wordDetail;
                saveUserSetting();
            } else {
                tipMsg.showMsg('请输入词条详情');
            }
            $scope.inputModel.wordDetail = '';
        };

        // 删除常用词汇
        $scope.deleteFavoriteWord = function (wordId) {
            delete $scope.userSetting.favoriteWords[wordId];
            saveUserSetting();
        };
        //-----------常用词汇设置end-----------

        //保存用户设置
        function saveUserSetting() {
            dbTool.putWorklogSetting($scope.userSetting).then(function (data) {
                if (data) {
                    tipMsg.showMsg("操作成功\\(^o^)/");
                } else {
                    tipMsg.showMsg("操作出现了问题(⊙ˍ⊙)");
                }
            });
        }
    }

    /**
     * 帮助控制器
     */
    function WorklogHelpController($scope) {
        $scope.helpImgageItems = [
            {title: '', src: 'img/help/help-login.jpg'},
            {title: '', src: 'img/help/help-setting.jpg'},
            {title: '', src: 'img/help/help-setting-prj.jpg'},
            {title: '', src: 'img/help/help-add.jpg'},
            {title: '', src: 'img/help/help-add-detail.jpg'}
        ];
    }

    function worklogFactory(commonHttp) {
        var _page = 1;
        var _prj= 1;
        return {
            getWorklogList: getWorklogListFun,
            getProjectsList:getProjectsListFun
        };

        function getWorklogListFun(isNew, submitData) {
            if (!submitData) {
                submitData = {
                    rows: 20
                }
            }
            if (!submitData.rows) {
                submitData.rows = 20;
            }
            if (isNew) {
                _page = 1;
            } else {
                _page++;
            }
            submitData.page = _page;
            return commonHttp.workLogPost('oa/workDailyDetail/querylist.json', submitData);
        }

        function getProjectsListFun(isNew, submitData) {
            if (!submitData) {
                submitData = {
                    rows: 20
                }
            }
            if (!submitData.rows) {
                submitData.rows = 20;
            }
            if (isNew) {
                _prj = 1;
            } else {
                _prj++;
            }
            submitData.page = _prj;
            return commonHttp.workLogPost('oa/workDaily/select/project.json', submitData);
        }
    }
})();
