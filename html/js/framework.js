/**
 * Created with JetBrains WebStorm.
 * User: BiG
 * Date: 6/12/13
 * Time: 8:50 AM
 * BiGFramework框架的动态文档部分,全称DynamicDocument
 */

(function(env){
    "use strict";

    var GLOBAL = env.GLOBAL || window || self,
        VERSION = '0.0.1a',
        SECRET = env.settings ?
            env.settings.SECRET ?
                env.settings.SECRET :
                GLOBAL.Math.random() :
            GLOBAL.Math.random(),

        ENVIRONMENT = env.settings? env.settings.ENVIRONMENT ? env.settings.ENVIRONMENT : 'development' : 'development',
        DEVELOPMENT = (ENVIRONMENT == 'development'),
        RUN_IN = env.RUN_IN,
        WEB_WORKER = (RUN_IN == 'worker'),
        doc = RUN_IN == 'browser' ? GLOBAL.document : null,
        win = RUN_IN == 'browser' ? GLOBAL : null,
        INIT = env.settings ?
            env.settings.init ?
                env.settings.init :
                undefined :
            undefined,

        GLOBAL_INSTANCE_NAME = env.settings ?
            env.settings.GLOBAL_INSTANCE_NAME ?
                env.settings.GLOBAL_INSTANCE_NAME :
                'app' :
            'app';

    GLOBAL.test = [];

    //Utils
    var UTILS = {};
    GLOBAL.Object.defineProperties(UTILS, {
        GLOBAL: {
            value: GLOBAL,
            configurable: false,
            enumerable: false,
            writable: false
        },
        isWhat: {
            value: function isWhat(target){
                var type = this.GLOBAL.Object.prototype.toString.call(target);

                switch(type){
                    case "[object Object]":
                        return 'object';
                    case "[object Array]":
                        return 'array';
                    case "[object Function]":
                        return 'function';
                    case "[object Undefined]":
                        return undefined;
                    case "[object Null]":
                        return null;
                    case "[object String]":
                        return 'string';
                    case "[object Boolean]":
                        return 'boolean';
                    case "[object Number]":
                        return 'number';
                    case "[object RegExp]":
                        return 'regexp';
                    case "[object Arguments]":
                        return 'arguments';
                    case "[object global]":
                        return 'global';
                    case "[object JSON]":
                        return 'json';
                    case "[object Comment]":
                        return 'comment';
                    case "[object Attr]":
                        return 'attr';
                    case "[object Text]":
                        return 'text';
                    case "[object Range]":
                        return 'range';
                    case "[object TreeWalker]":
                        return 'treewalker';
                    default:
                        if(type.indexOf('HTML') >= 0){
                            return 'html';
                        }
                        else if(type.indexOf('Document') >= 0){
                            return 'document';
                        }
                        else if(type.indexOf('XPath') >= 0){
                            return 'xpath';
                        }
                        else if(type.indexOf('Node') >= 0){
                            return 'node';
                        }
                        else{
                            return 'unknown';
                        }
                }
            }.bind(UTILS),
            configurable: false,
            enumerable: true,
            writable: false
        },
        defineProps: {
            value: function DefineObjectProperties(Target, Properties, Clone, Configurable, Enumerable, Writable, Context){
                Clone = Clone == undefined ? false : typeof Clone == 'boolean' ? Clone : false;
                Configurable = Configurable == undefined ? true : typeof Configurable == 'boolean' ? Configurable : true;
                Enumerable = Enumerable == undefined ? true : typeof Enumerable == 'boolean' ? Enumerable : true;
                Writable = Writable == undefined ? true : typeof Writable == 'boolean' ? Writable : true;

                var isWhat = this.isWhat;
                var throwError = this.throwError;
                var cloneObj = this.cloneObj;
                var DEFINE = this.GLOBAL.Object.defineProperties;
                var isDefinePrototype = false;

                var define = function(target, targetType, propArray){
                    var objForDefine = {}, objForIndex, lowerCasePropName, propType;
                    propArray.forEach(function(prop){
                        propType = isWhat(prop);

                        if(propType == 'object'){
                            for(var index in prop){
                                lowerCasePropName = index.toLowerCase();

                                //如果定义的属性名字是prototype(不分大小写)，不指定constructor则自动定义constructor目标函数本身
                                if(lowerCasePropName == 'prototype' && targetType == 'function'){
                                    if(isWhat(prop[index]) == 'object'){
                                        //constructor默认不可以枚举和写，不许设置
                                        !(prop[index].hasOwnProperty('constructor')) &&
                                        DEFINE(prop[index], {
                                            constructor: {
                                                value: target,
                                                configurable: false,
                                                enumerable: false,
                                                writable: false
                                            }
                                        });

                                        objForDefine.prototype = {
                                            value: prop[index]
                                        };
                                        //如果Clone为false， 即定义的prototype为同一个对象，则返回该对象；
                                        isDefinePrototype = Clone ? false : prop[index];
                                    }
                                    else{
                                        throwError('To define prototype, prop must be an object', prop);
                                    }
                                }
                                else if(lowerCasePropName == 'set' || lowerCasePropName == 'get'){
                                    throwError('Property name can not be "SET" or "GET"', prop[index]);
                                }
                                else{
                                    objForIndex = prop[index];
                                    propType = isWhat(objForIndex);
                                    if(propType == 'object'){
                                        //无论set和get的大小写如何，全部转换成小写
                                        for(var setGET in objForIndex){
                                            lowerCasePropName = setGET.toLowerCase();
                                            if(lowerCasePropName != setGET && (lowerCasePropName == 'set' || lowerCasePropName == 'get' || lowerCasePropName == '_set_' || lowerCasePropName == '_get_')){
                                                objForIndex[lowerCasePropName] = objForIndex[setGET];
                                                delete objForIndex[setGET];
                                            }
                                        }
                                    }

                                    if(propType == 'object' && (objForIndex.set || objForIndex.get)){
                                        objForDefine[index] = {
                                            configurable: Configurable,
                                            enumerable: Enumerable
                                        };

                                        if(objForIndex.set){
                                            isWhat(objForIndex.set) != 'function' && throwError('"set" must be a function', objForIndex);
                                            if(Context){
                                                objForDefine[index].set = objForIndex.set(Context);
                                                isWhat(objForDefine[index].set) != 'function' && throwError('With context, function "set" must return a function', objForIndex);
                                            }
                                            else{
                                                objForDefine[index].set = objForIndex.set;
                                            }
                                        }
                                        if(objForIndex.get){
                                            isWhat(objForIndex.get) != 'function' && throwError('"get" must be a function', objForIndex);
                                            if(Context){
                                                objForDefine[index].get = objForIndex.get(Context);
                                                isWhat(objForDefine[index].get) != 'function' && throwError('With context, function "get" must return a function', objForIndex);
                                            }
                                            else{
                                                objForDefine[index].get = objForIndex.get;
                                            }
                                        }
                                    }
                                    //_set_和_get_则自动转换成属性set和get，而非定义set/get方法
                                    else if(propType == 'object' && (objForIndex._set_ || objForIndex._get_)){
                                        objForIndex._set_ &&
                                        (isWhat(objForIndex._set_) == 'function' ? true : throwError('"_set_" must be a function', objForIndex)) &&
                                        DEFINE(objForIndex, {
                                            set: {
                                                value: objForIndex._set_,
                                                configurable: Configurable,
                                                enumerable: Enumerable,
                                                writable: Writable
                                            }
                                        });

                                        objForIndex._get_ &&
                                        (isWhat(objForIndex._get_) == 'function' ? true : throwError('"_get_" must be a function', objForIndex)) &&
                                        DEFINE(objForIndex, {
                                            get: {
                                                value: objForIndex._get_,
                                                configurable: Configurable,
                                                enumerable: Enumerable,
                                                writable: Writable
                                            }
                                        });

                                        delete objForIndex._set_;
                                        delete objForIndex._get_;
                                        objForDefine[index] = {
                                            value: objForIndex,
                                            configurable: Configurable,
                                            enumerable: Enumerable,
                                            writable: Writable
                                        };
                                    }
                                    else{
                                        objForDefine[index] = {
                                            value: Context == undefined ?
                                                (Clone ? cloneObj(objForIndex, Configurable, Enumerable, Writable) : objForIndex) :
                                                propType == 'function' ?
                                                    objForIndex(Context) :
                                                    (Clone ? cloneObj(objForIndex, Configurable, Enumerable, Writable) : objForIndex),
                                            configurable: Configurable,
                                            enumerable: Enumerable,
                                            writable: Writable
                                        };
                                        if(propType == 'function' && isWhat(objForDefine[index].value) != 'function'){
                                            throwError('With context, function must return a function', objForIndex);
                                        }
                                    }
                                }
                            }
                        }
                        else if(propType == 'function' && prop.name != ''){
                            if(prop.name.toLowerCase() == 'prototype'){
                                throwError('To define prototype, prop must be an object', prop);
                            }
                            else{
                                objForDefine[prop.name] = {
                                    value: Context == undefined ? prop : prop(Context),
                                    configurable: Configurable,
                                    enumerable: Enumerable,
                                    writable: Writable
                                };
                                if(isWhat(objForDefine[prop.name].value) != 'function'){
                                    throwError('With context, function must return a function', prop);
                                }
                            }
                        }
                        else{
                            throwError('DefineProps must be an Object or function with name', prop);
                        }
                    });

                    DEFINE(target, objForDefine);
                };

                var targetType = isWhat(Target);
                var propArray = isWhat(Properties) == 'array' ? Properties : [Properties];
                if(targetType == 'array'){
                    Target.forEach(function(item){
                        targetType = isWhat(item);
                        if(targetType == 'object' || targetType == 'function'){
                            define(item, targetType, propArray);
                        }
                        else{
                            return null;
                        }
                    });
                }
                else if(targetType == 'object' || targetType == 'function'){
                    define(Target, targetType, propArray)
                }
                else{
                    return null;
                }

                return isDefinePrototype ? isDefinePrototype : Target;
            }.bind(UTILS),
            configurable: false,
            enumerable: true,
            writable: false
        },
        cloneObj: {
            value: function CloneObject(Source, Configurable, Enumerable, Writable){
                Configurable = Configurable == undefined ? true : typeof Configurable == 'boolean' ? Configurable : true;
                Enumerable = Enumerable == undefined ? true : typeof Enumerable == 'boolean' ? Enumerable : true;
                Writable = Writable == undefined ? true : typeof Writable == 'boolean' ? Writable : true;

                var isWhat = this.isWhat;
                var define = this.GLOBAL.Object.defineProperties;
                var traverse = function(target){
                    var type = isWhat(target);
                    var index;
                    var string = '', array = [], object = {}, toDefine = {};
                    if(type == 'array'){
                        target.forEach(function(item, index){
                            array[index] = traverse(item);
                        });
                        return array;
                    }
                    else if(type == 'object'){
                        for(index in target){
                            toDefine[index] = {
                                value: traverse(target[index]),
                                configurable: Configurable,
                                enumerable: Enumerable,
                                writable: Writable
                            };
                            define(object, toDefine);
                        }
                        return object;
                    }
                    else if(type == 'regexp'){
                        return new RegExp(target);
                    }
                    else if(type == 'NOTString'){
                        for(index = 0; index < target.length; index++){
                            string = string + target.charAt(index);
                        }
                        return string;
                    }
                    else{
                        return target;
                    }
                };

                return traverse(Source);
            }.bind(UTILS),
            configurable: false,
            enumerable: true,
            writable: false
        },
        cloneFn: {
            value: function CloneFunction(source){
                if(this.isWhat(source) != 'function'){
                    this.throwError('Argument "source" must be a function', arguments);
                }

                var fn = function cloneFunction(){
                    return source.apply(this, arguments);
                };

                fn.cloneSource = source.toString();
                fn.cloneFnName = source.name;
                for(var index in source){
                    fn[index] = source[index];
                }
                return fn;
            }.bind(UTILS),
            configurable: false,
            enumerable: true,
            writable: false
        },
        curryFn: {
            value: function CurryFunction(curryingObj, fn, context){
                var isWhat = this.isWhat;
                if(isWhat(curryingObj) != 'object' || isWhat(fn) != 'function'){
                    this.throwError('CurryingFn arguments type error', {curryingObj: curryingObj, fn: fn});
                }

                var curryArray = [];
                for(var index in curryingObj){
                    curryArray[curryingObj[index].index] = curryingObj[index].value;
                }

                var convertArgu = this.convertArgu;
                var curryFn = function CurryingFunction(){
                    var context = context || this;
                    var Arguments = convertArgu(arguments);
                    curryArray.forEach(function(item, index){
                        Arguments.splice(index, 0, item);
                    });
                    fn.apply(context, Arguments);
                };
                curryFn.currySource = fn.toString();
                curryFn.curryName = fn.name;

                return curryFn;
            }.bind(UTILS),
            configurable: false,
            enumerable: true,
            writable: false
        },
        convertArgu: {
            value: function ConvertArgumentsToArray(target){
                return this.GLOBAL.Array.prototype.slice.call(target);
            }.bind(UTILS),
            configurable: false,
            enumerable: true,
            writable: false
        },
        mergeObj: {
            value: function MergeObject(){
                var isWhat = this.isWhat;
                var cloneObj = this.cloneObj;
                var _Array = this.GLOBAL.Array;

                var _clone;
                if(isWhat(arguments[arguments.length - 1]) == 'boolean'){
                    _clone = _Array.prototype.pop.call(arguments);
                }
                else{
                    _clone = true;
                }

                var traverse = function(dst, src){
                    var oneIs, anotherIs;
                    for(var index in src){
                        if(dst[index]){
                            oneIs = isWhat(dst[index]);
                            anotherIs = isWhat(src[index]);
                            if(oneIs == 'object' && anotherIs == 'object'){
                                traverse(dst[index], src[index]);
                            }
                            else if(oneIs == 'array' && anotherIs == 'array'){
                                dst[index] = dst[index].concat(src[index]);
                            }
                            else{
                                dst['_' + index + '_'] = src[index];
                            }
                        }
                        else{
                            dst[index] = src[index];
                        }
                    }
                };

                var mergeStack = [];
                _Array.prototype.forEach.call(arguments, function(item){
                    if(isWhat(item) == 'object'){
                        mergeStack.push(_clone ? cloneObj(item) : item);
                    }
                });
                var returnObj = mergeStack.shift();
                mergeStack.forEach(function(item){
                    traverse(returnObj, item);
                });
                return returnObj;
            }.bind(UTILS),
            configurable: false,
            enumerable: true,
            writable: false
        },
        throwError: {
            value: function throwError(message, errorObj){
                var OccurError = function OccurError(message, errorObj){
                    this.message = message;
                    this.occurWith = errorObj;
                };
                OccurError.prototype = new this.GLOBAL.Error();
                throw new OccurError(message, errorObj);
                return false;
            }.bind(UTILS),
            configurable: false,
            enumerable: true,
            writable: false
        },
        addEventEmitter: {
            value: function AddEventEmitterToPrototype(Prototype, EventStack){
                var defineProps = this.defineProps;
                var throwError = this.throwError;
                var isWhat = this.isWhat;
                var cloneObj = this.cloneObj;
                var convertArgu = this.convertArgu;

                if(typeof Prototype != 'object'){
                    throwError('Wrong arguments, "prototype" must be an object', arguments);
                }

                EventStack = (function(argu){
                    if(isWhat(EventStack) == 'object'){
                        if(isWhat(EventStack.fn) == 'function' &&
                           (isWhat(EventStack.argu) == undefined || isWhat(EventStack.argu) == 'array')){
                            return EventStack;
                        }
                        else{
                            var eventStack = EventStack;
                            return {
                                fn: function proxyGetEventStackFn(){
                                    return eventStack;
                                }
                            };
                        }
                    }
                    else{
                        return (function(){
                            var fn;
                            if(Prototype.__eventStack__ != undefined){
                                if(isWhat(Prototype.__eventStack__) == 'object'){
                                    fn = function proxyGetEventStackFn(){
                                        return this.__eventStack__;
                                    };
                                }
                                else{
                                    throwError("You'd better to run addEventEmitter with argument 'EventStack',because '__eventStack__' already exist in target and it's not an object", argu);
                                }
                            }
                            else{
                                fn = function proxyGetEventStackFn(){
                                    if(!this.__eventStack__){
                                        defineProps(this, {
                                            __eventStack__: {}
                                        }, true, false, false, false);
                                    }
                                    return this.__eventStack__;
                                };
                            }
                            return {
                                fn: fn
                            };
                        })();
                    }
                })(arguments);

                var getTargetEventStack = function(TargetArray){
                    var eventStack = [];
                    var get = function(target){
                        var targetType = isWhat(target);

                        if(targetType == 'object'){
                            var stack = EventStack.fn.apply(target, EventStack.argu);
                            if(isWhat(stack) == 'object'){
                                eventStack.push({
                                    self: target,
                                    stack: stack
                                });
                            }
                            else{
                                throwError("Target's eventStack is wrong", target);
                            }
                            return;
                        }
                        else if(targetType == 'array'){
                            target.forEach(function(obj){
                                get(obj);
                            });
                            return;
                        }
                        else if(targetType == 'arguments'){
                            var TargetArray = convertArgu(target);
                            TargetArray.forEach(function(obj){
                                get(obj);
                            });
                            return;
                        }
                        else{
                            throwError('Wrong target type', target);
                        }
                    };
                    get(TargetArray);
                    return eventStack;
                };

                var EventEmitter = {
                    on: function EventOn(event, times, fn, target){
                        var eventType = isWhat(event);
                        var timesType = isWhat(times);
                        var fnType = isWhat(fn);
                        var arguLength = arguments.length;
                        var eventSelf = this;

                        if(eventType != 'string'){
                            throwError("Wrong event, it's type must be a string", event);
                        }

                        switch(arguLength){
                            case 1:
                                throwError('Wrong arguments, "event" and "fn" is necessary', arguments);

                            case 2:
                                if(timesType != 'function'){
                                    throwError('Wrong arguments, can not found "fn"', arguments);
                                }
                                target = eventSelf;
                                fn = times;
                                times = 0;
                                break;

                            case 3:
                                if(timesType == 'number' && fnType == 'function'){
                                    target = eventSelf;
                                }
                                else if(timesType == 'function'){
                                    target = fn;
                                    fn = times;
                                    times = 0;
                                }
                                else{
                                    throwError('Wrong arguments, if there are three arguments, must be "event,times,fn"', arguments);
                                }
                                break;

                            default:
                                if(timesType == 'number' && fnType == 'function'){
                                    target = convertArgu(arguments).splice(0, 3);
                                }
                                else if(timesType == 'function'){
                                    target = convertArgu(arguments).splice(0, 2);
                                    fn = times;
                                    times = 0;
                                }
                                else{
                                    throwError('Wrong arguments, check it', arguments);
                                }
                        }

                        getTargetEventStack(target).forEach(function(EventStack){
                            if(EventStack.stack[event] == undefined){
                                EventStack.stack[event] = [];
                            }
                            EventStack.stack[event].push({
                                times: times,
                                fn: fn
                            });
                        });
                        return eventSelf;
                    },
                    getEventStackFn: function GetEventStackArray(event, target){
                        if(isWhat(event) != 'string'){
                            throwError("Wrong event, it's type must be a string", event);
                        }
                        return cloneObj(getTargetEventStack(target || this)[0].stack[event]) || throwError("Can not get the event's fn", arguments);
                    },
                    emitFreq: function EventEmitFrequently(event, target){
                        if(isWhat(event) != 'string'){
                            throwError("Wrong arguments, event must be a 'string'", arguments);
                        }
                        if(arguments.length > 2){
                            throwError('Wrong arguments, function emitFreq only can have one target', arguments)
                        }

                        target = target || this;

                        var eventStack = getTargetEventStack(target)[0].stack;
                        var eventArray = eventStack[event];
                        if(eventArray){
                            return function EventEmitFreqProxyFn(){
                                if(!eventStack){
                                    return;
                                }

                                var delStack = [];
                                eventArray.forEach(function(Event, EventIndex){
                                    Event.fn.apply(target, arguments);
                                    if(Event.times > 0){
                                        if(Event.times == 1){
                                            delStack.unshift(EventIndex);
                                        }
                                        else{
                                            Event.times--;
                                        }
                                    }
                                });
                                if(delStack[0] != undefined){
                                    delStack.forEach(function(delIndex){
                                        eventArray[delIndex] = null;
                                        delete eventArray[delIndex];
                                        eventArray.splice(delIndex, 1);
                                    });
                                }
                                if(eventArray[0] == undefined){
                                    eventArray = undefined;
                                    eventStack[event] = null;
                                    delete eventStack[event];
                                    eventStack = undefined;
                                }
                            };
                        }
                        else{
                            throwError('Can not find target event', arguments);
                        }
                    },
                    emit: function EventEmit(event, fnArguments, target){
                        var eventType = isWhat(event);
                        var fnArguType = isWhat(fnArguments);
                        var arguLength = arguments.length;
                        var eventSelf = this;

                        if(eventType != 'string'){
                            throwError("Wrong event, it's type must be a string", event);
                        }

                        switch(arguLength){
                            case 1:
                                fnArguments = [];
                                target = eventSelf;
                                break;

                            case 2:
                                if(fnArguType != 'array' || fnArguType != 'arguments'){
                                    throwError('Wrong arguments, callback arguments must be an "array" or "arguments"', arguments);
                                }
                                target = eventSelf;
                                break;

                            default:
                                if(fnArguType != 'array' || fnArguType != 'arguments'){
                                    throwError('Wrong arguments, callback arguments must be an "array" or "arguments"', arguments);
                                }
                                target = convertArgu(arguments).splice(0, 2);
                                break;
                        }

                        return getTargetEventStack(target).every(function(Target){
                            var eventArray = Target.stack[event];
                            var delStack = [];
                            if(eventArray != undefined){
                                eventArray.forEach(function(Event, EventIndex){
                                    Event.fn.apply(Target.self, fnArguments);
                                    if(Event.times > 0){
                                        if(Event.times == 1){
                                            delStack.unshift(EventIndex);
                                        }
                                        else{
                                            Event.times--;
                                        }
                                    }
                                });
                                if(delStack[0] != undefined){
                                    delStack.forEach(function(delIndex){
                                        eventArray[delIndex] = null;
                                        delete eventArray[delIndex];
                                        eventArray.splice(delIndex, 1);
                                    });
                                }
                                if(eventArray[0] == undefined){
                                    Target.stack[event] = null;
                                    delete Target.stack[event];
                                }
                                return true;
                            }
                            else{
                                if(DEVELOPMENT){
                                    console.log('trigger no exist event: ' + event);
                                }
                                return false;
                            }
                        });
                    },
                    off: function EventOff(event, fn, target){
                        var eventType = isWhat(event);
                        var fnType = isWhat(fn);
                        var arguLength = arguments.length;
                        var eventSelf = this;

                        if(eventType != 'string'){
                            throwError("Wrong event, it's type must be a string", event);
                        }

                        switch(arguLength){
                            case 1:
                                target = eventSelf;
                                break;

                            case 2:
                                if(fnType == 'string' || fnType == 'function'){
                                    target = eventSelf;
                                }
                                else{
                                    target = fn;
                                    fn = fnType = undefined;
                                }
                                break;

                            default:
                                if(fnType == 'string' || fnType == 'function'){
                                    target = convertArgu(arguments).splice(0, 2);
                                }
                                else{
                                    target = convertArgu(arguments).splice(0, 1);
                                    fn = fnType = undefined;
                                }
                        }

                        getTargetEventStack(target).forEach(function(Target){
                            var eventArray = Target.stack[event];
                            var delStack = [];

                            if(eventArray != undefined){
                                switch(fnType){
                                    case undefined:
                                        eventArray = [];
                                        break;

                                    case 'function':
                                        eventArray.forEach(function(Event, EventIndex){
                                            if(Event.fn == fn){
                                                delStack.unshift(EventIndex);
                                            }
                                        });
                                        break;

                                    case 'string':
                                        eventArray.forEach(function(Event, EventIndex){
                                            if(Event.fn.name == fn){
                                                delStack.unshift(EventIndex);
                                            }
                                        });
                                        break;
                                }

                                if(delStack[0] != undefined){
                                    delStack.forEach(function(delIndex){
                                        eventArray[delIndex] = null;
                                        delete eventArray[delIndex];
                                        eventArray.splice(delIndex, 1);
                                    });
                                }

                                if(eventArray[0] == undefined){
                                    Target.stack[event] == null;
                                    delete Target.stack[event];
                                }
                            }
                        });
                        return eventSelf;
                    },
                    /*
                     * target.cloneEvent('event', SOURCE, /optional for DESTINATION,default is target self/);
                     * SOURCE == Self will throwError;
                     * */
                    cloneEvent: function EventClone(event, src, target){
                        var eventType = isWhat(event);
                        var srcType = isWhat(src);
                        var arguLength = arguments.length;
                        var eventSelf = this;

                        if(eventType != 'string'){
                            throwError("Wrong event, it's type must be a string", event);
                        }

                        switch(arguLength){
                            case 1:
                                throwError('Wrong arguments, length at least be 2', arguments);
                                ;
                                break;

                            case 2:
                                target = eventSelf;
                                if(src == target){
                                    throwError('Wrong arguments, source and destination can not be same', arguments);
                                }
                                break;

                            default:
                                target = convertArgu(arguments).splice(0, 2);
                        }

                        var srcEventStack = (function(src){
                            var srcStackArray = getTargetEventStack(src);
                            var returnArray = [];
                            srcStackArray.forEach(function(source){
                                if(source.stack[event]){
                                    returnArray = returnArray.concat(cloneObj(source.stack[event]));
                                }
                            });
                            return returnArray;
                        })(src);

                        if(!srcEventStack[0]){
                            throwError("Can not found source's stack", src);
                        }

                        getTargetEventStack(target).forEach(function(Target){
                            var eventArray = Target.stack[event];
                            if(eventArray){
                                Target.stack[event] = eventArray.concat(cloneObj(srcEventStack));
                            }
                            else{
                                Target.stack[event] = cloneObj(srcEventStack)
                            }
                        });
                        return eventSelf;
                    },
                    listeners: function EventListeners(event, target){
                        var eventType = isWhat(event);
                        var eventSelf = this;
                        var arguLength = arguments.length;
                        var listeners = [];

                        if(eventType != 'string'){
                            throwError("Wrong event, it's type must be a string", event);
                        }

                        switch(arguLength){
                            case 1:
                                target = eventSelf;
                                break;

                            default:
                                target = convertArgu(arguments).splice(0, 1);
                        }

                        getTargetEventStack(target).forEach(function(Target){
                            if(Target.stack[event] != undefined){
                                listeners = listeners.concat(cloneObj(Target.stack[event]));
                            }
                        });
                        return listeners;
                    },
                    renameEvent: function ChangeEventName(event, name, clone, target){
                        var eventSelf = this;
                        var eventType = isWhat(event);
                        var nameType = isWhat(name);
                        var cloneType = isWhat(clone);

                        if(eventType != 'string' || nameType != 'string'){
                            throwError("Wrong event, it's type must be a string", event);
                        }

                        var arguLength = arguments.length;
                        switch(arguLength){
                            case 2:
                                target = eventSelf;
                                clone = false;
                                break;

                            case 3:
                                if(cloneType == 'boolean'){
                                    target = eventSelf;
                                }
                                else{
                                    target = clone;
                                    clone = false;
                                }
                                break;

                            default:
                                if(cloneType == 'boolean'){
                                    target = convertArgu(arguments).splice(0, 3);
                                }
                                else{
                                    target = convertArgu(arguments).splice(0, 2);
                                    clone = false;
                                }
                        }
                        getTargetEventStack(target).forEach(function(Target){
                            if(Target.stack[event] != undefined && Target.stack[name] == undefined){
                                if(clone){
                                    Target.stack[name] = cloneObj(Target.stack[event]);
                                }
                                else{
                                    Target.stack[name] = Target.stack[event];
                                    Target.stack[event] = null;
                                    delete Target.stack[event];
                                }
                            }
                            else{
                                throwError('Wrong event name', {event: event, rename: name})
                            }
                        });
                        return eventSelf;
                    }
                };

                if(Prototype.on != undefined ||
                   Prototype.emit != undefined ||
                   Prototype.off != undefined ||
                   Prototype.cloneEvent != undefined ||
                   Prototype.listeners != undefined ||
                   Prototype.renameEvent != undefined ||
                   Prototype.getEventStackFn != undefined){
                    throwError('The Prototype has owned EventEmitter method,check again', Prototype);
                }

                defineProps(Prototype, EventEmitter, true, false, false, false);
            }.bind(UTILS),
            configurable: false,
            enumerable: true,
            writable: false
        }
    });

    //GLOBAL.Object.defineProperties(UTILS, {});

    //Framework Constructor
    var App = function DynamicDocumentGlobalObject(init){
        var GLOBAL = App.fn.GLOBAL;
        var AppConstructor = App.fn.PROTO._AppConstructor;
        var globalName = init == undefined ? GLOBAL_INSTANCE_NAME : init.GLOBAL_INSTANCE_NAME ? init.GLOBAL_INSTANCE_NAME : GLOBAL_INSTANCE_NAME;

        if(this instanceof AppConstructor){
            var PROTO = this.PROTO;
            var _privateProps_ = {
                _webWorker: undefined,
                _dynDocMiddleWare: PROTO._DynDocConstructor.MiddleWare(this)
            };

            var defineProps = this.UTILS.defineProps;
            defineProps(_privateProps_, PROTO._AppInstancePrivateProps, true, true, true, true);
            defineProps(this, {appSelf: this}, false, false, false, false);
            defineProps(this, PROTO._AppInstanceMethod, true, false, false, false, _privateProps_);

            var INSTANCEtoDefine = {};
            INSTANCEtoDefine[globalName] = this;
            defineProps(this.APP_INSTANCES, INSTANCEtoDefine, false, false, true, false);
        }
        else{
            if(GLOBAL[globalName]){
                App.fn.UTILS.throwError(globalName + ' is already in global,try another name', globalName);
            }
            else{
                return GLOBAL[globalName] = new AppConstructor(init);
            }
        }
    };
    UTILS.defineProps(App, {prototype: {}}, false); //Auto handle constructor
    UTILS.defineProps(App, {
        fn: App.prototype,
        InheritPrototype: function(constructor){
            constructor = constructor || this;
            var Inherit = function InheritPrototype(){
                //empty object constructor,only inherit constructor's prototype
            };
            Inherit.prototype = constructor.prototype;
            return new Inherit();
        }
    }, false, false, false, false);

    var DynDoc = function DynDoc(appSelf, JSONdynDoc, JSONidName){
        var DynDocConstructor = appSelf.PROTO._DynDocConstructor;

        if(this instanceof DynDocConstructor){
            var _privateProps_ = {
                _self: this
            };
            var defineProps = appSelf.UTILS.defineProps;
            var PROTO = appSelf.PROTO;

            defineProps(_privateProps_, PROTO._DynDocInstancePrivateProps, true, true, true, true);
            _privateProps_._DOM = appSelf._createElement(JSONidName);
            _privateProps_._idName = JSONidName;
            _privateProps_._inDOM = false;
            _privateProps_._content = JSONdynDoc.content || undefined;

            defineProps(this, PROTO._DynDocInstanceMethod, true, false, false, false, _privateProps_);

            /*if(JSONidName != 'master'){
                appSelf.__getPrivateProps__(SECRET)._all[JSONidName] = this;
            }*/
            //this.style = JSONdynDoc.style;
            appSelf.__getPrivateProps__(SECRET)._all[JSONidName] = this;
        }
        else{
            return new DynDocConstructor(appSelf, JSONdynDoc, JSONidName);
        }
    };
    UTILS.defineProps(DynDoc, {
        fn: App.InheritPrototype(App),
        MiddleWare: function(appSelf){
            var defineProps = appSelf.UTILS.defineProps;
            var DynDocMiddleWare = function DynDocMiddleWare(){
                defineProps(this, {appSelf: appSelf}, false, false, false, false);
                defineProps(this, this.appSelf.PROTO._DynDocMiddleWareMethod, true, false, false, false)
            };
            DynDocMiddleWare.prototype = this.fn;
            return new DynDocMiddleWare();
        }
    }, false, false, false, false);
    UTILS.defineProps(DynDoc.fn, {
        constructor: DynDoc
    }, false, false, false, false);

    //Define framework properties
    UTILS.defineProps(App.fn, {
        GLOBAL: GLOBAL,
        VERSION: VERSION,
        ENVIRONMENT: ENVIRONMENT,
        RUN_IN: RUN_IN,
        SECRET: DEVELOPMENT ? SECRET : 'Ops...',
        UTILS: UTILS,
        PROTO: {},
        APP_INSTANCES: {},
        appSelf: App.fn,
        extend: function ExtendAppModule(){
            var appSelf = this.appSelf,
                isWhat = appSelf.UTILS.isWhat,
                throwError = appSelf.UTILS.throwError,
                defineProps = appSelf.UTILS.defineProps,
                mergeObj = appSelf.UTILS.mergeObj,
                cloneObj = appSelf.UTILS.cloneObj,
                PROTO = appSelf.PROTO,
                isInstance = appSelf == PROTO._AppPrototype ? false : appSelf instanceof PROTO._AppConstructor ? true : undefined;

            var extendModule = function(extendModule, InstancePrivateProps, InstanceMethod, MiddleWare, Prototype, module){
                var extendPrivate = function(privateProps){
                    var defineStack = [], index;
                    for(index in privateProps){
                        extendModule.privateProps[index] && throwError('The name already in privateProps', privateProps);
                    }
                    defineProps(InstancePrivateProps, privateProps, true, false, true, false);
                    if(isInstance){
                        switch(Prototype){
                            case PROTO._AppPrototype:
                                for(index in appSelf.APP_INSTANCES){
                                    defineStack.push(appSelf.APP_INSTANCES[index].__getPrivateProps__(SECRET));
                                }
                                break;
                            case PROTO._DynDocPrototype:
                                for(index in appSelf.all){
                                    defineStack.push(appSelf.all[index].__getPrivateProps__(SECRET));
                                }
                                break;
                        }
                        defineProps(defineStack, privateProps, true, true, true, true);
                    }
                };
                var extendInstance = function(instance){
                    var objForDefine = cloneObj(instance), objForIndex, index;

                    for(index in instance){
                        extendModule.instance[index] && throwError('The name already in instance', instance);
                        extendModule.prototype[index] && throwError('The name already in prototype', instance);
                        extendModule.middleWare && extendModule.middleWare[index] && throwError('The name already in middleWare', instance);

                        objForIndex = instance[index];

                        if(objForIndex.get && isWhat(objForIndex.get) == 'function'){
                            objForDefine[index] = {
                                _get_: objForIndex.get
                            };
                            delete objForDefine[index].get;

                            if(objForIndex.set && isWhat(objForIndex.set) == 'function'){
                                objForDefine[index]._set_ = objForIndex.set;
                                delete objForDefine[index].set;
                            }
                            else{
                                objForDefine[index]._set_ = (function(index){
                                    return function(){
                                        return function(err){
                                            console.log('Cant set ' + index + ' to ' + err);
                                        };
                                    };
                                })(index);
                            }
                        }
                    }
                    defineProps(InstanceMethod, objForDefine, false, false, true, false);

                    if(isInstance){
                        switch(Prototype){
                            case PROTO._AppPrototype:
                                for(index in appSelf.APP_INSTANCES){
                                    defineProps(appSelf.APP_INSTANCES[index], instance, true, false, false, false, appSelf.APP_INSTANCES[index].__getPrivateProps__(SECRET));
                                }
                                break;
                            case PROTO._DynDocPrototype:
                                for(index in appSelf.all){
                                    defineProps(appSelf.all[index], instance, true, false, false, false, appSelf.all[index].__getPrivateProps__(SECRET));
                                }
                                break;
                        }

                    }
                };
                var extendMiddleWare = function(middleWare){
                    var defineStack = [], middleObject, index;
                    for(index in middleWare){
                        extendModule.instance[index] && throwError('The name already in instance', middleWare);
                        extendModule.prototype[index] && throwError('The name already in prototype', middleWare);
                        extendModule.middleWare && extendModule.middleWare[index] && throwError('The name already in middleWare', middleWare);
                    }
                    defineProps(MiddleWare, middleWare, true, false, true, false);

                    if(isInstance){
                        for(index in appSelf.APP_INSTANCES){
                            defineStack.push(appSelf.APP_INSTANCES[index].__getPrivateProps__(SECRET)._dynDocMiddleWare);
                        }
                        defineProps(defineStack, middleWare, true, false, false, false);
                    }
                };
                var extendPrototype = function(prototype){
                    var objForIndex, objForDefine = cloneObj(prototype);
                    for(var index in prototype){
                        extendModule.instance[index] && throwError('The name already in instance', module.prototype);
                        extendModule.prototype[index] && throwError('The name already in prototype', module.prototype);
                        extendModule.middleWare && extendModule.middleWare[index] && throwError('The name already in middleWare', module.prototype);

                        objForIndex = prototype[index];
                        if(objForIndex.get &&
                           isWhat(objForIndex.get) == 'function' &&
                           (!objForIndex.set || isWhat(objForIndex.set) != 'function')){
                            objForDefine[index].set = (function(index){
                                return function(err){
                                    console.log('Cant set ' + index + ' to ' + err);
                                };
                            })(index);
                        }
                    }
                    defineProps(Prototype, objForDefine, false, false, false, false);
                };

                for(var moduleIndex in module){
                    if(moduleIndex == 'privateProps'){
                        if(isWhat(module.privateProps) == 'object'){
                            extendPrivate(module.privateProps);
                        }
                        else{
                            throwError('"privateProps" must be an object', module);
                        }
                    }
                    else if(moduleIndex == 'instance'){
                        if(isWhat(module.instance) == 'object'){
                            extendInstance(module.instance);
                        }
                        else{
                            throwError('"instance" must be an object', module);
                        }
                    }
                    else if(moduleIndex == 'middleWare'){
                        if(MiddleWare == undefined){
                            throwError('App has no middleWare module', module);
                        }
                        else if(isWhat(module.middleWare) == 'object'){
                            extendMiddleWare(module.middleWare);
                        }
                        else{
                            throwError('"middleWare" must be an object', module);
                        }
                    }
                    else if(moduleIndex == 'prototype'){
                        if(isWhat(module.prototype) == 'object'){
                            extendPrototype(module.prototype);
                        }
                        else{
                            throwError('"prototype" must be an object', module);
                        }
                    }
                    else{
                        throwError('ExtendModule name wrong, must be "privateProps" or "instance" or "middleWare" or "prototype"', module);
                    }
                }
            };

            Array.prototype.forEach.call(arguments, function(item){
                var index,objForIndex;
                if(isWhat(item) == 'object'){
                    for(index in item){
                        if(index == 'App'){
                            if(isWhat(item.App) == 'object'){
                                extendModule(PROTO._AllExtendModules.App, PROTO._AppInstancePrivateProps, PROTO._AppInstanceMethod, undefined, PROTO._AppPrototype, item.App);
                                PROTO._AllExtendModules.App = mergeObj(PROTO._AllExtendModules.App, item.App);
                            }
                            else{
                                throwError('"App" must be an object', item);
                            }
                        }
                        else if(index == 'DynDoc'){
                            if(isWhat(item.DynDoc) == 'object'){
                                extendModule(PROTO._AllExtendModules.DynDoc, PROTO._DynDocInstancePrivateProps, PROTO._DynDocInstanceMethod, PROTO._DynDocMiddleWareMethod, PROTO._DynDocPrototype, item.DynDoc);
                                PROTO._AllExtendModules.DynDoc = mergeObj(PROTO._AllExtendModules.DynDoc, item.DynDoc);
                            }
                            else{
                                throwError('"DynDoc" must be an object', item);
                            }
                        }
                        else{
                            throwError('ExtendModule name wrong, must be "App" or "DynDoc"', item);
                        }
                    }
                }
                else{
                    throwError('Arguments must be an object', item);
                }
            });
        }

    }, false, false, false, false);
    UTILS.defineProps(App.fn.PROTO, {
        _AppPrototype: App.fn,
        _AppInstanceMethod: {},
        _AppInstancePrivateProps: {},
        _AppConstructor: App,
        _DynDocPrototype: DynDoc.fn,
        _DynDocInstanceMethod: {},
        _DynDocInstancePrivateProps: {},
        _DynDocConstructor: DynDoc,
        _DynDocMiddleWareMethod: {},
        _AllExtendModules: {
            App: {
                privateProps: {},
                instance: {},
                prototype: {}
            },
            DynDoc: {
                privateProps: {},
                instance: {},
                middleWare: {},
                prototype: {}
            }
        }
    }, false, false, true, false);

/* ------------------ extend module ------------------ */

    //handle Logs
    App.fn.extend({
        App: {
            privateProps: {
                _log: {
                    queueIndex: 0,
                    logs: []
                }
            },
            prototype: {
                _nullFn: function NullFunction(){
                    return {};
                },
                log: {
                    get: function(){
                        var appSelf = this.appSelf;
                        return DEVELOPMENT ? appSelf.UTILS.defineProps({}, {
                            add: function addLogs(event, message, successful, occurWith, objType){
                                var _log = appSelf.__getPrivateProps__(SECRET)._log
                                successful = appSelf.UTILS.isWhat(successful) == 'boolean' ? successful : true;

                                switch(objType){
                                    case 'JSON':
                                        occurWith = appSelf.GLOBAL.JSON.stringify(occurWith);
                                        break;
                                    case undefined:
                                        occurWith = successful ? null : occurWith;
                                        break;
                                    default:
                                        break;
                                }

                                var logObject = {
                                    message: message,
                                    time: (new Date()).toString(),
                                    queueIndex: _log.queueIndex,
                                    occurWith: occurWith,
                                    event: event,
                                    type: objType == undefined ? 'NormalObject' : objType,
                                    successful: successful
                                };

                                _log.queueIndex++;
                                _log.logs.push(logObject);
                            },
                            show: function(logType){
                                var returnObj;
                                var _log = appSelf.__getPrivateProps__(SECRET)._log;
                                switch(logType){
                                    case 'JSON':
                                        returnObj = '';
                                        _log.logs.forEach(function(log){
                                            returnObj = returnObj + appSelf.GLOBAL.JSON.stringify(log);
                                        });
                                        break;
                                    case 'object':
                                        returnObj = {};
                                        _log.logs.forEach(function(log, index){
                                            returnObj['_' + index.toString() + '_'] = log;
                                        });
                                        break;
                                    case 'array':
                                        returnObj = _log.logs;
                                        break;
                                    case 'last':
                                        returnObj = _log.logs[_log.queueIndex - 1];
                                        break;
                                    case 'successful':
                                        returnObj = [];
                                        _log.logs.forEach(function(log){
                                            if(log.successful){
                                                returnObj.push(log);
                                            }
                                        });
                                        returnObj = returnObj[0] == undefined ? null : returnObj;
                                        break;
                                    case 'failed':
                                        returnObj = [];
                                        _log.logs.forEach(function(log){
                                            if(!log.successful){
                                                returnObj.push(log);
                                            }
                                        });
                                        returnObj = returnObj[0] == undefined ? null : returnObj;
                                        break;
                                    case 3:
                                        returnObj = [];
                                        if(_log.queueIndex > 2){
                                            for(var i = 1; i < 4; i++){
                                                returnObj.push(_log.logs[_log.queueIndex - 4 + i]);
                                                console.log(_log.logs[_log.queueIndex - 4 + i]);
                                            }
                                        }
                                        else{
                                            _log.logs.forEach(function(log){
                                                returnObj.push(log);
                                                console.log(log);
                                            });
                                        }
                                        break;
                                    default:
                                        _log.logs.forEach(function(log){
                                            console.log(log);
                                        });
                                        return 'Look at the console';
                                }
                                return returnObj;
                            },
                            reset: {
                                get: function(){
                                    return (function(){
                                        var _log = appSelf.__getPrivateProps__(SECRET)._log;
                                        _log.queueIndex = 0;
                                        _log.logs = [];
                                        return 'done';
                                    })();
                                }
                            }
                        }) : {
                            add: appSelf._nullFn,
                            show: appSelf._nullFn,
                            reset: appSelf._nullFn
                        };
                    }
                },
                addLog: {
                    get:function(){
                        var appSelf = this.appSelf;
                        return function(message, event, successful, occurWith, objType){
                            var logObject, _log;
                            if(DEVELOPMENT){
                                _log = appSelf.__getPrivateProps__(SECRET)._log
                                successful = appSelf.UTILS.isWhat(successful) == 'boolean' ? successful : true;

                                switch(objType){
                                    case 'JSON':
                                        occurWith = appSelf.GLOBAL.JSON.stringify(occurWith);
                                        break;
                                    case undefined:
                                        occurWith = successful ? null : occurWith;
                                        break;
                                    default:
                                        break;
                                }

                                logObject = {
                                    message: message,
                                    time: (new Date()).toString(),
                                    queueIndex: _log.queueIndex,
                                    occurWith: occurWith,
                                    event: event,
                                    type: objType == undefined ? 'NormalObject' : objType,
                                    successful: successful
                                };

                                _log.queueIndex++;
                                _log.logs.push(logObject);
                            }
                            else{
                                message = occurWith = objType = event = successful = null;
                            }
                        };
                    }
                },
                showLogs: {
                    get:function(){
                        var appSelf = this.appSelf;
                        return function(logType){
                            var returnObj;
                            var _log = appSelf.__getPrivateProps__(SECRET)._log;
                            switch(logType){
                                case 'JSON':
                                    returnObj = '';
                                    _log.logs.forEach(function(log){
                                        returnObj = returnObj + appSelf.GLOBAL.JSON.stringify(log);
                                    });
                                    break;
                                case 'object':
                                    returnObj = {};
                                    _log.logs.forEach(function(log, index){
                                        returnObj['_' + index.toString() + '_'] = log;
                                    });
                                    break;
                                case 'array':
                                    returnObj = _log.logs;
                                    break;
                                case 'last':
                                    returnObj = _log.logs[_log.queueIndex - 1];
                                    break;
                                case 'successful':
                                    returnObj = [];
                                    _log.logs.forEach(function(log){
                                        if(log.successful){
                                            returnObj.push(log);
                                        }
                                    });
                                    returnObj = returnObj[0] == undefined ? null : returnObj;
                                    break;
                                case 'failed':
                                    returnObj = [];
                                    _log.logs.forEach(function(log){
                                        if(!log.successful){
                                            returnObj.push(log);
                                        }
                                    });
                                    returnObj = returnObj[0] == undefined ? null : returnObj;
                                    break;
                                case 3:
                                    returnObj = [];
                                    if(_log.queueIndex > 2){
                                        for(var i = 1; i < 4; i++){
                                            returnObj.push(_log.logs[_log.queueIndex - 4 + i]);
                                            console.log(_log.logs[_log.queueIndex - 4 + i]);
                                        }
                                    }
                                    else{
                                        _log.logs.forEach(function(log){
                                            returnObj.push(log);
                                            console.log(log);
                                        });
                                    }
                                    break;
                                default:
                                    _log.logs.forEach(function(log){
                                        console.log(log);
                                    });
                                    return 'Look at the console';
                            }
                            return returnObj;
                        };
                    }
                },
                resetLog: {
                    get:function(){

                    }
                },
                showme: function(){
                    console.log(this);
                }
            }
        }
    });

    //add method that access privateProps,example that there are two ways to extend a instance method
    App.fn.extend({
        App: {
            instance: {
                __getPrivateProps__: {
                    get: function(_privateProps_){
                        return function(){
                            return function GetAppPrivateProperties(secret){
                                return secret == SECRET ? _privateProps_ : false;
                            };
                        }
                    }
                }
            }
        },
        DynDoc: {
            instance: {
                __getPrivateProps__: function(_privateProps_){
                    return function GetDynDocPrivateProperties(secret){
                        return secret == SECRET ? _privateProps_ : false;
                    };
                }
            }
        }
    });

    //handle DynDoc
    App.fn.extend({
        App: {
            privateProps: {
                _all: {},
                _inDOM: {},
                _DynDocJSONProto: {}
            },
            prototype: {
                is: {
                    get: function(){
                        if(this.appSelf == this){
                            return this instanceof this.PROTO._AppConstructor ? 'App' : 'unknown';
                        }
                        else{
                            return this instanceof this.PROTO._DynDocConstructor ? 'DynDoc' : 'unknown';
                        }
                    }
                },
                all: {
                    get: function(){
                        var returnValue = {};
                        var all = this.appSelf.__getPrivateProps__(SECRET)._all;
                        for(var index in all){
                            returnValue[index] = all[index];
                        }
                        return returnValue
                    }
                },
                allInDOM: {
                    get: function(){
                        var returnValue = {};
                        var inDOM = this.appSelf.__getPrivateProps__(SECRET)._inDOM;
                        for(var index in inDOM){
                            returnValue[index] = inDOM[index];
                        }
                        return returnValue;
                    }
                },
                DJProto: {
                    get: function(){
                        var appSelf = this.appSelf;
                        return appSelf.UTILS.mergeObj({}, appSelf.__getPrivateProps__(SECRET)._DynDocJSONProto, true);
                    }
                },
                create: function CreateAndAppendNewDynDoc(){
                    var appSelf = this.appSelf;
                    var log = appSelf.UTILS.curryFn({
                        event: {
                            index: 0,
                            value: 'create'
                        }
                    }, appSelf.log.add, appSelf);
                    var isWhat = appSelf.UTILS.isWhat;
                    var mergeObj = appSelf.UTILS.mergeObj;

                    var privateProps = appSelf.__getPrivateProps__(SECRET);
                    var allDynDoc = privateProps._all;
                    var JSONProto = privateProps._DynDocJSONProto;

                    //动态改变DynDoc构造函数的原型，为app实例的私有属性privateProps的middleWare
                    appSelf.PROTO._DynDocConstructor.prototype = privateProps._dynDocMiddleWare;

                    var createOne = function(JSONdynDoc, JSONidName){
                        if(JSONidName == 'master'){
                            if(allDynDoc.master){
                                log('MASTER is ONLY-ONE,init failed!', false, JSONdynDoc, 'JSON');
                                return false;
                            }
                            appSelf._initMaster(JSONdynDoc);
                            return;
                        }
                        else if(allDynDoc[JSONidName]){
                            log('"' + JSONidName + '" already exist', false, JSONdynDoc, 'JSON');
                            return false;
                        }
                        else{
                            appSelf.PROTO._DynDocConstructor(appSelf, JSONdynDoc, JSONidName);
                            log('"' + JSONidName + '" init successful!', true, JSONdynDoc, 'JSON');
                        }
                    };

                    var traverse = function(fatherJSON, fatherIdName){
                        if(fatherJSON.children){
                            for(var childrenIndex in fatherJSON.children){
                                createOne(fatherJSON.children[childrenIndex], childrenIndex);
                                allDynDoc[fatherIdName].addChild(allDynDoc[childrenIndex]);
                                allDynDoc[childrenIndex].style = fatherJSON.children[childrenIndex].style;
                                traverse(fatherJSON.children[childrenIndex], childrenIndex);
                            }
                        }
                    };

                    Array.prototype.forEach.call(arguments, function(JSON){
                        if(isWhat(JSON) == 'object' && JSON.DESCRIPTION == 'DynDoc'){
                            delete JSON.DESCRIPTION;
                            mergeObj(JSONProto, JSON, false);
                            for(var index in JSON){
                                if(isWhat(JSON[index]) == 'object' && JSON[index].style && JSON[index].content){
                                    createOne(JSON[index], index);
                                    allDynDoc[index].style = JSON[index].style;
                                    traverse(JSON[index], index);
                                }
                                else{
                                    log('Wrong JSON Format,check and try to create it again!', false, JSON[index])
                                    return false;
                                }
                            }
                        }
                        else{
                            log('Wrong JSON Format,check and try to create it again!', false, JSON)
                            return false;
                        }
                    });
                    return this;
                },
                _handleArguments: function HandleArgumentsForAppDynDocFn(ARGUMENTS, fn, fnParameter, context){
                    context = context || this;

                    var appSelf = this.appSelf;
                    var isWhat = appSelf.UTILS.isWhat;
                    var failedStack = [];

                    var handle = function(target, parameter){
                        var targetType;

                        //Clone this array,otherwise it wont work because closure
                        parameter = parameter ? appSelf.GLOBAL.Array.prototype.slice.call(parameter) : [];

                        if(target.is == 'DynDoc' || target.is == 'App'){
                            parameter.unshift(target);
                            fn.apply(context, parameter);
                        }
                        else if((targetType = isWhat(target)) == 'string'){
                            target = target.split(',');
                            target.forEach(function(Target){
                                var isDynDoc = appSelf.all[Target];
                                var isApp = appSelf.APP_INSTANCES[Target];
                                if(isDynDoc){
                                    parameter.unshift(isDynDoc);
                                    fn.apply(context, parameter);
                                }
                                else if(isApp){
                                    parameter.unshift(isApp);
                                    fn.apply(context, parameter);
                                }
                                else{
                                    failedStack.push(Target);
                                }
                            });
                        }
                        else if(targetType == 'array'){
                            target.forEach(function(Target){
                                handle(Target, parameter);
                            });
                        }
                        else{
                            failedStack.push(target);
                        }
                    };

                    var ArgumentType = isWhat(ARGUMENTS);
                    if(ArgumentType == 'arguments' || ArgumentType == 'array'){
                        appSelf.GLOBAL.Array.prototype.forEach.call(ARGUMENTS, function(item){
                            handle(item, fnParameter);
                        });
                        return failedStack;
                    }
                    else{
                        appSelf.UTILS.throwError('Arguments type error', ARGUMENTS);
                        return false;
                    }
                },
                isolate: function IsolateDynDocFromFather(){
                    var appSelf = this.appSelf;

                    var logStack = {
                        success: [],
                        failed: undefined
                    };

                    var isolateTarget = function(target){
                        var targetProps = target.__getPrivateProps__(SECRET);
                        //master不能脱离father,如果target为master，则fatherProps为undefined，如果没有father，则为false
                        var fatherProps = targetProps._idName == 'master' ? undefined : targetProps._father ? targetProps._father.__getPrivateProps__(SECRET) : false;
                        if(!fatherProps){
                            if(fatherProps == undefined){
                                logStack.failed.push('master');
                            }
                            if(fatherProps == false){
                                logStack.failed.push(target);
                            }
                            return;
                        }
                        appSelf._removeChild(fatherProps, targetProps);
                        targetProps._father = undefined;
                        delete fatherProps._children[targetProps._idName];
                        fatherProps._childLength--;
                        appSelf._parseCSS('SRA', target);
                        logStack.success.push({father: fatherProps._idName, child: targetProps._idName})
                    };

                    logStack.failed = appSelf._handleArguments(arguments, isolateTarget);

                    var eventType = 'isolate';
                    if(logStack.success[0] != undefined){
                        logStack.success.forEach(function(msg){
                            appSelf.log.add(eventType, msg.child + ' isolate from ' + msg.father + ' successful');
                        });
                    }
                    if(logStack.failed[0] != undefined){
                        logStack.failed.forEach(function(msg){
                            appSelf.log.add(eventType, 'isolate failed', false, msg);
                        });
                    }
                    return this;
                },
                del: function DeleteDynDoc(){
                    var appSelf = this.appSelf;
                    var appProps = appSelf.__getPrivateProps__(SECRET);
                    var logStack = {
                        success: [],
                        failed: undefined
                    };

                    var delTarget = function(target, all){
                        var stack = [target];
                        var del = function(item){
                            var itemProps = item.__getPrivateProps__(SECRET);
                            var itemName = itemProps._idName;
                            for(var index in itemProps){
                                itemProps[index] = null;
                                delete itemProps[index];
                            }

                            appProps._all[itemName] = null;
                            appProps._inDOM[itemName] = null;
                            delete appProps._all[itemName];
                            delete appProps._inDOM[itemName];
                            logStack.success.push(itemName);
                            index = itemName = itemProps = item = null;
                        }

                        if(all){
                            var selectAll = function(target){
                                if(target.childLength > 0){
                                    var prop = target.__getPrivateProps__(SECRET);
                                    for(var index in prop._children){
                                        stack.push(prop._children[index]);
                                        selectAll(prop._children[index]);
                                    }
                                }
                            };
                            selectAll(target);
                            appSelf.isolate(stack);
                            stack.forEach(del);
                        }
                        else{
                            if(target.childLength > 0){
                                var targetChildren = target.__getPrivateProps__(SECRET)._children;
                                for(var index in targetChildren){
                                    stack.push(targetChildren[index]);
                                }
                            }
                            appSelf.isolate(stack);
                            del(target);
                        }
                    };

                    var all = false;
                    var Arguments = appSelf.GLOBAL.Array.prototype.slice.call(arguments);
                    if(typeof Arguments[Arguments.length - 1] == 'boolean'){
                        all = Arguments.pop();
                    }

                    logStack.failed = appSelf._handleArguments(Arguments, delTarget, [all]);

                    var eventType = 'del';
                    if(logStack.success[0] != undefined){
                        logStack.success.forEach(function(msg){
                            appSelf.log.add(eventType, 'Delete ' + msg + ' successful');
                        });
                    }
                    if(logStack.failed[0] != undefined){
                        logStack.failed.forEach(function(msg){
                            appSelf.log.add(eventType, 'Delete failed', false, msg);
                        });
                    }
                    return this;
                }
            }
        },
        DynDoc: {
            privateProps: {
                _idName: undefined,
                _inDOM: undefined,
                _children: {},
                _childLength: 0,
                _content: undefined,
                _father: undefined,
                _style: {
                    _top_a: 0,
                    _top_r: 0,
                    _top: 0,
                    _left_a: 0,
                    _left_r: 0,
                    _left: 0,
                    _width_a: 0,
                    _width_r: 0,
                    _width: 0,
                    _height_a: 0,
                    _height_r: 0,
                    _height: 0,
                    _layer: 0,
                    _color: 'black',
                    _backgroundColor: undefined,
                    _zIndex: 0
                },
                _DOM: undefined
            },
            prototype: {
                idName: {
                    get: function(){
                        return this.__getPrivateProps__(SECRET)._idName;
                    }
                },
                inDOM: {
                    get: function(){
                        return this.__getPrivateProps__(SECRET)._inDOM;
                    }
                },
                children: {
                    get: function(){
                        var returnValue = {};
                        var children = this.__getPrivateProps__(SECRET)._children;
                        for(var index in children){
                            returnValue[index] = children[index];
                        }
                        return returnValue;
                    }
                },
                childLength: {
                    get: function(){
                        return this.__getPrivateProps__(SECRET)._childLength;
                    }
                },
                content: {
                    get: function(){
                        return this.__getPrivateProps__(SECRET)._content;
                    }
                },
                father: {
                    get: function(){
                        return this.__getPrivateProps__(SECRET)._father;
                    }
                },
                style: {
                    set: function(css){
                        if(typeof css == 'object'){
                            if(!css.layer){
                                this.appSelf._parseCSS('CSS', this, 'layer', 1);
                            }
                            for(var cssIndex in css){
                                this.appSelf._parseCSS('CSS', this, cssIndex, css[cssIndex]);
                            }
                        }
                        else{
                            return false;
                        }
                    },
                    get: function(){
                        var _style_ = this.__getPrivateProps__(SECRET)._style;
                        return {
                            top: {
                                absolute: _style_._top_a,
                                relative: _style_._top_r,
                                actualValue: _style_._top
                            },
                            left: {
                                absolute: _style_._left_a,
                                relative: _style_._left_r,
                                actualValue: _style_._left
                            },
                            width: {
                                absolute: _style_._width_a,
                                relative: _style_._width_r,
                                actualValue: _style_._width
                            },
                            height: {
                                absolute: _style_._height_a,
                                relative: _style_._height_r,
                                actualValue: _style_._height
                            },
                            layer: _style_._layer,
                            zIndex: _style_._layer
                        };
                    }
                },
                addChild: function AddChildForDynDoc(){
                    var eventType = 'addChild';
                    if(this.is != 'DynDoc'){
                        this.log.add(eventType, 'addChild failed with wrong object', false, this);
                        return this;
                    }

                    var dynDocSelf = this;
                    var appSelf = dynDocSelf.appSelf;
                    var dynDocProps = dynDocSelf.__getPrivateProps__(SECRET);
                    var logStack = {
                        success: [],
                        failed: undefined //wait for return
                    };


                    var addOne = function(child){
                        var childProps = child.__getPrivateProps__(SECRET);
                        var originalFatherProps = childProps._father ? childProps._father.__getPrivateProps__(SECRET) : false;

                        appSelf._appendChild(dynDocProps, childProps);
                        dynDocProps._children[childProps._idName] = child;
                        dynDocProps._childLength++;
                        childProps._father = dynDocSelf;

                        if(originalFatherProps){
                            delete originalFatherProps._children[childProps._idName];
                            originalFatherProps._childLength--;
                        }

                        appSelf._parseCSS('SRA', child);
                        logStack.success.push(childProps._idName);
                    };

                    logStack.failed = appSelf._handleArguments(arguments, addOne);

                    if(logStack.success[0] != undefined){
                        logStack.success.forEach(function(msg){
                            appSelf.log.add(eventType, dynDocProps._idName + ' addChild ' + msg + ' successful');
                        });
                    }
                    if(logStack.failed[0] != undefined){
                        logStack.failed.forEach(function(msg){
                            appSelf.log.add(eventType, dynDocProps._idName + ' addChild failed', false, {father: dynDocSelf, child: msg});
                        });
                    }
                    return dynDocSelf;
                },
                setFather: function SetDynDocFather(father){
                    var eventType = 'setFather';
                    if(this.is != 'DynDoc' || father.is != 'DynDoc'){
                        this.log.add(eventType, 'setFather failed with wrong object', false, {father: father, child: this});
                        return this;
                    }
                    var dynDocSelf = this;
                    var appSelf = dynDocSelf.appSelf;
                    var dynDocProps = dynDocSelf.__getPrivateProps__(SECRET);
                    var isWhat = appSelf.UTILS.isWhat;

                    var setFather = function(Father){
                        var fatherProps = Father.__getPrivateProps__(SECRET);
                        var originalFatherProps = dynDocProps._father ? dynDocProps._father.__getPrivateProps__(SECRET) : false;

                        appSelf._appendChild(fatherProps._DOM, dynDocProps._DOM);
                        fatherProps._children[dynDocProps._idName] = dynDocSelf;
                        fatherProps._childLength++;
                        dynDocProps._father = Father;

                        if(originalFatherProps){
                            delete originalFatherProps._children[dynDocProps._idName];
                            originalFatherProps._childLength--;
                        }

                        appSelf._parseCSS('SRA', dynDocSelf);
                    };

                    var stringFather = appSelf.all[father];
                    if(father instanceof appSelf.PROTO._DynDocConstructor){
                        setFather(father);
                        appSelf.log.add(eventType, dynDocProps._idName + ' setFather to ' + father.idName + ' success');
                    }
                    else if(stringFather){
                        setFather(stringFather);
                        appSelf.log.add(eventType, dynDocProps._idName + ' setFather to ' + stringFather.idName + ' success');
                    }
                    else{
                        appSelf.log.add(eventType, dynDocProps._idName + ' setFather failed', false, {father: father, child: dynDocSelf});
                    }
                }
            }
        }
    });

    //handle DynDocCSS
    App.fn.extend({
        App: {
            prototype: {
                _parseCSS: function ParseDynDocCSS(event, target, firstValue, secondValue){
                    var appSelf = this.appSelf;
                    //var isWhat = appSelf.UTILS.isWhat;

                    var appSelfProps = appSelf.__getPrivateProps__(SECRET);
                    var targetProps = target.__getPrivateProps__(SECRET);

                    var fatherProps, fatherInDOM;
                    if(targetProps._idName == 'master'){
                        fatherProps = {};
                        fatherInDOM = targetProps._father == undefined ? false : true;
                    }
                    else{
                        if(targetProps._father == undefined){
                            fatherProps = appSelfProps._all.master.__getPrivateProps__(SECRET);
                            fatherInDOM = false;
                        }
                        else{
                            fatherProps = targetProps._father.__getPrivateProps__(SECRET);
                            fatherInDOM = fatherProps._inDOM;
                        }
                    }

                    switch(event){
                        case 'SRA': //SetRelativeAttributes
                            /*if(target.father && target.father != 'html' && target.father.idName != 'master'){
                             appSelf._parseCSS('CSS', target, 'layer', target.father.style.layer);
                             }*/

                            var traverse = function(TargetProps, FatherInDOM){
                                if(FatherInDOM && !TargetProps._inDOM){
                                    TargetProps._inDOM = true;
                                    appSelfProps._inDOM[TargetProps._idName] = TargetProps._self;
                                }
                                else if(!FatherInDOM && TargetProps._inDOM){
                                    TargetProps._inDOM = false;
                                    delete appSelfProps._inDOM[TargetProps._idName];
                                }

                                if(TargetProps._childLength > 0){
                                    var children = TargetProps._children, childProps;
                                    for(var index in children){
                                        childProps = children[index].__getPrivateProps__(SECRET);
                                        childProps._style._top_a = TargetProps._style._top_a + childProps._style._top_r;
                                        childProps._style._left_a = TargetProps._style._left_a + childProps._style._left_r;
                                        //appSelf._parseCSS('CSS', children[index], 'layer', TargetProps._style._layer);
                                        traverse(childProps, TargetProps._inDOM);
                                    }
                                }
                                else{
                                    return;
                                }
                            };
                            traverse(targetProps, fatherInDOM);
                            return;
                        case 'CSS':
                            switch(firstValue){
                                case 'top':
                                    secondValue = appSelf._parseCoordinates(targetProps, fatherProps, firstValue, secondValue);
                                    appSelf._changeStyle(targetProps, firstValue, secondValue[0]);
                                    targetProps._style['_' + firstValue] = secondValue[3];
                                    targetProps._style['_' + firstValue + '_a'] = secondValue[1];
                                    targetProps._style['_' + firstValue + '_r'] = secondValue[2];
                                    return secondValue;
                                case 'left':
                                    secondValue = appSelf._parseCoordinates(targetProps, fatherProps, firstValue, secondValue);
                                    appSelf._changeStyle(targetProps, firstValue, secondValue[0]);
                                    targetProps._style['_' + firstValue] = secondValue[3];
                                    targetProps._style['_' + firstValue + '_a'] = secondValue[1];
                                    targetProps._style['_' + firstValue + '_r'] = secondValue[2];
                                    return secondValue;
                                case 'width':
                                    appSelf._changeStyle(targetProps, firstValue, secondValue.toString() + 'px');
                                    targetProps._style._width = secondValue;
                                    return secondValue;
                                case 'height':
                                    appSelf._changeStyle(targetProps, firstValue, secondValue.toString() + 'px');
                                    targetProps._style._height = secondValue;
                                    return secondValue;
                                case 'color':
                                    appSelf._changeStyle(targetProps, firstValue, secondValue);
                                    targetProps._style._color = secondValue;
                                    return secondValue;
                                case 'backgroundColor':
                                    appSelf._changeStyle(targetProps, firstValue, secondValue);
                                    targetProps._style._backgroundColor = secondValue;
                                    return secondValue;
                                case 'display':
                                    appSelf._changeStyle(targetProps, firstValue, secondValue);
                                    targetProps._style._display = secondValue;
                                    return secondValue;
                                case 'visibility':
                                    appSelf._changeStyle(targetProps, firstValue, secondValue);
                                    targetProps._style._visibility = secondValue;
                                    return secondValue;
                                case 'layer':
                                    secondValue = secondValue || 1;
                                    if(targetProps._idName == 'master'){
                                        targetProps._style._layer = 0;
                                    }
                                    else if(targetProps._father && fatherProps._idName != 'master'){
                                        targetProps._style._layer = fatherProps._style._layer;
                                    }
                                    else{
                                        targetProps._style._layer = parseInt(secondValue, 10);
                                    }
                                    appSelf._changeStyle(targetProps, 'zIndex', targetProps._style._layer);
                                    return targetProps._style._layer;
                                case 'align':
                                    if(targetProps._idName == 'master' && secondValue == 'center'){
                                        appSelf._changeStyle(targetProps, 'position', 'relative');
                                        appSelf._changeStyle(targetProps, 'margin', '0px auto 0px auto');
                                    }
                                default:
                                    return;
                            }
                        default:
                        //none
                    }
                },
                _parseCoordinates: function ParseDynDocCoordinates(targetProps, fatherProps, css, value){
                    var appSelf = this.appSelf;
                    var isWhat = appSelf.UTILS.isWhat;
                    var parseFloat = appSelf.GLOBAL.parseFloat;
                    if(targetProps._idName == 'master'){
                        value = parseFloat(value, 10) + 'px';
                        switch(css){
                            case 'left':
                                return [value, 0, 0, 0, false];

                            case 'right':
                                return [value, 0, 0, 0, false];

                            case 'width':
                                return [value, value, value, value, false];

                            case 'height':
                                return [value, value, value, value, false];

                            default:
                                return ['0px', 0, 0, 0, false];
                        }
                    }

                    var cssOrigin = css;
                    //var father = targetProps._father ? targetProps._father : appSelf.all.master;
                    var returnValue = []; //[0]For DOM，[1]Absolute, [2]Relative [3]ActualValue [4]RelativeLink
                    returnValue[3] = value;
                    returnValue[4] = false;

                    if(typeof value == 'number'){
                        returnValue[2] = value - fatherProps._style['_' + css + '_a'];
                        returnValue[0] = returnValue[2].toString() + 'px';
                        returnValue[1] = value;
                    }
                    else if(typeof value == 'string'){
                        var numValue = parseFloat(value);
                        if(numValue.toString() == 'NaN'){
                            returnValue = undefined;
                            return returnValue;
                        }
                        else if(value.lastIndexOf('r') > -1){
                            returnValue[4] = true;
                            if(value.lastIndexOf('%') > -1){
                                if(css == 'top'){
                                    css = '_height_a';
                                }
                                else if(css == 'left'){
                                    css = '_width_a';
                                }
                                returnValue[2] = father._style[css] * (numValue / 100);
                                returnValue[0] = value.slice(0, value.indexOf('r'));
                                returnValue[1] = returnValue[2] + father._style[cssOrigin];
                            }
                            else{
                                returnValue[0] = numValue.toString() + 'px';
                                returnValue[1] = numValue + father._style[css];
                                returnValue[2] = numValue;
                            }
                        }
                        else if(value.lastIndexOf('%') > -1){

                            if(css == '_top'){
                                css = '_height';
                            }
                            else if(css == '_left'){
                                css = '_width';
                            }
                            returnValue[1] = appSelf.master._style[css] * (numValue / 100);
                            returnValue[2] = returnValue[1] - father._style[cssOrigin];
                            returnValue[0] = returnValue[2].toString() + 'px';
                        }
                        else{
                            returnValue[2] = numValue - father._style[css];
                            returnValue[0] = returnValue[2].toString() + 'px';
                            returnValue[1] = numValue;
                        }
                    }
                    else{
                        returnValue = undefined;
                    }
                    return returnValue;
                }
            }
        }
    });

    //handle DOM
    App.fn.extend({
        App: {
            prototype: {
                _appendChild: (function(){
                    if(WEB_WORKER){
                        return function(father, child){
                            var message = {
                                father: father._idName,
                                child: child._idName,
                                event: 'appendChild'
                            };
                            this.appSelf.GLOBAL.postMessage(message);
                            return;
                        };
                    }
                    else{
                        return function(father, child){
                            //father = father.__getPrivateProps__(SECRET)._DOM;
                            //child = child.__getPrivateProps__(SECRET)._DOM;
                            father = father._DOM;
                            child = child._DOM;
                            var handle = function(){
                                father.appendChild(child);
                            };
                            this.appSelf.__getPrivateProps__(SECRET)._aSyncStack.push(handle);
                            return;
                        };
                    }
                })(),
                _removeChild: (function(){
                    if(WEB_WORKER){
                        return function(father, child){
                            var message = {
                                father: father._idName,
                                child: child._idName,
                                task: 'removeChild'
                            };
                            this.appSelf.GLOBAL.postMessage(message);
                            return;
                        };
                    }
                    else{
                        return function(father, child){
                            //father = father.__getPrivateProps__(SECRET)._DOM;
                            //child = child.__getPrivateProps__(SECRET)._DOM;
                            father = father._DOM;
                            child = child._DOM;
                            var handle = function(){
                                father.removeChild(child);
                            };
                            this.appSelf.__getPrivateProps__(SECRET)._aSyncStack.push(handle);
                            return;
                        };
                    }
                })(),
                _createElement: (function(){
                    if(WEB_WORKER){
                        return function(idName){
                            var appSelf = this.appSelf;
                            var message = {
                                idName: idName,
                                event: 'createElement'
                            };
                            appSelf.GLOBAL.postMessage(message);
                            //appSelf.event.trigger('createElement');
                            //appSelf.event.on('createElementMessage', function(){
                            //});
                            var fakeDom = {
                                id: idName,
                                warning: 'fakeDom!',
                                style: {
                                    position: 'absolute',
                                    display: 'block',
                                    color: 'black'
                                }
                            };
                            return fakeDom;
                        };
                    }
                    else{
                        return function(JSONidName){
                            var element = this.appSelf.GLOBAL.document.createElement('dyndoc');
                            element.id = JSONidName;
                            element.style.position = 'absolute';
                            element.style.display = 'block';
                            element.style.color = 'black';
                            return element;
                        };
                    }
                })(),
                _initMaster: function(JSONdynDoc){
                    var appSelf = this.appSelf;
                    if(appSelf.all.master != undefined){
                        return;
                    }

                    var masterProps = appSelf.PROTO._DynDocConstructor(appSelf, JSONdynDoc, 'master').__getPrivateProps__(SECRET);

                    if(WEB_WORKER){
                        masterProps._father = JSONdynDoc.father;
                    }
                    else{
                        if(JSONdynDoc.father == 'body'){
                            masterProps._father = appSelf.GLOBAL.document.body;
                            appSelf.log.add('initMaster', 'Master init successful', true, JSONdynDoc, 'JSON');
                        }
                        else{
                            if((masterProps._father = appSelf.GLOBAL[JSONdynDoc.father]) != undefined){
                                appSelf.log.add('initMaster', 'Master init successful', true, JSONdynDoc, 'JSON');
                            }
                            else{
                                appSelf.UTILS.throwError("initMaster failed with wrong master's father", JSONdynDoc.father);
                            }
                        }
                    }

                    if(JSONdynDoc.inDOM){
                        appSelf.appendMaster;
                    }
                },
                appendMaster: {
                    get: (function(){
                        if(WEB_WORKER){
                            return function AppendMasterToDOM(){
                                var appSelf = this.appSelf;
                                if(!appSelf.all.master.inDOM){
                                    var master = appSelf.all.master;
                                    var masterProps = master.__getPrivateProps__(SECRET);
                                    appSelf.__getPrivateProps__(SECRET)._inDOM.master = master;
                                    appSelf.GLOBAL.postMessage({
                                        event: 'appendMaster',
                                        father: masterProps._father
                                    });
                                    /*appSelf.event.trigger('appendMaster');
                                    appSelf.event.on('appendMasterMessage', function(sucess, message){
                                        if(sucess){
                                            appSelf.log.add('appendMaster', 'Append Master to DOM successful');
                                        }
                                        else{
                                            appSelf.log.add('appendMaster', 'Append Master failed with wrong DOM', false, {father: masterProps._father, message: message});
                                        }
                                    });*/
                                }
                            };
                        }
                        else{
                            return function AppendMasterToDOM(){
                                var appSelf = this.appSelf;
                                if(!appSelf.all.master.inDOM){
                                    var master = appSelf.all.master;
                                    var masterProps = master.__getPrivateProps__(SECRET);
                                    var fatherDOM = masterProps._father;
                                    //masterProps._father = 'html';
                                    appSelf._parseCSS('SRA', master);
                                    if(fatherDOM.childNodes.length > 0){
                                        fatherDOM.insertBefore(masterProps._DOM, fatherDOM.firstChild);
                                    }
                                    else{
                                        fatherDOM.appendChild(masterProps._DOM);
                                    }
                                    appSelf.log.add('appendMaster', 'Append Master to DOM successful');
                                }
                            };
                        }
                    })()
                },
                _changeStyle: (function(){
                    if(WEB_WORKER){
                        return function(target, style, value){
                            var message = {
                                idName: target._idName,
                                style: style,
                                value: value,
                                task: 'changeStyle'
                            };
                            this.appSelf.GLOBAL.postMessage(message);
                            target._DOM.style[style] = value;
                            return;
                        };
                    }
                    else{
                        return function(target, style, value){
                            //target = target.__getPrivateProps__(SECRET)._DOM;
                            target = target._DOM;
                            var handle = function(){
                                target.style[style] = value;
                            };
                            this.appSelf.__getPrivateProps__(SECRET)._aSyncStack.push(handle);
                            return;
                        };
                    }
                })(),
                _getStyle: (function(){
                    if(WEB_WORKER){
                        return function(target, style){
                            var message = {
                                target: target._idName,
                                style: style,
                                event: 'getStyle'
                            };
                            this.appSelf.GLOBAL.postMessage(message);
                            /*this.appSelf.event.on('getStyle', function(target){

                            });*/
                            return;
                        };
                    }
                    else{
                        return function(target, style){
                            return target._DOM[style];
                        };
                    }
                })()
            }
        }
    });

    //handle Async events
    App.fn.extend({
        DynDoc: {
            privateProps: {
                _eventStack: {}
            }
        },
        App: {
            privateProps: {
                _aSyncStack: [],
                _eventStack: {}
            },
            prototype: {
                selectAll: function selectAllAppOrDynDoc(target){
                    var appSelf = this.appSelf;
                    var returnArray = [];
                    var indexApp, indexDynDoc;
                    var allDynDoc;

                    switch(target){
                        case 'App':
                            for(indexApp in appSelf.APP_INSTANCES){
                                returnArray.push(appSelf.APP_INSTANCES[indexApp]);
                            }
                            return returnArray;

                        case 'DynDoc':
                            allDynDoc = appSelf.all;
                            for(indexDynDoc in allDynDoc){
                                returnArray.push(allDynDoc[indexDynDoc]);
                            }
                            return returnArray;

                        default:
                            for(indexApp in appSelf.APP_INSTANCES){
                                returnArray.push(appSelf.APP_INSTANCES[indexApp]);
                                allDynDoc = appSelf.APP_INSTANCES[indexApp].all;
                                for(indexDynDoc in allDynDoc){
                                    returnArray.push(allDynDoc[indexDynDoc]);
                                }
                            }
                            return returnArray;
                    }
                },
                /*_eventOn: function EventOn(Arguments, times, eventSelf){
                    var appSelf = this.appSelf;
                    var isWhat = appSelf.UTILS.isWhat;

                    Arguments = appSelf.GLOBAL.Array.prototype.slice.call(Arguments);
                    var event = Arguments.shift();
                    var fn = Arguments.shift();
                    Arguments[0] = Arguments[0] || eventSelf;

                    if(isWhat(event) != 'string' || isWhat(fn) != 'function' || fn.name == ''){
                        appSelf.UTILS.throwError('Wrong arguments type or fn have no name', {
                            event: event,
                            eventType: 'eventOn',
                            fn: fn,
                            times: times,
                            occurWith: eventSelf
                        });
                    }

                    var eventOn = function(target, event, fn, times){
                        var eventStack = target.__getPrivateProps__(SECRET)._eventStack;
                        var eventObj;
                        if(eventStack[event] == undefined){
                            eventStack[event] = [];
                        }
                        eventStack[event].push({
                            times: times,
                            fn: fn
                        });
                    };
                    appSelf._handleArguments(Arguments, eventOn, [event, fn, times]);
                },
                _eventTrigger: function EvnetTrigger(Arguments, eventSelf){
                    var appSelf = this.appSelf;
                    var isWhat = appSelf.UTILS.isWhat;

                    Arguments = appSelf.GLOBAL.Array.prototype.slice.call(Arguments);
                    var event = Arguments.shift();
                    var fnArguments = Arguments.shift();
                    fnArguments = fnArguments || [];
                    Arguments[0] = Arguments[0] || eventSelf;

                    if(isWhat(event) != 'string' || isWhat(fnArguments) != 'array'){
                        appSelf.UTILS.throwError('Wrong arguments type', {
                            event: event,
                            fnArguments: fnArguments,
                            eventType: 'eventTrigger',
                            occurWith: eventSelf
                        });
                    }

                    var eventTrigger = function(target, event, fnArguments){
                        var TargetEventStack = target.__getPrivateProps__(SECRET)._eventStack;
                        var eventArray = TargetEventStack[event];
                        var delStack = [];
                        if(eventArray != undefined){
                            eventArray.forEach(function(Event, EventIndex){
                                Event.fn.apply(target, fnArguments);
                                if(Event.times > 0){
                                    if(Event.times == 1){
                                        delStack.unshift(EventIndex);
                                    }
                                    else{
                                        Event.times--;
                                    }
                                }
                            });
                            if(delStack[0] != undefined){
                                delStack.forEach(function(delIndex){
                                    eventArray[delIndex] = null;
                                    delete eventArray[delIndex];
                                    eventArray.splice(delIndex, 1);
                                });
                            }
                            if(eventArray[0] == undefined){
                                TargetEventStack[event] = null;
                                delete TargetEventStack[event];
                            }
                        }
                        else{
                            if(DEVELOPMENT){
                                console.log('trigger no exist event: ' + event);
                            }
                        }
                    };
                    appSelf._handleArguments(Arguments, eventTrigger, [event, fnArguments]);

                },
                _eventOff: function EventOff(Arguments, fnName, eventSelf){
                    var appSelf = this.appSelf;
                    var isWhat = appSelf.UTILS.isWhat;

                    //Arguments = appSelf.GLOBAL.Array.prototype.slice.call(Arguments);
                    var event = Arguments.shift();
                    Arguments[0] = Arguments[0] || eventSelf;

                    if(isWhat(event) != 'string' || isWhat(fnName) != 'array'){
                        appSelf.UTILS.throwError('Wrong arguments type', {
                            event: event,
                            fnName: fnName,
                            eventType: 'eventOff',
                            occurWith: eventSelf
                        });
                    }

                    var eventOff = function(target, event, fnName){
                        var TargetEventStack = target.__getPrivateProps__(SECRET)._eventStack;
                        var eventArray = TargetEventStack[event];
                        var delStack = [];

                        if(eventArray != undefined){
                            if(fnName[0] != undefined){
                                eventArray.forEach(function(Event, EventIndex){
                                    var fnNameIndex = fnName.indexOf(Event.fn.name);
                                    if(fnNameIndex > -1){
                                        delStack.unshift(EventIndex);
                                    }
                                });

                                if(delStack[0] != undefined){
                                    delStack.forEach(function(delIndex){
                                        eventArray[delIndex] = null;
                                        delete eventArray[delIndex];
                                        eventArray.splice(delIndex, 1);
                                    });
                                }
                            }
                            else{
                                TargetEventStack[event] = null;
                                delete TargetEventStack[event];
                            }
                        }
                    }
                    appSelf._handleArguments(Arguments, eventOff, [event, fnName]);
                },
                _eventClone: function EventClone(Arguments, eventSelf){
                    var appSelf = this.appSelf;
                    var isWhat = appSelf.UTILS.isWhat;
                    var cloneObj = appSelf.UTILS.cloneObj;

                    Arguments = appSelf.GLOBAL.Array.prototype.slice.call(Arguments);
                    var event = Arguments.shift();
                    var src = Arguments.shift();
                    Arguments[0] = Arguments[0] || eventSelf;

                    if(isWhat(event) != 'string' || !(src.is == 'App' || src.is == 'DynDoc') ||
                       Arguments.some(function(dst){
                           return src == dst;
                       }) || !(src = src.__getPrivateProps__(SECRET)._eventStack[event])
                        ){
                        appSelf.UTILS.throwError('Wrong arguments', {
                            event: event,
                            src: src,
                            eventType: 'eventClone',
                            occurWith: Arguments
                        });
                    }

                    var eventClone = function(target, event, srcArray){
                        var targetEventStack = target.__getPrivateProps__(SECRET)._eventStack;
                        var eventArray = targetEventStack[event];
                        srcArray = cloneObj(srcArray)
                        if(eventArray){
                            targetEventStack[event] = eventArray.concat(srcArray);
                        }
                        else{
                            targetEventStack[event] = srcArray;
                        }
                    };
                    appSelf._handleArguments(Arguments, eventClone, [event, src]);
                },
                event: {
                    get: function(){
                        var eventSelf = this;
                        var appSelf = eventSelf.appSelf;
                        var eventSelfProps = eventSelf.__getPrivateProps__(SECRET);

                        var eventStack = eventSelfProps._eventStack;

                        var isWhat = appSelf.UTILS.isWhat;

                        var handleAll = function(method, Arguments){
                            Arguments = appSelf.GLOBAL.Array.prototype.slice.call(Arguments);
                            var triggerStack, range = Arguments[0];

                            if(range == 'App' || range == 'DynDoc' || range == 'All'){
                                range = Arguments.shift();
                            }
                            else{
                                range = 'All';
                            }

                            //triggerStack = appSelf._selectAll(range);
                            Arguments.push(appSelf._selectAll(range));
                            appSelf.event[method](Arguments);
                            //triggerStack = null;
                        };

                        return {
                            on: function(){
                                appSelf._eventOn(arguments, 0, eventSelf);
                            },
                            once: function(){
                                appSelf._eventOn(arguments, 1, eventSelf);
                            },
                            onTimes: function(){
                                var Arguments = appSelf.GLOBAL.Array.prototype.slice.call(arguments);
                                var times = Arguments.splice(1, 1)[0];
                                if(isWhat(times) == 'number' && times > -1){
                                    appSelf._eventOn(Arguments, times, eventSelf);
                                }
                                else{
                                    appSelf.UTILS.throwError('Wrong "Times", it must be a number and > -1', {Arguments: arguments, times: times});
                                }
                            },
                            off: function(){
                                var fnName = [];
                                var Arguments = appSelf.GLOBAL.Array.prototype.slice.call(arguments);
                                if(isWhat(Arguments[1]) == 'object' && isWhat(Arguments[1].fnName) == 'array'){
                                    fnName = Arguments.splice(1,1)[0].fnName;
                                }
                                appSelf._eventOff(Arguments, fnName, eventSelf);
                            },
                            clone: function(){
                                appSelf._eventClone(arguments, eventSelf);
                            },
                            trigger: function(){
                                appSelf._eventTrigger(arguments, eventSelf);
                            },
                            onAll: function(){
                                handleAll('on', arguments);
                            },
                            onceAll: function(){
                                handleAll('once', arguments);
                            },
                            offAll: function(){
                                handleAll('off', arguments);
                            },
                            cloneAll: function(){
                                handleAll('clone', arguments);
                            },
                            triggerAll: function(event, fnArguments, all){
                                //handleAll('trigger', arguments);
                                appSelf.event.trigger(event, fnArguments, appSelf._selectAll(all));
                            }
                        }
                    }
                },*/
                _eventFn: {},
                on: function ProxyEventOn(){
                    return this._eventFn.on.apply(this, arguments);
                },
                once: function ProxyEventOnce(){
                    var argu = this.UTILS.convertArgu(arguments);
                    argu.splice(1, 0, 1);
                    return this._eventFn.on.apply(this, argu);
                },
                emit: function ProxyEventEmit(){
                    return this._eventFn.emit.apply(this, arguments);
                },
                exec: {
                    get: (function(){
                        if(WEB_WORKER){
                            return function(){
                                this.appSelf.GLOBAL.postMessage({event: 'executeStack'});
                            };
                        }
                        else{
                            return function(){
                                var stack = this.appSelf.__getPrivateProps__(SECRET)._aSyncStack;
                                var length = stack.length;
                                var execute = function(){
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
                                return this;
                            };
                        }
                    })()
                }
            }
        }
    });
    UTILS.addEventEmitter(App.fn._eventFn, {
        fn: function getPrivateStack(){
            return this.__getPrivateProps__(SECRET)._eventStack;
        }
    });

    var webWorker = {
        postMessage: function(message){
            GLOBAL.postMessage(message);
        },
        onmessage: (function(global){
            var onmessage = function(event){
                var message = event.data;
                var app = global[GLOBAL_INSTANCE_NAME];
                if(typeof message == 'object' && message.target && message.event){
                    app.event.trigger(message.target, message.event);
                }
                else{
                }
            };
            global.onmessage = onmessage;
            return onmessage;
        })(GLOBAL)
    };

    App(INIT);

})((function(){
        "use strict";
        var _env;
        try{
            if(global && global.require){
                _env = {
                    GLOBAL: global,
                    RUN_IN: 'node.js'
                };
            }
        }
        catch(ex){}
        try{
            if(self.window && self.window == window){
                _env = {
                    GLOBAL: window,
                    RUN_IN: 'browser'
                };
            }
        }
        catch(ex){}
        try{
            if(self && !self.window){
                _env = {
                    GLOBAL: self,
                    RUN_IN: 'worker'
                };
            }
        }
        catch(ex){}
        console.log('Running in '+_env.RUN_IN);
        if(_env.GLOBAL.DynAppGlobalSettings){
            _env.settings = _env.GLOBAL.DynAppGlobalSettings;
            delete _env.GLOBAL.DynAppGlobalSettings;
        }
        else{
            _env.settings = {
                ENVIRONMENT: 'development',
                SECRET: _env.GLOBAL.Math.random(),
                GLOBAL_INSTANCE_NAME: _env.GLOBAL['app'] ? 'APP' : 'app'
            };

            console.log("there's no DynAppGlobalSettings detected");
        }
        Object.defineProperties(Object.prototype, {
            length: {
                set: function(err){
                    throw new Error('Can not set length');
                },
                get: function(){
                    return (function(obj){
                        var length = 0;
                        for(var index in obj){
                            if(index){
                                length++;
                            }
                        }
                        return length;
                    })(this);
                },
                configurable: false,
                enumerable: false
            }
        });
        return _env;
    })());


//--------------run it----------------------//

var appobj = {
    DESCRIPTION: 'DynDoc',
    master: {
        father: 'body',
        inDOM: false,
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
};


var obj3 = {
    obj3: {
        style: {
            top: 50,
            left: 200,
            width: 600,
            height: 500,
            backgroundColor: 'green'
        },
        content: 'Dynamic Obj3'
    }
};

app.create(appobj).exec.appendMaster;
//app.isolate(app.all.obj4)
//app.extend({DynDoc:{instance:{style:'asdf'}}})
/*objmaster=app.master;
obj2=app.obj2;
obj1=app.obj1;
obj3=app.obj3;
obj4=app.obj4;
obj5=app.obj5;
obj6=app.obj6;*/


