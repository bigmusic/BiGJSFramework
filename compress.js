/**
 * Created with JetBrains WebStorm.
 * User: BiG
 * Date: 6/6/13
 * Time: 11:15 AM
 * To change this template use File | Settings | File Templates.
 */

window.onload = init;
function $(s){
    return document.getElementById(s);
}
function init(){
    $("txtS").focus();
    $("btn1").onclick = run;
    $("txtS").onkeydown = function(){
        if(event.keyCode == 13 && event.ctrlKey){
            run();
        }
    }
}
function run(){
    var str = $("txtS").value;
    $("txtS").value = "";
    var lzc = new Lz77CompressDefer(str);
    var t = new Date();
    lzc.start(function(result){
        $("txtR").value = Lz77SelfExtract(result);
        var tc = new Date() - t;
        $("txtS").value = eval($("txtR").value.substring(4));
        var td = new Date() - t - tc;
        alert("压缩完毕\r\n压缩比：" + ($("txtR").value.length / str.length * 100).toFixed(2) + "%\r\n压缩用时：" + tc + "ms\r\n解压用时：" + td + "ms\r\n校验：" + (str == $("txtS").value ? "OK" : "failed"));
    });
    function showProgress(){
        var p = lzc.status();
        if(p < 1){
            $("txtS").value = "压缩中 ... " + (p * 100).toFixed(2) + "%";
            setTimeout(showProgress, 300);
        }
    }

    showProgress();
    /*
     $("txtR").value = Lz77Compress(str);
     var tc = new Date() - t;
     $("txtS").value = Lz77Decompress($("txtR").value);
     var td = new Date() - t - tc;
     alert($("txtR").value.length/$("txtS").value.length+":"+tc+":"+td+":"+(str==$("txtS").value));
     */
}
/*
 * 以 LZ77 原理<strong>实现</strong>的<strong>JS</strong>文本压缩<strong>算法</strong>
 * Author: Hutia
 *
 */
/*
 LZ77基本原理：
 1、从当前压缩位置开始，考察未编码的数据，并试图在滑动窗口中找出最长的匹配字符串，如果找到，则进行步骤 2，否则进行步骤 3。
 2、输出三元符号组 ( off, len, c )。其中 off 为窗口中匹配字符串相对窗口边界的偏移，len 为可匹配的长度，c 为下一个字符。然后将窗口向后滑动 len + 1 个字符，继续步骤 1。
 3、输出三元符号组 ( 0, 0, c )。其中 c 为下一个字符。然后将窗口向后滑动 len + 1 个字符，继续步骤 1。
 变种：
 1. 将匹配串和不能匹配的单个字符分别编码、分别输出，输出匹配串时不同时输出后续字符。
 本<strong>算法</strong>变种：
 1. 采用出现概率很低的前导字符P来区分匹配串输出和非匹配串。对于匹配串，输出 ( P, off, len )，对于非匹配串，输出 c。
 非匹配串中出现字符P时，输出PP来代替，以示和匹配串的区别。
 因此匹配串的输出 ( off, len ) 结果中，不可以出现字符P，以免产生混淆。
 本例中，取 (`) 作为前导字符。
 2. 对于匹配串，输出为：
 前导字符 (`) + 偏移量 (3位，92进制 = 778688) + 匹配长度 (2位，92进制 = 8464)
 因此滑动窗大小为778688，最小的匹配长度为 7。
 3. 本算法针对JS文件，为简化算法暂不考虑窗口滑动情况（JS文件通常不会大于700K）。对于文件大于778688字节的情况使用本算法会出错。将来可以实现滑动窗口或分段压缩。
 4. 本例中为简化算法，将 off 与 len 转换为 92 进制的字符串，并且将低位放在左侧，高位放在右侧。
 作者：Hutia
 Email: Hutia2@163.com
 转载请注明出处
 */
