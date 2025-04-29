/**
 * Created with JetBrains WebStorm.
 * User: big
 * Date: 7/3/13
 * Time: 7:23 PM
 * To change this template use File | Settings | File Templates.
 */
(function(win, doc){
    "use strict";
    var App;
    var script;
    var node = doc.getElementById('deferScript');
    var scriptFile = 'js/framework-branch.js';
    var Worker = win.Worker;
    var ENVIRONMENT;
    var app = 'app';
    if(win.Worke){

        ENVIRONMENT = 'browser with webWorker';

        App = function DynamicDocumentGlobalObject(){
            this._dynDocInDom = {};
            this.allDynDoc = {};
            this.master = undefined;
            this._global = win;

            win.DynamicDocumentGlobalObject = this;
            win.DynamicDocumentGlobalObject.worker._appSelf = this;
            win.DynamicDocumentGlobalObject = null;
            delete win.DynamicDocumentGlobalObject;
        };
        App.fn = App.prototype = {
            worker: (function(win){
                return new Worker(scriptFile);
            })(win),
            _aSyncStack: [],
            _defineProp: win.Object.defineProperties,
            set ENVIRONMENT(err){
                return false;
            },
            get ENVIRONMENT(){
                return ENVIRONMENT;
            },
            set extend(err){
                return false;
            },
            get extend(){
                return function(){
                    if(typeof arguments[0] == 'object' && !arguments[1]){
                        this._extendModule('DynDoc', arguments[0]);
                    }
                    if(typeof arguments[0] == 'string' && typeof arguments[1] == 'object'){
                        this._extendModule(arguments[0], arguments[1]);
                    }
                    else{
                        return false;
                    }
                };
            },
            _extendModule: function(target, module){
                var index, objTemp = {};
                var appSelf = this;
                if(target == 'App' || target == 'DynDoc'){
                    var message = {
                        target: target,
                        module: module,
                        event: 'extendModule'
                    };
                    appSelf.worker.postMessage(message);
                }
                else if(target == 'local'){
                    if(typeof module == 'object'){
                        for(index in module){
                            if(module[index].accessName){
                                objTemp[module[index].accessName] = {
                                    set:module[index].set,
                                    get:module[index].get
                                };
                                appSelf._defineProp(appSelf, objTemp);
                                objTemp = {};
                            }
                            if(module[index].method){
                                appSelf[index] = module[index].method;
                            }
                            if(module[index].init){
                                module[index].init();
                            }
                        }
                    }
                    else{
                        return;
                    }
                }
            }
        };
        App.fn.worker.onmessage = function(event){
            var appSelf = this._appSelf;
            var receivedObj = event.data, element;
            var father, child, handle, stack, length, execute, style;
            switch(receivedObj.event){
                case 'executeStack':
                    stack = appSelf._aSyncStack;
                    length = stack.length;
                    execute = function(){
                        if(length > 0){
                            setTimeout(stack[0], 0);
                            length--;
                            stack.shift();
                            execute();
                        }
                        else{
                            return;
                        }
                    };
                    execute();
                    break;
                case 'appendChild':
                    father = appSelf.allDynDoc[receivedObj.father] || undefined;
                    child = appSelf.allDynDoc[receivedObj.child] || undefined;
                    handle = function(){
                        father.appendChild(child);
                    };
                    if(father && child){
                        appSelf._aSyncStack.push(handle);
                    }
                    break;
                case 'createElement':
                    element = doc.createElement('dyndoc');
                    element.id = receivedObj.idName;
                    element.style.position = 'absolute';
                    element.style.display = 'block';
                    element.style.color = 'black';
                    appSelf.allDynDoc[receivedObj.idName] = element;
                    break;
                case 'changeStyle':
                    element = appSelf.allDynDoc[receivedObj.idName];
                    appSelf._global.console.log(element);
                    handle = function(){
                        element.style[receivedObj.style] = receivedObj.value;
                    };
                    if(element){
                        appSelf._aSyncStack.push(handle);
                    }
                    break;
                default:
                    break;
            }
        };
        win[app] = new App();
    }
    else{
        script = doc.createElement('script');
        script.type = 'text/javascript';
        script.src = scriptFile;
        script.defer = true;
        node.appendChild(script);
    }
})(window, document);




/*var appobj = {
    master: {
        base: 'body',
        style: {
            top: 0,
            left: 0,
            width: 1000,
            height: 1000,
            color: 'white',
            align: 'center',
            backgroundColor: 'black'
        },
        content: 'Dynamic master',
        children: {
            obj4: {
                style: {
                    top: 55,
                    left: 50,
                    width: 500,
                    height: 500,
                    backgroundColor: 'grey'
                },
                content: 'Dynamic Obj4',
                children: {
                    obj6: {
                        style: {
                            top: 60,
                            left: 50,
                            width: 500,
                            height: 500,
                            backgroundColor: 'yellow'
                        },
                        content: 'Dynamic Obj6'
                    }
                }
            },
            obj5: {
                style: {
                    top: 65,
                    left: 50,
                    width: 500,
                    height: 500,
                    backgroundColor: 'pink'
                },
                content: 'Dynamic Obj5'
            }
        }
    },
    obj1: {
        style: {
            top: 50,
            left: 500,
            width: 500,
            height: 500,
            layer: 3,
            backgroundColor: 'red'
        },
        content: 'Dynamic Obj1'
    },
    obj2: {
        style: {
            top: 50,
            left: 200,
            width: 600,
            height: 500,
            backgroundColor: 'blue'
        },
        content: 'Dynamic Obj2'
    }
};*/