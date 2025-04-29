/**
 * Created with JetBrains WebStorm.
 * User: BiG
 * Date: 6/12/13
 * Time: 8:50 AM
 * BiGFramework框架的动态文档部分,全称DynamicDocument
 */
(function(win, doc){
    "use strict";
    var App = {};
    App._dynDocInDom = {}; //在浏览器Dom存在的DynDoc对象副本,属性名字是对应DynDoc的name属性
    App.allDynDoc = {}; //所有DynDoc对象副本,包括不在Dom的,属性名字是对应DynDoc的name属性
    App.state = 'stopped'; //异步状态
    App.createDynDoc = function(argu){
        /*
         * 返回一个动态文本(DynDoc)对象,'_'开头的属性为内部属性,对应的属性为动态属性
         * 属性dom为动态文本对象对应DOM的对象
         * 属性name是必须的,DOM上的动态文本也有对应的name属性,即 DynDoc.idName==DynDoc._dom.idName
         */
        var appSelf = this; //appSelf为全局App对象
        var element = doc.createElement('dyndoc');
        var DynamicDocument = {
            type: 'DynDoc',
            _dom: element,
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

            _father: undefined, //_father是唯一的,所以初始化为undefined
            set father(f){
                appSelf._protoMethod._setFather.call(this, appSelf, f);
            },
            get father(){
                return this._father;//parentNode
            },

            _child: {},
            set child(c){ //child属性为只读属性
                return false;
            },
            get child(){
                return this._child;
            },

            /*_id: undefined,
             set id(id){
             this._dom.id = id;
             this._id = id;
             return true;
             },
             get id(){
             return this._id;
             },*/

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

        DynamicDocument.__defineGetter__('addChild', function(){
            return function(c){ //addChild 可以以数组或是以','分割的字符串传入DOM对象(可以是DynDoc或者具有id的普通元素)或是
                var dynDocSelf = this;
                if(typeof c == 'string'){
                    c = c.split(',');
                    if(c[0] == ''){
                        return false;
                    }
                    else{
                        c.forEach(function(children){
                            appSelf._protoMethod._addChild.call(dynDocSelf, appSelf, children);
                        });
                    }
                }
                else if(c.forEach){
                    c.forEach(function(children){
                        appSelf._protoMethod._addChild.call(dynDocSelf, appSelf, children);
                    });
                }
                else{
                    return false;
                }
            }
        });
        DynamicDocument.__defineSetter__('addChild', function(){
            console._log('addChild is function and it\'s Read-Only');
            return false;
        });

        var init = function(){
            for(var i in argu){
                DynamicDocument[i] = argu [i];
            }
        };


        if(!argu){ //初始化必须存入css参数
            return false;
        }
        else if(!argu.idName){ //如果初始化一个DynDoc对象没有idName属性,则默认为master
            if(appSelf.allDynDoc.master){ //DynDoc master 只能存在一个
                return false;
            }
            else{ //创建master DynDoc对象
                init();
                DynamicDocument.idName = 'master';
                appSelf.allDynDoc.master = DynamicDocument;
                return DynamicDocument;
            }
        }
        else if(appSelf.allDynDoc[argu.idName]){ //DynDoc.idName是唯一的,不能重复
            return false;
        }
        else{ //创建 DynDoc对象
            init();
            appSelf.allDynDoc[DynamicDocument.idName] = DynamicDocument;
            return DynamicDocument;
        }
    };

    App._protoMethod = {
        _setNotDynDocChildAtt: function(method, target){
            var fTemp, fAtt = target.getAttribute('dyndoc-child');
            var dynDocSelf = this;
            switch(method){
                case 'add':
                    if(fAtt != null && fAtt != ''){
                        target.setAttribute('dyndoc-child', fAtt + ',' + dynDocSelf.idName);
                    }
                    else{
                        target.setAttribute('dyndoc-child', dynDocSelf.idName);
                    }
                    break;
                case 'remove':
                    if(fAtt != null && fAtt != ''){
                        fAtt = fAtt.split(',');
                        fTemp = fAtt.indexOf(dynDocSelf.idName);
                        fAtt.splice(fTemp, 1);
                        target.setAttribute('dyndoc-child', fAtt.toString());
                    }
                    break;
                default:
                    return;
            }
        },

        _setFather: function(appSelf, f){
            var dynDocSelf = this;
            var fIsDynDoc = function(obj){
                obj._dom.appendChild(dynDocSelf._dom);//待异步
                obj._child[dynDocSelf.idName] = dynDocSelf; //待异步
                if(dynDocSelf._father != undefined){ //原来有father
                    if(dynDocSelf._father.type == 'DynDoc'){ //原来的father是DynDoc
                        delete dynDocSelf._father._child[dynDocSelf.idName];
                    }
                    else{ //非DynDoc,即Dom上的普通元素
                        appSelf._protoMethod._setNotDynDocChildAtt.call(dynDocSelf, 'remove', dynDocSelf._father);
                    }
                }

                dynDocSelf._father = obj;

                if(obj._inDom && !dynDocSelf._inDom){
                    dynDocSelf._inDom = true;
                    appSelf._dynDocInDom[dynDocSelf.idName] = dynDocSelf;
                }
                else if(!obj._inDom && dynDocSelf._inDom){
                    dynDocSelf._inDom = false;
                    delete appSelf._dynDocInDom[dynDocSelf.idName];
                }

            };

            var fIsDomElement = function(obj){
                obj.appendChild(dynDocSelf._dom); //待异步
                appSelf._protoMethod._setNotDynDocChildAtt.call(dynDocSelf, 'add', obj);

                if(dynDocSelf._father == undefined){
                    //doNothing
                }
                else if(dynDocSelf._father.type != 'DynDoc'){
                    appSelf._protoMethod._setNotDynDocChildAtt.call(dynDocSelf, 'remove', dynDocSelf._father);
                }
                else{
                    delete dynDocSelf._father._child[obj.id];
                }

                dynDocSelf._father = obj;
                if(!dynDocSelf._inDom){
                    appSelf._dynDocInDom[dynDocSelf.idName] = dynDocSelf;
                    dynDocSelf._inDom = true;
                }
            };

            if(typeof f == 'object'){
                if(f.type == 'DynDoc'){ //如果这个元素是DynDoc
                    fIsDynDoc(f);
                    return true;
                }
                else if(win[f.id]){ //如果这个元素在Dom上但非DynDoc元素
                    fIsDomElement(f);
                    return true;
                }
                else if(f.appendChild){ //不在Dom上但有nodeName,非DynDoc元素
                    f.appendChild(dynDocSelf._dom); //待异步
                    appSelf._protoMethod._setNotDynDocChildAtt.call(dynDocSelf, 'add', f);

                    this._father = f;
                    if(dynDocSelf._inDom){
                        delete appSelf._dynDocInDom[dynDocSelf.idName];
                        dynDocSelf._inDom = false;
                    }
                    return true;
                }
                else{
                    return false;
                }
            }
            else if(typeof f == 'string'){ //输入字符串,可以是DynDoc的idName,可以是非DynDoc元素id
                var nodeFather = appSelf.allDynDoc[f] || win[f];//待异步

                if(nodeFather){
                    if(nodeFather.type == 'DynDoc'){ //nodeFather是DynDoc
                        fIsDynDoc(nodeFather);
                        return true;
                    }
                    else{ //nodeFather是DOM上的元素而非DynDoc
                        fIsDomElement(nodeFather);
                        return true;
                    }
                }
                else{
                    return false;
                }
            }
            else{
                return false;
            }
        },

        _addChild: function(appSelf, c){
            var dynDocSelf = this;
            var cIsDynDoc = function(obj){
                dynDocSelf._dom.appendChild(obj._dom); //待异步
                dynDocSelf._child[obj.idName] = obj;
                if(obj._father != undefined){
                    if(obj._father.type == 'DynDoc'){
                        delete obj._father._child[obj.idName];
                    }
                    else if(obj._father.appendChild){
                        appSelf._protoMethod._setNotDynDocChildAtt.call(dynDocSelf, 'remove', obj.father);
                    }
                }
                obj._father = dynDocSelf;

                if(dynDocSelf._inDom && !c._inDom){
                    obj._inDom = true;
                    appSelf._dynDocInDom[obj.idName] = obj;
                }
                else if(!dynDocSelf._inDom && c._inDom){
                    obj._inDom = false;
                    delete appSelf._dynDocInDom[obj.idName];
                }
            };
            var cIsElement = function(obj){
                dynDocSelf._dom.appendChild(obj); //待异步
                obj.setAttribute('dyndoc-father', dynDocSelf.idName);
                dynDocSelf._child[obj.id] = obj;
            };

            if(typeof c == 'object'){
                if(c.type == 'DynDoc'){
                    cIsDynDoc(c);
                    return true;
                }
                else if(c.appendChild){
                    cIsElement(c);
                    return true;
                }
                else{
                    return false;
                }
            }
            else if(typeof c == 'string'){
                var nodeChild = appSelf.allDynDoc[c] || window[c];
                if(nodeChild){
                    if(nodeChild.type == 'DynDoc'){
                        cIsDynDoc(nodeChild);
                        return true;
                    }
                    else if(nodeChild.id == c){
                        cIsElement(nodeChild);
                        return true;
                    }
                }
                else{
                    return false
                }
            }
        }
    };

    win.app = App;
})(window, document);