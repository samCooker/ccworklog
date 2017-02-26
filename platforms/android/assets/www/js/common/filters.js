/**
 * Created by Administrator on 2015/11/30.
 */

(function(){
    appModule.filter('showOrHideFilter',['$sce', function(){
        //val:截取的字符串 size：截取长度  showFlag:收起还是展开
        return function(val,size,showFlag){
            if(val){
                if(val.length<=size){
                    return val;//字符串长度小于截取的长度，则不进行截取
                }
                if(showFlag){
                    return val;
                }
                if(!showFlag){
                    return val.substr(0, size)+'...';//截取0-param个字符
                }
            }
            return '';
        };
    }])//截取字符串
    ;
})();