/**
 * Created with JetBrains WebStorm.
 * User: big
 * Date: 7/17/13
 * Time: 12:40 AM
 * To change this template use File | Settings | File Templates.
 */

app: {
    GLOBAL
    VERSION
    ENVIRONMENT
    RUN_IN
    STATE
    _instance
    _webWorker
    _log
    isWhat()
    cloneObject()
    throwError()
    defineProp() {
        Specification:
            app.defineProps(target, properties/*[prop1, prop2...etc]*/, configurable, enumerable, writable, context);
            app.defineProps([target, properties/*[prop1, prop2...etc]*/, configurable, enumerable, writable, context],[]...etc);

        target is a 'Object' that to define;

        properties = {
            name:value
        }
        or
        properties = {
            name:{ //without '_' effect the defineProperty's "SET/GET" method
                set:function(){},
                get:function(){}
            }
        }
        or
        properties = {
            name:{ //with '_' ,the function will directly set the value to 'set' and 'get'
                _set_:function(){},
                _get_:function(){}
            }
        }

        configruable, enumerable, writable are 'boolean',default value are false, false, true

        if context != undefined
        _defineProp will run with value function to get the final function with return
        statement inside like:
            properties = {
                name:properties.name(context)
            }
            or
            properties = {
                name:{
                    set:properties.name.set(context),
                    get:properties.name.get(context)
                }
            }

        Example:
            //with context
            context = {
                private:'privateValue'
            }
            properties = {
                name:{
                    set:function(context){
                        return function(value){
                            context.private = value;
                        };
                    },
                    get:function(context){
                        return function(){
                            return context.private;
                        };
                    }
                },
                name:function(context){
                    return context;
                }
            }
            app.defineProps(target, properties, false, false, false, context);

            //without context
            properties = {
                _name: undefined,
                name:{
                    set:function(setValueTo){
                        this._name = setValueTo;
                    },
                    get:function(){
                        return this._name;
                    }
                }
            }
            app.defineProps(target, properties, false, false, true);
    }
    extend() {
        Specification:
            warning: DO NOT set privateValue to a OBJECT!!!
            app.extend({
                App: {
                    privateProps: {
                        _privateName: privateValue
                    },
                    instance:{
                        name:{
                            set:function(_privateProps_){
                                return function(){
                                    //do something with _privateProps_
                                };
                            },
                            get:function(_privateProps_){
                                return function(){
                                    var someVar = _privateProps_._privateName
                                    //do something with someVar
                                };
                            }
                        },
                        otherName: function(_privateProps_){
                            return function(){
                                var someVar = _privateProps_._privateName
                                //do something with someVar
                            };
                        },
                        anotherName: value //must not a function
                    },
                    proto:{
                        name:{
                            set:function(value){
                                //do something
                            },
                            get:function(){
                                //do something
                            }
                        },
                        anotherName: value
                    }
                },
                DynDoc: { //same as above
                    privateProps:{},
                    instance:{},
                    proto:{}
                }
            }, {...}, ...etc);

        Example:
            app.extend({
                App: {
                    privateProps: {
                        _logs: []
                    },
                    instance: {
                        getLogs: {
                            set: function(){
                                return function(){
                                }
                            },
                            get: function(_privateProps_){
                                return function(){
                                    var returnValue = [];
                                    _privateProps_._logs.forEach(function(item){
                                        returnValue.push(item);
                                    });
                                    return returnValue;
                                }
                            }
                        }
                    },
                    proto: {
                        addLogs:function(log){
                            var appSelf = this;
                            appSelf.__getPrivateProps__(SECRET)._logs.push(log);
                        }
                    }
                }
            });


    }
    create()
    isolate()
    del()
}

dyndoc: {
    setFather()
    addChild()
    dyndoc.style
}