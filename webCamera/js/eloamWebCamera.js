// js扩展方法
(function ($) {
    $.extend(
            {
                'eloamWebCamera': function (data,suc,fail) {
                    return new WebCamera($,data,suc,fail)
                }
            }
        );
})(jQuery);
var __ELOAM_OBJ = {
    el: null,
    data: {},
    isIE: false,
    port: '38088',
    hideDivImg: false
}

var WebCamera = function (_$, data, suc, fail) {
    // 初始化数额及
    if (!_$) {
        fail("jquery 不能为空")
        return
    }
    if (!data) {
        data = {}
    }
    var __eloam_uitl = {
        _isIE: function () {
            if (__eloam_uitl._BrowserType() == "IE")
                return true;
            else
                return false;
        },
        _BrowserType: function () {
            var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
            if (userAgent.indexOf("Firefox") > -1) {
                return "Firefox";
            }
            if (userAgent.indexOf("Chrome") > -1) {
                return "Chrome";
            }
            return "IE";
        },
        findTime: function () {
            //datetime是拿到的时间戳
            var date = new Date();//时间戳为10位需*1000，时间戳为13位的话不需乘1000
            var year = date.getFullYear(),
                month = ("0" + (date.getMonth() + 1)).slice(-2),
                sdate = ("0" + date.getDate()).slice(-2),
                hour = ("0" + date.getHours()).slice(-2),
                minute = ("0" + date.getMinutes()).slice(-2),
                second = ("0" + date.getSeconds()).slice(-2);
            var result = year + "-" + month + "-" + sdate + " " + hour + ":" + minute + ":" + second;
            return result;
        },
        isEmptyObj: function (obj) {
            for (var item in obj) {
                return false
            }
            return true
        },
        isExistValue: function (val) {
            if(val || val == 0)
                return true;
            return false
        }
    }
    __ELOAM_OBJ.hideDivImg = !!data.hideDivImg
    __ELOAM_OBJ.data = data
    __ELOAM_OBJ.el = _$
    if(data.port){
        __ELOAM_OBJ.port = data.port
    }
    __ELOAM_OBJ.isIE = __eloam_uitl._isIE()
    if (__ELOAM_OBJ.isIE) {
        if (data.ocxId) {
            var __kArr = _$('#' + data.ocxId)
            if (__kArr.length !== 1) {
                doCal(fail, '请检查IE浏览器对应的OBJECT的id;找到该id对象个数为：' + __kArr.length)
                return
            } else {
                __ELOAM_OBJ.data.ocxName = __kArr[0]
            }
        }
    } else {
        if (data.imgMainId) {
            var k = _$('#' + data.imgMainId)
            if (k.length !== 1) {
                doCal(fail, '请检查非IE浏览器对应的img的id;找到该id对象个数为：' + k.length)
                return
            }
        }
    }
    function doInit() {
        // 将有的全部隐藏
        if(__ELOAM_OBJ.hideDivImg){
            doImgDiv(1)
        }else {
            if (__ELOAM_OBJ.isIE) {
                if (__ELOAM_OBJ.data.imgMainDivId) {
                    __ELOAM_OBJ.el('#' + __ELOAM_OBJ.data.imgMainDivId).attr('style', 'display:none;visibility:hidden')
                }
            } else {
                if (__ELOAM_OBJ.data.ocxDivId) {
                    __ELOAM_OBJ.el('#' + __ELOAM_OBJ.data.ocxDivId).attr('style', 'display:none;visibility:hidden')
                }
            }
        }
    }

    function doCal(call, data) {
        if (call) {
            if (data) {
                call(data)
            } else {
                call()
            }
        }
    }
    function doOpenCamera(devIndex,suc, fail) {
        OpenCamera(devIndex + "", function () {
            doFun(true,'camera=state','{}', function (data) {
                // var k = data['video' + devIndex]
                var state = data.state
                if(state){
                    localStorage.setItem("devIndex", devIndex)
                    doCal(suc, 'ok')
                    // var strings = state.split(',');
                    // if(strings.length>devIndex){
                    //     if (strings[devIndex] === 'opened') {
                    //         localStorage.setItem("devIndex", devIndex)
                    //         doCal(suc, 'ok')
                    //     }else {
                    //         doCal(fail, 'state数据：{'+state+"},摄像头下标："+devIndex+";打开失败~")
                    //     }
                    // }else {
                    //     doCal(fail, 'state数据：{'+state+"},摄像头下标："+devIndex+";请正确选择下标")
                    // }
                }else {
                    doCal(fail, 'camera=state返回参数错误~')
                }
            }, function (err) {
                console.log('不支持camera=state方法；调用video=status方法；错误信息：'+err)
                setTimeout(function () {
                    doFun(true,'video=status','{}',function (data) {
                        var k = data['video'+devIndex]
                        if(k){
                            if('run' == k){
                                doCal(suc,'ok')
                            }else if('ok' == k){
                                doCal(fail,'找到摄像头成功，但打开失败~')
                            }else if("no" == k){
                                doCal(fail,'没有找到对应的摄像头~')
                            }
                        }else {
                            doCal(fail,'请检查摄像头下标~')
                        }
                    },fail)
                },2000)
            })
        })
    }
    function OpenCamera(DevIndex, call) {
        if(__ELOAM_OBJ.hideDivImg){
            doImgDiv(2)
        }
        if (__ELOAM_OBJ.isIE) {
            if (__ELOAM_OBJ.data.ocxName) {
                __ELOAM_OBJ.data.ocxName.StartPreview(DevIndex)
            }
        } else {
            if (__ELOAM_OBJ.data.imgMainId) {
                __ELOAM_OBJ.el('#' + __ELOAM_OBJ.data.imgMainId).attr('src', "http://127.0.0.1:"+__ELOAM_OBJ.port+"/video=stream&camidx=" + DevIndex+"?"+new Date().getTime())
            }
        }
        call()
        //setTimeout(call, 1000)
    }

    //contentType: 'application/json',
    function doFun(isPost, url, data, suc, fail) {
        if (!data) {
            data = "{}"
        }
        __ELOAM_OBJ.el.ajax({
            type: isPost ? "post" : "get",
            url: 'http://127.0.0.1:'+__ELOAM_OBJ.port+'/' + url,
            dataType: "json",
            // contentType: 'application/json',
            data: data, // 将对象使用这个方法转一下 JSON.stringify(_data)
            success: function (data) {
                if (data.code == 0) {
                    if (data.data) {
                        doCal(suc, data.data)
                    } else {
                        doCal(suc, data)
                    }
                } else {
                    doCal(fail, data)
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                // XMLHttpRequest 对象、错误信息、（可选）捕获的错误对象。
                // 如果发生了错误，错误信息（第二个参数）除了得到null之外，还可能是"timeout", "error", "notmodified" 和 "parsererror"。
                // textStatus:
                //"timeout", "error", "notmodified" 和 "parsererror"。
                // XMLHttpRequest.readyState:
                /**
                 0 － （未初始化）还没有调用send()方法
                 1 － （载入）已调用send()方法，正在发送请求 ，服务器连接已建立
                 2 － （载入完成）send()方法执行完成，已经接收到全部响应内容 ，请求已接收
                 3 － （交互）正在解析响应内容 ， 请求处理中
                 4 － （完成）响应内容解析完成，可以在客户端调用了，请求已完成，且响应已就绪
                 */
                    // 三、data:"{}", data为空也一定要传"{}"；不然返回的是xml格式的。并提示parsererror.
                    // 错误说明：https://www.cnblogs.com/fireporsche/p/6391061.html
                var res = {
                        readyState: XMLHttpRequest.readyState,
                        textStatus: textStatus,
                        errorThrown: errorThrown,
                        msg: '请求AJAX错误'
                    }
                doCal(fail, res)
            }
        });
    }

    function findDefaultValue(k, def) {
        if (!k) {
            return def;
        }
        return k + ''
    }
    function doImgDiv(type) {
        switch (type) {
            case 1:
                // 全部关闭
                // visibility:hidden
                if (__ELOAM_OBJ.data.imgMainDivId) {
                    __ELOAM_OBJ.el('#' + __ELOAM_OBJ.data.imgMainDivId).attr('style', 'display:none')
                }
                if (__ELOAM_OBJ.data.ocxDivId) {
                    __ELOAM_OBJ.el('#' + __ELOAM_OBJ.data.ocxDivId).attr('style', 'display:none')
                }
                break;
            case 2:
                // 打开
                if (__ELOAM_OBJ.isIE) {
                    if (__ELOAM_OBJ.data.ocxDivId) {
                        __ELOAM_OBJ.el('#' + __ELOAM_OBJ.data.ocxDivId).attr('style', 'display:block')
                    }
                } else {
                    if (__ELOAM_OBJ.data.imgMainDivId) {
                        __ELOAM_OBJ.el('#' + __ELOAM_OBJ.data.imgMainDivId).attr('style', 'display:block')
                    }
                }
                break;
            case 3:
                // 关闭
                if (__ELOAM_OBJ.isIE) {
                    if (__ELOAM_OBJ.data.ocxDivId) {
                        __ELOAM_OBJ.el('#' + __ELOAM_OBJ.data.ocxDivId).attr('style', 'display:none')
                    }
                } else {
                    if (__ELOAM_OBJ.data.imgMainDivId) {
                        __ELOAM_OBJ.el('#' + __ELOAM_OBJ.data.imgMainDivId).attr('style', 'display:none')
                    }
                }
                break;
        }
    }

    var __webCamera = {
        doCamera: function(data,suc,fail){
            var open = findDefaultValue(data.isOpen,'0')
            if(open === '0'){
                __webCamera.closeCamera(data,suc,fail)
            }else if(open === '1'){
                __webCamera.openCamera(data,suc,fail)
            }
        },

        openCamera: function (data, suc, fail) {
            var devIndex = data.devIndex
            // 打开成功
            if (!devIndex) {
                devIndex = 0;
            }
            // 打开摄像头需要将这个继续打开
            doOpenCamera(devIndex,suc,fail)
        },
        closeCamera: function (data, suc, fail) {
            if (__ELOAM_OBJ.isIE) {
                if (__ELOAM_OBJ.data.ocxName) {
                    __ELOAM_OBJ.data.ocxName.StopPreview();
                }
            } else {
                var DevIndex = data.devIndex
                if (!DevIndex) {
                    DevIndex = 0;
                }
                var _data = {
                    camidx: DevIndex + ''
                }
                doFun(true, 'video=close', JSON.stringify(_data), function (data) {
                    if (__ELOAM_OBJ.data.imgMainId) {
                        __ELOAM_OBJ.el('#' + __ELOAM_OBJ.data.imgMainId).attr('src', '')
                    }
                    if(__ELOAM_OBJ.hideDivImg){
                        doImgDiv(3)
                    }
                    localStorage.setItem("devIndex", '')
                    doCal(suc, data)
                }, fail)
            }
        },
        checkCameraStatus: function(suc,fail){
            doFun(true, 'camera=state', '{}', suc, fail)
        },
        getEquipmentType: function (suc, fail) {
            doFun(true, 'device=getequipmenttype', '{}', suc, fail)
        },
        findVideoList: function(suc,fail){
          doFun(true,'video=record','{"action":"audio"}',true,fail)
        },
        findVideoStatus: function(suc,fail){
            doFun(true,'video=record','{"action":"status"}',suc,fail)
        },
        startVideoRecord: function(data,suc,fail){
            var _data = {
                "action": "start",
                parameter: {
                    camidx: findDefaultValue(data.devIndex,'0'),
                    width: findDefaultValue(data.width,'640'),
                    height: findDefaultValue(data.height,'480'),
                    audio: findDefaultValue(data.audio,''),
                    framerate: findDefaultValue(data.frameRate,'10'),
                    filepath: findDefaultValue(data.filePath,''),
                    bit_rate: findDefaultValue(data.bitRate,'400000'),
                }
            }
            var watermark = data.watermark
            if(watermark && __eloam_uitl.isExistValue(watermark.pos)){
                _data.parameter.watermark = {
                    pos: findDefaultValue(watermark.pos,'0'),
                    content: findDefaultValue(watermark.content,__eloam_uitl.findTime()),
                    transparency: findDefaultValue(watermark.transparency,'200'),
                    fontsize: findDefaultValue(watermark.fontSize,'32'),
                    font: findDefaultValue(watermark.font,'微软雅黑'),
                    color: findDefaultValue(watermark.color,'yellow'),
                }
            }
            doFun(true,'video=record',JSON.stringify(_data),suc,fail)
        },
        stopAndFindVideoRecord: function(data, suc, fail){
            var findStatus = findDefaultValue(data.findStatus,'0')
            doFun(true,'video=record','{"action":"stop"}',function (data) {
                if(findStatus == '0'){
                    doCal(suc,data)
                }else {
                    setTimeout(function () {
                        doFun(true,'videobase64=get','{}',suc,function (_v) {
                            doCal(fail,'停止录制成功，获取视频数据失败；原因：'+_v)
                        })
                    },1000)
                }
            },function (err) {
                doCal(fail,'停止录制视频失败，失败原因为：'+err)
            })
        },
        getResolution: function (data, suc, fail) {
            var devIndex = data.devIndex;
            if (!devIndex) {
                devIndex = 0
            }
            var _data = {
                camidx: devIndex + "",
                mode: '1'
            }
            doFun(true, 'device=getresolution', JSON.stringify(_data), suc, fail)
        },
        doZoom: function(data,suc,fail){
            var _data = {
                camidx: findDefaultValue(data.devIndex,'0'),
                corp: findDefaultValue(data.corp,'0')
            }
            doFun(true, 'stream=zoominout', JSON.stringify(_data), suc, fail)
        },
        setResolution: function (data, suc, fail) {
            // mode
            // 视频模式，0：YUY2（高清）；1：MJPG（高速）
            // "YUY2"---> 0
            // "MJPG"---> 1
            var _data = {
                camidx: findDefaultValue(data.devIndex,'0'),
                width: findDefaultValue(data.width,'800'),
                height: findDefaultValue(data.height,'600'),
                mode: '1'
            }
            doFun(true, 'device=setresolution', JSON.stringify(_data), suc, fail)
        },
        getQrCode: function (data, suc, fail) {
            var _data = {
                time: findDefaultValue(data.timeout, '20')
            }
            doFun(true, 'barcode=get', JSON.stringify(_data), suc, function (data) {
                if (data.code == 1) {
                    data.errorMessage = '识别超时'
                } else if (data.code == 2) {
                    data.errorMessage = '其他错误'
                }
                doCal(fail, data)
            })
        },
        readIDCard: function (suc, fail) {
            doFun(false, 'card=idcard', '{}', suc, fail)
        },
        faceLive: function (data, suc, fail) {
            var _data = {
                time: findDefaultValue(data.timeout, '20')
            }
            doFun(true, 'faceLive=start', JSON.stringify(_data), suc, fail)
        },
        faceComparisonEx: function (data, suc, fail) {
            if(!data.oneFace){
                doCal(fail,'第一个人脸不能为空~')
                return
            }
            if(!data.twoFace){
                doCal(fail,'第二个人脸不能为空')
                return
            }
            var _data = {
                FaceOne: data.oneFace,
                FaceTwo: data.twoFace
            }
            doFun(true, 'comparison=imgdata', JSON.stringify(_data), suc, fail)
        },
        grabImageBase64: function (data, suc, fail) {
            var _data = {
                filepath: 'base64',
                rotate: findDefaultValue(data.rotate, '0'),
                camidx: findDefaultValue(data.devIndex, '0'),
                cutpage: findDefaultValue(data.cutpage, '0'),
            }
            doFun(true, 'video=grabimage', JSON.stringify(_data), suc, fail)
        },
        autoFlat: function(data,suc,fail){
            var __autoFlat = data.autoFlat
            var _data = {
                filepath: findDefaultValue(data.filepath,''),
                rotate: findDefaultValue(data.rotate,'0'),
                devIndex: findDefaultValue(data.devIndex,'0'),
                cutpage: findDefaultValue(data.cutPage,'0')
            }
            if(__autoFlat && !__eloam_uitl.isEmptyObj(__autoFlat)){
                _data.autoflat = {
                    flat: findDefaultValue(__autoFlat.flat,'1'),
                    leftfilepath: findDefaultValue(__autoFlat.leftFilePath,''),
                    rightfilepath: findDefaultValue(__autoFlat.rightFilePath,''),
                    removefinger: findDefaultValue(__autoFlat.removeFinger,''),
                    doublepage: findDefaultValue(__autoFlat.doublePage,'')
                }
            }
            doFun(true,'video=autoflat',JSON.stringify(_data),suc,fail)
        },
        autoTakePhotos: function(data,suc,fail){
            var _data = {
                listpath: findDefaultValue(data.listPath,''),
                filepath: findDefaultValue(data.filePathPrefix,'LT'),
                movedetecflag: '1'
            }
            doFun(true,'video=movedetec',JSON.stringify(_data),suc,fail)
        },
        stopAutoTakePhotos: function(suc,fail){
            var _data = {
                movedetecflag: '0'
            }
            doFun(true,'video=movedetec',JSON.stringify(_data),suc,fail)
        },
        twoInchPhoto: function(suc,fail){
            doFun(true,'twoinchphoto','{}',suc,fail)
        },
        imageArea: function(data,suc,fail){
            var _data = {
                filepath: findDefaultValue(data.filepath,''),
                left: findDefaultValue(data.left,'0'),
                top: findDefaultValue(data.top,'0'),
                right: findDefaultValue(data.right,'100'),
                bottom: findDefaultValue(data.bottom,'100'),
            }
            doFun(true,'select=imagearea',JSON.stringify(_data),suc,fail)
        },
        grabImage: function (data, suc, fail) {
            var watermark = data.watermark
            var _data = {
                filepath: findDefaultValue(data.filePath, ''),
                rotate: findDefaultValue(data.rotate, '0'),
                camidx: findDefaultValue(data.devIndex, '0'),
                deskew: findDefaultValue(data.deskew, '0'),
                deskewval: findDefaultValue(data.deskewval, '0'),
                quality: findDefaultValue(data.quality, '1'),
                ColorMode: findDefaultValue(data.colorMode, '0'),
                bAutoAdjust: findDefaultValue(data.bAutoAdjust, '0'),
                bIsPrint1to1: findDefaultValue(data.bIsPrint1to1, '0'),
                /*watermark: {
                    pos: findDefaultValue(watermark.pos, '0'),
                    content: findDefaultValue(watermark.content, ''),
                    transparency: findDefaultValue(watermark.transparency, '0'),
                    fontsize: findDefaultValue(watermark.fontsize, '100'),
                    font: findDefaultValue(watermark.font, '微软雅黑'),
                    color: findDefaultValue(watermark.color, 'yellow')
                }*/
            }
            if (watermark && !__eloam_uitl.isEmptyObj(watermark)) {
                _data.watermark = {
                    pos: findDefaultValue(watermark.pos, '4'),
                    content: findDefaultValue(watermark.content, __eloam_uitl.findTime()),
                    transparency: findDefaultValue(watermark.transparency, '200'),
                    fontsize: findDefaultValue(watermark.fontsize, '32'),
                    font: findDefaultValue(watermark.font, '微软雅黑'),
                    color: findDefaultValue(watermark.color, 'yellow')
                }
            }
            doFun(true, 'video=grabimage', JSON.stringify(_data), suc, fail)
        },
        sendSerialport: function (data, suc, fail) {
            var _data = {
                sendserialport: findDefaultValue(data.sendserialport, "21"),
                data: findDefaultValue(data.data, "110"),
            }
            doFun(true, 'serialport=sendserialport', JSON.stringify(_data), function (data) {
                // 这里说明成功啦
                setTimeout(function () {
                    doFun(true, 'serialport=getdata', '{}', suc, fail)
                }, 500)
            }, fail)
        },
        pushWebPage: function(data,suc,fail){
            var url = data.url
            if(!url){
                doCal(fail,'推送网页不能为空')
                return
            }
            var _data = {
                url: url
            }
            doFun(true,'pendisplay=pushwebpage',JSON.stringify(_data),suc,fail)
        },
        closeWebPage: function(suc,fail){
            doFun(true,'pendisplay=closewebpage','{}',suc,fail)
        },
        readIcCard: function (data, suc, fail) {
            var icCardType = data.icCardType
            if (!icCardType) {
                icCardType = 4;
            }
            // 这里校验ic卡类型
            var _icCardType = parseInt(icCardType)
            if (_icCardType < 1 || _icCardType > 7) {
                doCal(fail, '请检查ic卡类型')
                return
            }
            var _data = {
                iccardtype: icCardType
            }
            doFun(true, 'card=iccard', JSON.stringify(_data), suc, fail)
        },
        signDlg: function (data, suc, fail) {
            var pos = data.pos
            if (!pos) {
                pos = {
                    top: 250,
                    left: 280,
                    width: 600,
                    height: 250
                }
            }
            var _data = {
                pos: {
                    top: findDefaultValue(pos.top, "250"),
                    left: findDefaultValue(pos.left, "280"),
                    width: findDefaultValue(pos.width, "600"),
                    height: findDefaultValue(pos.height, "250"),
                },
                remark: findDefaultValue(data.remark, "开始签名"),
            }
            doFun(true, 'serialport=sign', JSON.stringify(_data), suc, fail)
        },
        closeSign: function(suc,fail){
            doFun(true,'serialport=close','{}',suc,fail)
        },
        findSignResult: function(suc,fail){
            doFun(true, 'serialport=getdata', '{}', suc,fail)
        },
        getTerminalSerialNumber: function (suc, fail) {
            doFun(true, 'device=getsonixserialnumber', '{}', suc, fail)
        },
        checkTerminalConnect: function (suc, fail) {
            doFun(true, 'device=isconnect', '{}', suc, fail)
        },
        getAudioList: function (suc, fail) {
            var _data = {
                action: 'audio'
            }
            doFun(true, 'video=record', JSON.stringify(_data), suc, fail)
        },
        leftRotate: function (data, suc, fail) {
            var devIndex = data.devIndex
            if (!devIndex) {
                devIndex = 0;
            }
            var _data = {
                camidx: devIndex + '',
                rotate: '90'
            }
            doFun(true, 'video=rotate', JSON.stringify(_data), suc, fail)
        },
        rightRotate: function (data, suc, fail) {
            var devIndex = data.devIndex
            if (!devIndex) {
                devIndex = 0;
            }
            if(devIndex != 0){
                doCal(fail,'只有主头才能旋转~请检查')
                return
            }
            var _data = {
                camidx: devIndex + '',
                rotate: '270'
            }
            doFun(true, 'video=rotate', JSON.stringify(_data), suc, fail)
        },
        doOcr: function (data, suc, fail) {
            var imgPath = data.imgPath
            var savePDFPath = data.savePDFPath
            if (!imgPath) {
                doCal(fail, '待OCR图片不能为空')
                return
            }
            if (!savePDFPath) {
                doCal(fail, '保存识别结果不能为空')
                return
            }
            var _data = {
                ocrflag: '1',
                picfilepath: imgPath,
                savefilepath: savePDFPath
            }
            doFun(true, 'savefilepath', JSON.stringify(_data), suc, fail)
        },
        templateOcr: function(data,suc,fail){
            doFun(true,'templateOCR',JSON.stringify(data),suc,fail)
        },
        doDeskew: function (data,suc,fail) {
            var devIndex = findDefaultValue(data.devIndex,'0');
            if(devIndex != '0'){
                doCal(fail,'只有主头才能打开纠偏，请检查~')
                return
            }
            var _data = {
                camidx: devIndex,
                open: findDefaultValue(data.status,'0')
            }
            doFun(true,'dvideo=cameradeskew',JSON.stringify(_data),suc,fail)
        },
        findFingerprint: function (data,suc,fail) {
            var _data = {
                time:findDefaultValue(data.timeout,'20')
            }
            doFun(true,'biokey=get',JSON.stringify(_data),suc,fail)
        },
        showEvaluator: function (suc,fail) {
            doFun(true,'sign=showevaluator','{}',suc,fail)
        },
        closeEvaluator: function (suc,fail) {
            doFun(true,'sign=closeevaluator','{}',suc,fail)
        },
        findFindEvaluator: function(suc,fail){
            doFun(true,'sign=getevaluatorresult',suc,fail)
        },
        a3a4AutoSwitch: function (data,suc,fail) {
            var _data = {
                switchflag:findDefaultValue(data.switchFlag,'0'),
                a3size: findDefaultValue(data.a3size,'0.5'),
                a4size: findDefaultValue(data.a4size,'0.9')
            }
            doFun(true,'device=a3a4switch',JSON.stringify(_data),suc,fail)
        },
        findEncryptionKey: function (suc,fail) {
            doFun(true,'softkey=check','{}',suc,fail)
        },
        imgCompose: function (data,suc,fail) {
            if(!data.oneImgBase64){
                doCal(fail,'第一张图片不能为空')
                return
            }
            if(!data.twoImgBase64){
                doCal(fail,'第二张图片不能为空')
                return
            }
            var _data = {
                imageOne: data.oneImgBase64,
                imageTwo: data.twoImgBase64
            }
            doFun(true,'iamge=compose',JSON.stringify(_data),suc,fail)
        },
        addImgToPdfQueue: function (data,suc,fail) {
            if(!data.imgPath && !data.imgBase64){
                doCal(fail,'请检查加入到队列中的图片')
                return
            }
            var _data = {
                ImagePath: data.imgPath,
                ImageBase64: data.imgBase64
            }
            doFun(true,'pdf=addimage',JSON.stringify(_data),suc,fail)
        },
        closePdfQueueAndFind: function(data,suc,fail){
            var findStatus = findDefaultValue(data.findStatus,'0')
            doFun(true,'pdf=clear','{}',function (_k) {
                if(findStatus == 0){
                    doCal(suc,_k)
                }else {
                    doFun(true,'videobase64=get','{}',suc,function (err) {
                        doCal(fail,'清除成功，但获取失败；失败原因为：'+err)
                    })
                }
            },fail)
        },
        createPdfRecord: function (data,suc,fail) {
            var padPath = data.pdfPath
            if(!padPath){
                doCal(fail,'保存pdf 路径不能为空')
                return
            }
            var _data = {
                PdfPath: padPath
            }
            doFun(true,'pdf=save',JSON.stringify(_data),suc,fail)
        },
        composePhotos: function (data,suc,fail) {
            if(!data.outputFilePath){
                doCal(fail,'输出文件保存地址不能为空')
                return
            }
            if(!data.outputMaxWidth){
                doCal(fail,'合成后文件最大宽度不能为空')
                return
            }
            if(!__eloam_uitl.isExistValue(data.inputImageType)){
                doCal(fail,'待合成文件类型不能为空')
                return
            }
            if(!__eloam_uitl.isExistValue(data.outputImageType)){
                doCal(fail,'合成后文件类型不能为空')
                return
            }
            if(!__eloam_uitl.isExistValue(data.isIdCardCompose)){
                doCal(fail,'是否是身份证不能为空')
                return
            }
            if(!data.imageList){
                doCal(fail,'待合成图片列表不能为空')
                return
            }
            var _data = {
                "outputfilepath": data.outputFilePath,
                "outputmaxwidth": data.outputMaxWidth,
                "inputimagetype": data.inputImageType,
                "outputimagetype": data.outputImageType,
                "isIDCardCompose": data.isIdCardCompose,
                "imagelist":data.imageList
            }
            doFun(true,'compose=photos',JSON.stringify(_data),suc,fail)
        },
        getCurResolutionIndex: function(suc,fail){

        },
        doCustomCall:function ({method,url,data,success,error}) {
            if(!url){
                doCal(error,'请求url 不能为空')
                return
            }
            if(!method){
                method = 'post'
            }
            if(!data){
                data = '{}'
            }else {
                if((typeof data === 'string') && data.constructor===String){
                    //console.log('字符串')
                }else {
                    data = JSON.stringify(data)
                }
            }
            doFun((method == 'post' || method == 'POST'),url,data,success,error)
        }
    }
    var initCamera = !!data.initCamera
    // 这里需要增加判断是否连上
    doFun(true, 'device=isconnect', '{}', function (data) {
        // 这里说明
        // console.log(data)
        var number = parseInt(data);
        if (number < 1) {
            doCal(fail, '请检查设备是否插好~')
        } else {
            suc(number)
            if(initCamera){// 检查摄像头状态
                // 这里需要检查摄像头状态
                doFun(true,'camera=state','{}',function (data) {
                    var state = data.state
                    if(state){
                        var str = state.split(",");
                        for(var i=0;i<str.length;i++){
                            if(str[i] === 'opened'){
                                __webCamera.closeCamera({devIndex:i})
                            }
                        }
                    }
                },function (err) {
                    console.log('不支持camera=state方法，错误信息：'+err)
                    var devIndex = localStorage.getItem("devIndex")
                    if (devIndex == 0 || devIndex) {
                        // 这里需要关闭
                        __webCamera.closeCamera({devIndex: devIndex}, function (data) {
                            console.log('刷新后，初始化关闭原来的摄像头成功')
                        }, function (err) {
                            console.log('刷新后，初始化关闭原来的摄像头失败')
                        })
                    }
                })
            }
        }
        //suc("ok")
    }, fail)
    doInit()
    return __webCamera
}

// 使用vue 项目需要打开这个注释
//export default WebCamera
