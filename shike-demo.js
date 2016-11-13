/**
 * phantomjs shike.js <垫>
 * 默认免邮费
 */

var webpage=require('webpage');
var system = require('system');

var INDEX=1;
var MAX=2;//最大多少页

var page=webpage.create();
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
      start();
  }
};

function start(){
    console.log('开始抓取第'+INDEX+'页');
    getList(INDEX,function(){
        if(INDEX>=MAX){
            return finish();
        }
        INDEX++;
        start();
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
    var url='http://list.shikee.com/list-'+index+'.html?posfree=1';
    if(system.args[1]){
        //如果存在搜索
        url='http://list.shikee.com/list-'+index+'.html?posfree=1&keyword='+encodeURIComponent(system.args[1])
    }
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
           var OBJ={num:urls.length}
           urls.forEach(function(url){
               createpage(url,OBJ,cb);
           });
           newPage.close();
       })
    })
}

function createpage(url,OBJ,cb){
    var newPage=webpage.create();
    newPage.onUrlChanged=function(targetUrl){
        // console.log(targetUrl);
    }
    newPage.onConsoleMessage = function(msg) {
      console.log(msg);
    }
    newPage.open(url,function(status){
      if(status!=='success')return console.log('失败');
      newPage.includeJs('http://static.shikee.com/common/js/jquery-1.10.2.min.js',function(){
          newPage.evaluate(function(){
            if(window.Detail && window.Detail.apply){
                Detail.apply();
                //如果需要收藏
                if($(document).find('.tip-collect').size()>0){
                    Detail.wait_to_apply(5);
                    setTimeout(function(){
                        $('#linkCofirm').trigger('click');
                    },6000)
                }
            }else{
                console.log('不存在');
            }
          });
          OBJ.num--;
          if(OBJ.num==0){
              cb();
          }else{
              console.log('还剩下：'+OBJ.num);
          }
          setTimeout(function(){
              newPage.close();
        },6000)
      })
    })
}

function finish(){
    phantom.exit();
}

page.open('http://login.shikee.com/',function(status){
     console.log('开始登录');
    if(status!=='success')return console.log('登录页面请求失败');
    page.evaluate(function(){
        var $doc=$(document);
        var $username=$doc.find('#J_userName').val('用户名');
        var $password=$doc.find('#J_pwd').val('密码');
        var $submit=$doc.find('#J_submit');
        $submit.trigger('click');
    })
    // phantom.exit();
})
