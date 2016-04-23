/**
 * Created by Administrator on 2015/11/30.
 *
 *  ionic.js 没有使用 AngularJS内置的 ng-route 模块，
 *  而是选择了 AngularUI 项目 的 ui-router 模块。
 *  ui-router 的核心理念是将子视图集合抽象为一个状态机，
 *  导航意味着 状态 的切换。在不同的状态下， ionic.js 渲染对应的子视图（动态加载的 HTML 片段）
 *  就实现了路由导航的功能。
 *
 *  ionic.bundle.js 已经打包了 ui-route 模块， 所以使用时不需要单独引入。
 */

appModule.config(function($stateProvider, $urlRouterProvider){

$stateProvider
    //工作日志
    .state('worklog',{
        url:'/worklog',
        abstract:true,
        controller:'worklogHomeController',
        templateUrl:'templates/modules/worklog.html'
    })
    .state('worklog.list',{
        url:'/list',
        views:{
           'worklogcontent':{
               controller:'worklogListController',
               templateUrl:'templates/modules/worklog-list.html'
           }
        }
    })
    .state('worklog.edit',{
        url:'/edit',
        views:{
            'worklogcontent':{
                controller:'worklogEditController',
                params:{id:null},//定义需要传递的值，使用 $state.go('',{id:''})可传递
                templateUrl:'templates/modules/worklog-edit.html'
            }
        }
    })
    .state('worklog.favoriteprj',{
        url:'/favoriteprj',
        views:{
            'worklogcontent':{
                controller:'worklogFavoritePrjController',
                templateUrl:'templates/modules/worklog-favorite-prj.html'
            }
        }
    })
    .state('worklog.setting',{
        url:'/setting',
        views:{
            'worklogsetting':{
                controller:'worklogSettingController',
                templateUrl:'templates/modules/worklog-setting.html'
            }
        }
    })
    ;
    $urlRouterProvider.otherwise('/worklog/list');//找不到对应url的默认设置
});