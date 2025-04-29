/**
 * Created with JetBrains WebStorm.
 * User: BiG
 * Date: 6/5/13
 * Time: 8:07 AM
 * To change this template use File | Settings | File Templates.
 */
(function(window, document){
    "use strict";
    var win = window;
    var doc = document;
    /*
     * ws对象为客户端浏览器WebSocket连接工具
     * 分别有属性:
     *  connectCount 重试连接服务器计数
     *  state        连接状态,为六种分别是 ready, connected, connecting, reconnecting, fail, closed
     *  clientNumber 客户端与服务器连接的标识
     *  received     最近一次接收到的message
     *  wsObj        构造函数WebSocket创建的实例
     * 分别有方法:
     *  open         连接到WebSocket服务器,接受两个参数,第一个参数为重连次数,默认重连一次;第二个参数为自定义protocol;第三个为自定义cookie
     *  close        断开WebSocket的连接
     *  send         发送内容到WebSocket服务器
     */
    var ws = {
        connectCount: 0,
        state: 'ready',
        clientNumber: '',
        received: undefined,
        wsObj: undefined,
        open: function ws_connect(count, ptc, coki){
            var reConnectCount = count ? count - 1 : 0; //open的count参数如果调用时没有输入,则默认重试次数为1
            var protocol = ptc ? ptc : 'big-protocol'; //open的ptc参数如果调用时没有输入,则默认protocol为'big-protocol'
            var cookie = coki ? coki : 'idName=big.com'; //open的coki参数如果调用时没有输入,则默认cookie为'domain=big.com'
            if(this.state == 'connected' || this.state == 'connecting' || this.state == 'reconnecting'){
                console._log('client is already ' + this.state);
                return false;
            }
            var webSocketObj = new WebSocket('ws://' + doc.domain, protocol); //建立实例并尝试连接服务器
            var connectError = false; //初始化connectError变量,只有出现错误时才为true
            var self = this; //声明self指向自己

            if(self.connectCount == 0){
                self.state = 'connecting'; //此为第一次连接中
            }
            else{
                self.state = 'reconnecting'; //非第一次连接,重新连接中
            }

            webSocketObj.onopen = function(){
                if(webSocketObj.readyState == 1){
                    console._log('Connected to WebSocket Server!');
                    connectError = false;
                    self.connectCount = 0;
                    self.state = 'connected';
                }
            };

            webSocketObj.onmessage = function(msg){
                if(self.clientNumber == ''){
                    self.clientNumber = msg.data;
                }
                else{
                    self.received = msg.data;
                    console._log(msg.data);
                }
            };

            webSocketObj.onerror = function(e){
                connectError = true;
            };

            webSocketObj.onclose = function(){
                if(connectError){ //判断是否连接错误
                    if(doc.cookie == ''){ //定制WebSocket服务器如果没有Cookie,则拒绝连接,所以要定义Cookie
                        doc.cookie = cookie;
                        self.wsObj = null;
                        self.open();
                    }
                    else if(self.connectCount <= reConnectCount){ //循环调用open方法知道重试计数器的值到达为止
                        console._log('Trying to reconnect WebSocket Server');
                        self.connectCount++;
                        self.wsObj = null;
                        self.open();
                    }
                    else{
                        console._log('Connect fail!! Please retry later!!'); //循环完毕依然不能连接到服务器则放弃连接并设置state值为false
                        self.wsObj = null;
                        self.connectCount = 0;
                        self.state = 'fail';
                    }
                }
                else{ //不是连接错误,则是正常断开
                    console._log('Disconnect from WebSocket Server Successful!');
                    self.clientNumber = '';
                    self.wsObj = null;
                    self.state = 'closed';
                }
            };
            self.wsObj = webSocketObj; //导出WebSocket实例到ws对象
            return self.state + ' to WebSocket Server...';
        },
        close: function ws_close(){
            var self = this;
            if(self.state == 'connected'){ //检查是否连接成功,连接关闭后触发open里定义的onclose事件
                self.wsObj.close();
                return true;
            }
            else{
                console._log('Already disconnect from WebSocket Server!')
                return false;
            }
        },
        send: function ws_send(msg){
            var self = this;
            if(self.state == 'connected'){ //检查是否连接成功
                if(msg){ //检查是否有输入参数以准备发送,调用send()会触发open里定义的onmessage事件
                    self.wsObj.send(msg);
                    return true;
                }
                else{
                    console._log('No message need to be send!');
                    return false;
                }
            }
            else{
                console._log('Already disconnect from WebSocket Server!');
                return false;
            }
        }
    };

    win.big = {};
    win.big.ws = ws;
})(window, document);
