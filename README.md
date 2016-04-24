# ccworklog

# 运行打包
  #安装npm、cordova和ionic，详情可查看http://ionicframework.com/getting-started/

#部分插件说明
  1.Toast插件
  
    cordova plugin add cordova-plugin-x-toast
    详情查看：https://github.com/EddyVerbruggen/Toast-PhoneGap-Plugin

  2.PouchDB 本地存储插件
  
    PouchDB是操作SQLite数据库的javascript库
  
    SQLite是一种轻量级的嵌入式数据库（数据库不需要你安装的，手机系统自带，你需要安装的就是SQLite插件）
    安装SQLite插件和pouchdb.js库，并将pouchdb引入到index.html中。
  
    1. 安装指令: cordova plugin add io.litehelpers.cordova.sqlitestorage
    2. 在index.html中引入js<script src="lib/pouchdb/dist/pouchdb.min.js"></script>
    3. API: http://pouchdb.com/api.html
    4. demo: 查看homeControllers.js的FordosCtrlFun方法
  
    PouchDB查询插件:
    https://github.com/nolanlawson/pouchdb-find
    