var NC = [], CN = [];
NC = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~!@#$%^&*()-=[]\;',./_+{}|:\"<>?".split("");
for(var i = 0; i < NC.length; i++){
    CN[NC[i]] = i;
}
function Lz77Compress(input){
    /*LZ77压缩算法 - Hutia - JS版*/
    /*变量声明*/
    var p = 0; //扫描指针
    var lp = 0; //链表查询指针
    var len = input.length; //输入字符串的长度
    var output = []; //输出
    var index = ""; //索引
    var head = []; //索引头信息
    var prev = []; //位置链表
    var match_off = 0; //匹配位置的偏移量
    var match_len = 0; //发生匹配的长度
    var last_match_off = 0; //上一次匹配位置的偏移量
    var last_match_len = 0; //上一次发生匹配的长度
    var j = 0; //循环变量
    /*循环扫描*/
    for(p = 0; p < len; p++){
        index = input.substring(p, p + 7); //取当前字符开始的7个字符作为索引
        /*链表维护*/
        prev[p] = head[index]; //当前头位置进链表
        head[index] = p; //保存现在位置进头信息
        /*匹配*/
        lp = p; //初始化链表查询指针
        match_len = 0; //初始化匹配长度
        match_off = 0; //初始化匹配位置
        if(prev[lp]) //如果链表上存在上一个匹配
        {
            /*匹配查询*/
            while(prev[lp]) //依次查看链表上的每个位置
            {
                lp = prev[lp]; //取出链表上的前一个位置到链表查询指针
                for(j = 1; j < 8464 && lp + j < p; j++) //寻找此位置的最长匹配，匹配长度不能超过8464 (92进制的2个字节长度)，也不能超过当前指针位置
                {
                    if(input.substring(lp, lp + j) != input.substring(p, p + j)){
                        break;
                    }
                }
                j--; //计算最长匹配
                if(j > 7 && j > match_len) //如果此匹配比已发现的匹配长
                {
                    match_len = j; //记录匹配长度
                    match_off = lp; //记录匹配位置
                }
            }
            /*匹配处理*/
            if(match_len > 7) //如果找到了符合要求的匹配
            {
                if(last_match_len != 0 && last_match_len < match_len) //如果上次匹配存在，且长度没有这次匹配的长度大
                {
                    /*懒惰模式*/
                    output_unmatch(input.charAt(p - 1)); //放弃上次匹配，将字符直接输出
                    last_match_off = match_off; //记录此次的匹配位置
                    last_match_len = match_len; //记录此次的匹配长度
                }
                else if(last_match_len != 0) //如果上次匹配存在，且长度比这次匹配的长度大
                {
                    /*处理上次的懒惰模式*/
                    output_match(); //输出上次的匹配
                }
                else //如果上次匹配不存在
                {
                    /*懒惰模式*/
                    last_match_off = match_off; //记录此次的匹配位置
                    last_match_len = match_len; //记录此次的匹配长度
                }
            }
            else //如果找不到符合要求的匹配（例如匹配超出当前指针）
            {
                if(last_match_len != 0) //如果上次匹配存在
                {
                    /*处理上次的懒惰模式*/
                    output_match(); //输出上次的匹配
                }
                else{
                    output_unmatch(input.charAt(p)); //直接输出当前的字符
                }
            }
        }
        else //如果当前不存在匹配
        {
            if(last_match_len != 0) //如果之前发生了匹配
            {
                /*处理上次的懒惰模式*/
                output_match(); //输出匹配
            }
            else{
                output_unmatch(input.charAt(p)); //直接输出当前的字符
            }
        }
    } //循环扫描结束
    /*边界处理*/
    if(last_match_len != 0) //如果之前发生了匹配
    {
        /*处理上次的懒惰模式*/
        output_match(); //输出匹配
    }
    /*输出*/
    return output.join("");
    function output_match(){
        output.push("`"); //输出前缀符
        output.push(N2C(last_match_off, 3)); //输出3字节偏移量
        output.push(N2C(last_match_len, 2)); //输出2字节匹配长度
        p += last_match_len - 2; //移动当前指针到匹配串的末尾（因为懒惰模式，此时 p 指向 last_match_off + 1 的位置，所以应 -2 ）
        last_match_off = 0; //清空匹配位置
        last_match_len = 0; //清空匹配长度
    }

    function output_unmatch(c){
        output.push(c == "`" ? "``" : c); //输出未匹配的字符
    }
}
function Lz77Decompress(input){
    /*LZ77解压缩算法 - Hutia - JS版*/
    /*变量声明*/
    var p = 0; //扫描指针
    var len = input.length; //输入字符串的长度
    var output = []; //输出
    var match_off = 0; //匹配位置的偏移量
    var match_len = 0; //发生匹配的长度
    /*循环扫描*/
    for(p = 0; p < len; p++){
        if(input.charAt(p) == "`") //如果发现前缀标记
        {
            if(input.charAt(p + 1) == "`") //如果是转义前缀
            {
                output.push("`"); //直接输出字符 "`"
                p++; //指针后移，跳过下一个字符
            }
            else //如果是压缩编码
            {
                match_off = C2N(input.substring(p + 1, p + 4)); //取出其 1-3 个字符，算出偏移量
                match_len = C2N(input.substring(p + 4, p + 6)); //取出其 4-5 字符，算出匹配长度
                output = [].concat(output.join("")); //整理输出内容
                output.push(output[0].substring(match_off, match_off + match_len)); //自输出内容的相应偏移量位置取出编码所代表的字符串
                p += 5; //指针后移，跳过下5个字符
            }
        }
        else //如果没有发现前缀标记
        {
            output.push(input.charAt(p)); //直接输出相应的字符
        }
    }
    /*输出*/
    return output.join("");
}
/*LZ77解压缩算法 - Hutia - JS / mini 版*/
hutia = function(s){
    var A = "charAt", p = -1, l = s.length, o = [], m, a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~!@#$%^&*()-=[]\;',./_+{}|:\"<>?".split(""), _ = [];
    while(++p < 92){
        _[a[p]] = p;
    }
    function $(c){
        var l = c.length, r = 0, i = -1;
        while(++i < l){
            r += _[c[A](i)] * Math.pow(92, i);
        }
        return r;
    }

    p = -1;
    while(++p < l){
        if(s[A](p) == "`"){
            if(s[A](p + 1) == "`"){
                p++, o.push("`");
            }
            else{
                m = $(s.substring(p + 1, p + 4));
                o = [].concat(o.join(""));
                o.push(o[0].substring(m, m + $(s.substring(p + 4, p + 6))));
                p += 5;
            }
        }
        else{
            o.push(s.charAt(p));
        }
    }
    return o.join("");
}
function Lz77SelfExtract(s){
    return "eval((" + String(hutia) + ")(\"" + s.replace(/\\/g, "\\\\").replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/\"/g, "\\\"") + "\"));";
}
function Lz77CompressDefer(input){
    /*LZ77压缩算法 - Hutia - JS / Defer 版*/
    /*变量声明*/
    var p = 0; //扫描指针
    var lp = 0; //链表查询指针
    var len = input.length; //输入字符串的长度
    var output = []; //输出
    var index = ""; //索引
    var head = []; //索引头信息
    var prev = []; //位置链表
    var match_off = 0; //匹配位置的偏移量
    var match_len = 0; //发生匹配的长度
    var last_match_off = 0; //上一次匹配位置的偏移量
    var last_match_len = 0; //上一次发生匹配的长度
    var j = 0; //循环变量
    var callback; //回调函数
    this.start = function(fn){
        this.start = function(){
        }
        callback = fn;
        run();
    }
    this.status = function(){
        return p / len;
    }
    function run(){
        var inner_i = 0;
        /*循环扫描*/
        for(; p < len; p++){
            if(++inner_i > 400){
                return setTimeout(run);
            }
            index = input.substring(p, p + 7); //取当前字符开始的7个字符作为索引
            /*链表维护*/
            prev[p] = head[index]; //当前头位置进链表
            head[index] = p; //保存现在位置进头信息
            /*匹配*/
            lp = p; //初始化链表查询指针
            match_len = 0; //初始化匹配长度
            match_off = 0; //初始化匹配位置
            if(prev[lp]) //如果链表上存在上一个匹配
            {
                /*匹配查询*/
                while(prev[lp]) //依次查看链表上的每个位置
                {
                    lp = prev[lp]; //取出链表上的前一个位置到链表查询指针
                    for(j = 1; j < 8464 && lp + j < p; j++) //寻找此位置的最长匹配，匹配长度不能超过8464 (92进制的2个字节长度)，也不能超过当前指针位置
                    {
                        if(input.substring(lp, lp + j) != input.substring(p, p + j)){
                            break;
                        }
                    }
                    j--; //计算最长匹配
                    if(j > 7 && j > match_len) //如果此匹配比已发现的匹配长
                    {
                        match_len = j; //记录匹配长度
                        match_off = lp; //记录匹配位置
                    }
                }
                /*匹配处理*/
                if(match_len > 7) //如果找到了符合要求的匹配
                {
                    if(last_match_len != 0 && last_match_len < match_len) //如果上次匹配存在，且长度没有这次匹配的长度大
                    {
                        /*懒惰模式*/
                        output_unmatch(input.charAt(p - 1)); //放弃上次匹配，将字符直接输出
                        last_match_off = match_off; //记录此次的匹配位置
                        last_match_len = match_len; //记录此次的匹配长度
                    }
                    else if(last_match_len != 0) //如果上次匹配存在，且长度比这次匹配的长度大
                    {
                        /*处理上次的懒惰模式*/
                        output_match(); //输出上次的匹配
                    }
                    else //如果上次匹配不存在
                    {
                        /*懒惰模式*/
                        last_match_off = match_off; //记录此次的匹配位置
                        last_match_len = match_len; //记录此次的匹配长度
                    }
                }
                else //如果找不到符合要求的匹配（例如匹配超出当前指针）
                {
                    if(last_match_len != 0) //如果上次匹配存在
                    {
                        /*处理上次的懒惰模式*/
                        output_match(); //输出上次的匹配
                    }
                    else{
                        output_unmatch(input.charAt(p)); //直接输出当前的字符
                    }
                }
            }
            else //如果当前不存在匹配
            {
                if(last_match_len != 0) //如果之前发生了匹配
                {
                    /*处理上次的懒惰模式*/
                    output_match(); //输出匹配
                }
                else{
                    output_unmatch(input.charAt(p)); //直接输出当前的字符
                }
            }
        } //循环扫描结束
        /*边界处理*/
        if(last_match_len != 0) //如果之前发生了匹配
        {
            /*处理上次的懒惰模式*/
            output_match(); //输出匹配
        }
        /*回调输出*/
        callback(output.join(""));
    } //end of run
    function output_match(){
        output.push("`"); //输出前缀符
        output.push(N2C(last_match_off, 3)); //输出3字节偏移量
        output.push(N2C(last_match_len, 2)); //输出2字节匹配长度
        p += last_match_len - 2; //移动当前指针到匹配串的末尾（因为懒惰模式，此时 p 指向 last_match_off + 1 的位置，所以应 -2 ）
        last_match_off = 0; //清空匹配位置
        last_match_len = 0; //清空匹配长度
    }

    function output_unmatch(c){
        output.push(c == "`" ? "``" : c); //输出未匹配的字符
    }
}
function C2N(c) //将 92 进制字符串（高位在右）转换为 10 进制数字
{
    var len = c.length;
    var re = 0;
    for(var i = 0; i < len; i++){
        re += CN[c.charAt(i)] * Math.pow(92, i);
    }
    return re;
}
function N2C(n, len) //将 10 进制数字转换为指定长度的 92 进制字符串，高位在右
{
    var re = [];
    for(var i = 0; i < len; i++){
        re[i] = NC[n % 92];
        n = n / 92 | 0;
    }
    return re.join("");
}
