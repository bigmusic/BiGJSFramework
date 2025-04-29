/**
 * Created with JetBrains WebStorm.
 * User: big
 * Date: 6/20/13
 * Time: 8:23 PM
 * To change this template use File | Settings | File Templates.
 */
createDynDoc = function(argu, masterFather){
                /*
                 * 返回一个动态文本(DynDoc)对象,'_'开头的属性为内部属性,对应的属性为动态属性
                 * 属性dom为动态文本对象对应DOM的对象
                 * 属性name是必须的,DOM上的动态文本也有对应的name属性,即 DynDoc.idName==DynDoc._dom.idName
                 */
                var appSelf = this; //appSelf为全局App对象
                var element = doc.createElement('dyndoc');
                var DynamicDocument = {
                    type: 'DynDoc',
                    dom: element,

                    //setInDom: undefined,
                    _inDom: false, //!!!!!!!!!等会儿需要写setget 利用removeChild //this._father._dom.removeChild(this._dom);
                    empty: [0, 0, 0, 0],

                    init: function(init){
                        for(var i in init){
                            this[i] = init[i];
                        }
                    },

                    _idName: undefined,
                    set idName(n){
                        this._dom.setAttribute('idName', n);
                        this._idName = n;
                        return true;
                    },
                    get idName(){
                        return this._idName;
                    },

                    _content: undefined,
                    set content(cont){
                        if(typeof cont == 'string'){
                            var node = doc.createElement('p');
                            node.innerHTML = cont;
                            this._dom.appendChild(node);
                            this._content = cont;
                            return true;
                        }
                        else if(typeof cont == 'object' && cont.nodeName){
                            this._dom.appendChild(cont);
                            this._content = cont.innerText;
                            return true;
                        }
                        else{
                            return false;
                        }
                    },
                    get content(){
                        return this._content;
                    },


                    _father: undefined,//_father是唯一的,所以初始化为undefined
                    set setFather(err){
                        appSelf._log.splice(0, 0, 'Cant set setFather to "' + err + '",setFather is function and it\'s Read-Only! at ' + new Date());
                        return false;
                    },
                    get setFather(){
                        return function(){
                            var dynDocSelf = this;
                            if(arguments.length == 1){
                                appSelf._protoMethod._setFather(appSelf, dynDocSelf, arguments[0]);
                                return true;
                            }
                            else{
                                appSelf._log.splice(0, 0, 'setFather is function and must have and have only one ARGUMENTS! at ' + new Date());
                                return false;
                            }
                        };
                    },
                    set father(err){
                        appSelf._log.splice(0, 0, 'Cant set father to "' + err + '",father is Read-Only! at ' + new Date());
                        return false;
                    },
                    get father(){
                        return this._father;
                    },

                    _children: {},
                    _childLength: 0,
                    set addChild(err){
                        appSelf._log.splice(0, 0, 'Cant set addChild to "' + err + '",addChild is function and it\'s Read-Only! at ' + new Date());
                        return false;
                    },
                    get addChild(){
                        return function(){ //addChild 可以以数组或是以','分割的字符串传入DOM对象(可以是DynDoc或者具有id的普通元素)或是
                            var dynDocSelf = this;
                            if(arguments.length > 0){
                                Array.prototype.forEach.call(arguments, function(item){
                                    appSelf._protoMethod._addChild(appSelf, dynDocSelf, item);
                                });
                            }
                            else{
                                appSelf._log.splice(0, 0, 'addChild is function and must have ARGUMENTS! at ' + new Date());
                                return false;
                            }
                        };
                    },
                    set children(err){ //child属性为只读属性
                        appSelf._log.splice(0, 0, 'Cant set children to "' + err + '",children is Read-Only! at ' + new Date());
                        return false;
                    },
                    get children(){
                        return this._children;
                    },

                    _class: undefined,
                    set class(clas){
                        this._dom.className = clas;
                        this._class = clas;
                        return true;
                    },

                    get class(){
                        return this._class;
                    },

                    _top: 0,
                    set top(px){
                        this._top = px;
                        this._dom.style.top = this._top.toString() + 'px';
                    },
                    get top(){
                        var r = this._top.toString() + 'px';
                        return r;
                    },

                    _left: 0,
                    set left(px){
                        this._left = px;
                        this._dom.style.left = this._left.toString() + 'px';
                    },
                    get left(){
                        var r = this._left.toString() + 'px';
                        return r;
                    },

                    _width: 0,
                    set width(px){
                        this._width = px;
                        this._dom.style.width = this._width.toString() + 'px';
                    },
                    get width(){
                        var r = this._width.toString() + 'px';
                        return r;
                    },

                    _height: 0,
                    set height(px){
                        this._height = px;
                        this._dom.style.height = this._height.toString() + 'px';
                    },
                    get height(){
                        var r = this._height.toString() + 'px';
                        return r;
                    },

                    _color: 'black',
                    set color(clr){
                        this._color = clr;
                        this._dom.style.color = clr;
                    },
                    get color(){
                        return this._color;
                    },

                    _backgroundColor: undefined,
                    set backgroundColor(bgc){
                        this._backgroundColor = bgc;
                        this._dom.style.backgroundColor = bgc;
                    },
                    get backgroundColor(){
                        return this._backgroundColor;
                    }
                };
                element.style.position = 'absolute';
                element.style.display = 'block';
                element.style.color = 'black';

                var init = function(){
                    for(var i in argu){
                        DynamicDocument[i] = argu [i];
                    }
                };

                if(!argu){ //初始化必须存入css参数和master在Dom的位置;
                    return false;
                }
                else if(argu.idName == 'master'){ //如果初始化一个DynDoc对象没有idName属性,则默认为master
                    if(appSelf.allDynDoc.master){ //DynDoc master 只能存在一个
                        return false;
                    }
                    else{ //创建master DynDoc对象
                        init();
                        //DynamicDocument.idName = 'master';
                        DynamicDocument._inDom = true;
                        appSelf.allDynDoc.master = DynamicDocument;
                        appSelf._dynDocInDom.master = DynamicDocument;
                        masterFather.appendChild(appSelf.allDynDoc.master._dom);

                        return DynamicDocument;
                    }
                }
                else if(!appSelf.allDynDoc.master){ //必须先有master才可以继续添加其他控件
                    return false;
                }
                else if(appSelf.allDynDoc[argu.idName]){ //DynDoc.idName是唯一的,不能重复
                    return false;
                }
                else{ //创建 DynDoc对象
                    init();
                    appSelf.allDynDoc[DynamicDocument.idName] = DynamicDocument;
                    return DynamicDocument;
                }
            }


var i=function(e){
    "use strict";
    var a={
        a:'a',
        b:this
    };
    return a;
};

var test =function(){
    var i='test';
    var win = window;
    (function(){
        "use strict";
        win.a='a';
    })();
    return i;
};


