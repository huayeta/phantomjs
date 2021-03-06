/**
 * phantomjs shike.js <垫>
 * 默认免邮费 美食
 * 搜索免邮费
 */

var webpage=require('webpage');
var system = require('system');

var INDEX=1;
var MAX=1;//最大多少页

var keywords=['茶','乌龙茶','铁观音','蜂蜜','钢化膜','iphone+数据线','苹果+数据线','必备','苹果6+手机壳','iphone6+手机壳','沙发+垫','椅子+垫','竹炭','活性炭','炭'];
var kw;

var page=webpage.create();
page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36';
page.onConsoleMessage = function(msg) {
  console.log(msg);
}
page.onUrlChanged = function(targetUrl) {
  // console.log('New URL: ' + targetUrl);
  if(targetUrl=='http://user.shikee.com/buyer'){
      console.log('登录成功');
      page.close();
      //获取
      console.log('开始获得地址');
    //   start();
    kwFn();
  }
};
page.open('http://login.shikee.com/',function(status){
     console.log('开始登录');
    if(status!=='success'){
        console.log('登录页面请求失败');
        console.log(status);
        return finish();
    }
    page.evaluate(function(){
        var $doc=$(document);
        var $username=$doc.find('#J_userName').val('用户名');
        var $password=$doc.find('#J_pwd').val('密码');
        var $submit=$doc.find('#J_submit');
        $submit.trigger('click');
    })
    // phantom.exit();
})

function kwFn(){
    kw=keywords.shift();
    console.log('关键词：'+kw);
    INDEX=1;
    start(function(){
        if(keywords.length>0){
            console.log('----------');
            kwFn();
        }else{
            finish();
        }
    });
}

function start(cb){
    console.log('开始抓取第'+INDEX+'页');
    getList(INDEX,function(){
        if(INDEX>=MAX){
            return cb();
        }
        INDEX++;
        start(cb);
    })
}

function getList(index,cb){
    var newPage=webpage.create();
    newPage.onUrlChanged=function(targetUrl){
        console.log(targetUrl);
    }
    newPage.onConsoleMessage = function(msg) {
      console.log(msg);
    }
    // var url='http://list.shikee.com/list-'+index+'.html?posfree=1&cate=5';
    // if(system.args[1]){
    //     var keyword=system.args[1];
    //     var arr=system.args[1].split(':');
    //     if(arr.length>1){
    //         MAX=arr[1];
    //         keyword=arr[0];
    //     }
    //     //如果存在搜索
    //     url='http://list.shikee.com/list-'+index+'.html?posfree=1&keyword='+encodeURIComponent(keyword)
    // }
    url='http://list.shikee.com/list-'+index+'.html?posfree=1&keyword='+encodeURIComponent(kw)
    newPage.open(url,function(status){
      if(status!=='success')return console.log('失败');
       newPage.includeJs('http://static.shikee.com/common/js/jquery-1.10.2.min.js',function(){
           var urls=newPage.evaluate(function(){
               var $box=$(document).find('.maxPicList .item');
               var urls=[];
               $box.each(function(){
                   var $this=$(this);
                   urls.push($this.find('.pic').attr('href'));
               })
               return urls;
           });
           console.log('得到网址：'+urls.length);
           if(urls.length==0)return cb();
           var OBJ={num:urls.length};
           var fn_arr=urls.map(function(url){
               return createpage.bind(this,url,OBJ,cb);
           })
           delay(fn_arr,6500);
        //    urls.forEach(function(url){
            //    createpage(url,OBJ,cb);
        //    });
           newPage.close();
       })
    })
}

/**
 * 延迟函数
 * @params fn_arr 函数数组
 * @params time 延迟参数ms
 * @returns void
 */
 function delay(fn_arr,time){
     if(fn_arr.length==0){
         return;
     }
     var fn=fn_arr.pop();
     setTimeout(function(){
         fn();
         delay(fn_arr,time);
     },time)
 }

function createpage(url,OBJ,cb){
    var newPage=webpage.create();
    newPage.onUrlChanged=function(targetUrl){
        // console.log(targetUrl);
    }
    newPage.onConsoleMessage = function(msg) {
      console.log(msg);
    }
    newPage.onResourceTimeout=function(request){
        console.log('请求超时');
        OBJ.num--;
        if(OBJ.num==0){
            cb();
        }else{
            console.log('还剩下：'+OBJ.num);
        }
    }
    newPage.open(url,function(status){
      if(status!=='success'){
          console.log('失败');
      }else{
          newPage.includeJs('http://static.shikee.com/common/js/jquery-1.10.2.min.js',function(){
              newPage.evaluate(function(){
                if(window.Detail && window.Detail.apply){
                    Detail.apply();
                    //如果需要收藏
                    if($(document).find('.tip-collect').size()>0){
                        Detail.wait_to_apply(5);
                        setTimeout(function(){
                            $('#linkCofirm').trigger('click');
                        },5500)
                    }
                }else{
                    console.log('不存在');
                }
              });
          })
      }
      setTimeout(function(){
          OBJ.num--;
          if(OBJ.num==0){
              cb();
          }else{
              console.log('还剩下：'+OBJ.num);
          }
      },5500)
        setTimeout(function(){
            newPage.close();
        },6000)
    })
}

function finish(){
    phantom.exit();
}
