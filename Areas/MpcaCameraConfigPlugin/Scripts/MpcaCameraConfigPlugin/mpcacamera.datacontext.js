/// <reference path="mpcacamera.common.js" />

window.mpcacamerasetting.datacontext = (function ($, common) {
    var CameraConfigContext = {
        oncameraselected: oncameraselected,
        getcameraconfigdetail: getcameraconfigdetail,
        getstreamers: getstreamers,
        getstreamerdetail: getstreamerdetail,
        savecameraconfigdetail: savecameraconfigdetail,
        getassociateddevices: getassociateddevices,
        getdevicecapabilityinfo: getdevicecapabilityinfo,
        getassociateddevices: getassociateddevices,
        geteventrecordingdetails: geteventrecordingdetails,
        getinputdetails: getinputdetails,
        getcontinuousscheduledetails: getcontinuousscheduledetails,
        getcontinuousrecordingdetails: getcontinuousrecordingdetails,
        getmotionscheduledetails: getmotionscheduledetails,
        getmotionrecordingdetails: getmotionrecordingdetails,
        getschedulesettings: getschedulesettings,
        saveschedulesettings: saveschedulesettings,
        getuseddevicecapacity: getuseddevicecapacity,
        updatecapabilityprogress: updatecapabilityprogress,
        getdiscovereddevices: getdiscovereddevices,
        getLivestream: getLivestream,
        sendStopCamerarequest: sendStopCamerarequest,
        getmaxbitrateduration: getmaxbitrateduration,
        updatecapabilitycache: updatecapabilitycache,
        getusedanalogslots: getusedanalogslots,
        getallcameradetails: getallcameradetails
    };
    var currentSelectedcamera = null;
    var parentData = null;
    var devicecapabilityinfocache = new libhash();
    var devicecapabilitymanager = null;
    var devicecapabilitymanagerparentid;
    var isloadparamforallcameras = false;
    var discoveredcameracache = [];
    var discoveredcameraparentid;
    var allcameradetails = null;
    var data = null;

    function oncameraselected(data, parentdata) {
        currentSelectedcamera = data;
        parentData = parentdata;
        isloadparamforallcameras = false;
        allcameradetails = null;
    }

    function getusedanalogslots(excludecameraid, callback) {
        getuseddevicecapacity(function (issuccess) {
            var slots = [];
            if (issuccess) {
                slots = $.map(allcameradetails, function (camera) {
                    if (camera.Id != excludecameraid
                        && camera.IsActive
                        && camera.CameraType.toLowerCase() == common.constants.cameratypes.AnalogCamera.toLowerCase()) {
                        return camera.AnalogInput;
                    }
                });
            }
            if (callback)
                callback(slots);
        });
    }
    function getdiscovereddevices(callback) {
        if (parentData == undefined) {
            if (callback)
                callback(false, null);
            return;
        }
        if (discoveredcameraparentid && parentData.Id == discoveredcameraparentid) {
            if (callback)
                callback(true, discoveredcameracache);
        }
        else {
            discoveredcameraparentid = null;
            data = ({ recorderId: parentData.Id });
            return new ajaxRequest("POST", getdiscoverydevicesurl(),data).done(function (jsonresult) {
                if (jsonresult.Success) {
                    discoveredcameracache = jsonresult.data;
                    discoveredcameraparentid = parentData.Id;
                    if (callback)
                        callback(true, discoveredcameracache);
                }
                else {
                    if (callback)
                        callback(false, discoveredcameracache);
                }
            }).error(function () {
                if (callback)
                    callback(false, null);
            });
        }
    }
    function saveschedulesettings(schedulemodel) {
        schedulemodel.recordingmode=schedulemodel.Type().value;
        schedulemodel.recorderid=parentData.Id;
        //data=({recordingmode:recorderId=" + recorderid});
        return ajaxRequest("POST", saveschedulesettingsurl(), schedulemodel);
    }
    function getschedulesettings(scheduleId) {
        data = ({ scheduleId: scheduleId });
        return ajaxRequest("POST", getschedulesettingsurl(),data);
    }
    function getdevicecapabilityinfo(callback) {
        data = ({ modeltype: parentData.DeviceType.Name });
        if (parentData == undefined || parentData.DeviceType == undefined) {
            if (callback)
                callback(null);
            return;
        }
        var devicecapabilityinfo = devicecapabilityinfocache.get(parentData.DeviceType.Name);
        if (devicecapabilityinfo && callback) {
            callback(devicecapabilityinfo);
            return;
        }
        return new ajaxRequest("POST", getdevicecapabilityinfourl(),data).done(function (jsonresult) {
            if (jsonresult.Success) {
                devicecapabilityinfo = jsonresult.data;
                if (devicecapabilityinfo && devicecapabilityinfocache.get(parentData.DeviceType.Name) == undefined)
                    devicecapabilityinfocache.save(parentData.DeviceType.Name, devicecapabilityinfo);
                if (callback)
                    callback(devicecapabilityinfo);
            }
        }).error(function () {
            if (callback)
                callback(null);
        });
    }
    function gettotaldevicecapacity(callback) {
        data = ({ recorderId: parentData.Id });
        if (parentData == undefined) {
            if (callback)
                callback();
            return;
        }
        if (devicecapabilitymanagerparentid && parentData.Id == devicecapabilitymanagerparentid) {
            if (callback)
                callback();
        }
        else {
            devicecapabilitymanager = null;
            devicecapabilitymanagerparentid = null;
            return new ajaxRequest("POST", getdevicecapacityurl(),data).done(function (jsonresult) {
                if (jsonresult.Success) {
                    devicecapabilitymanager = new CameraConfigContext.devicecapabilitymanager(jsonresult.data);
                    devicecapabilitymanagerparentid = parentData.Id;
                }
                if (callback)
                    callback();
            }).error(function () {
                if (callback)
                    callback();
            });
        }
    }
    function getuseddevicecapacity(callback) {
        if (parentData == undefined) {
            if (callback)
                callback(false);
            return;
        }
        if (isloadparamforallcameras) {
            if (callback)
                callback(true);
            return;
        }
        gettotaldevicecapacity(function () {
            data = ({ recorderId: parentData.Id });
            if (allcameradetails == null) {
                return new ajaxRequest("POST", getcamerasdetailurl(),data).done(function (jsonresult) {
                    if (jsonresult.Success) {
                        allcameradetails = jsonresult.data;
                        loadparamforallcameras();
                        if (callback)
                            callback(true);
                    }
                    else {
                        if (callback)
                            callback(false);
                    }
                }).error(function () {
                    if (callback)
                        callback(false);
                });
            }
            else {
                loadparamforallcameras();
                if (callback)
                    callback(true);
            }
        });
    }
    function loadparamforallcameras() {
        var camerascapabilityparams = $.map(allcameradetails, function (camera) {
            return new CameraConfigContext.devcapabilityparam(camera);
        });
        devicecapabilitymanager.loadparamforallcameras(camerascapabilityparams);
        isloadparamforallcameras = true;
    }
    function getallcameradetails(callback) {
        data = ({ recorderId: parentData.Id });
        if (allcameradetails != null) {
            if (callback)
                callback(allcameradetails);
        }
        else {
            return new ajaxRequest("POST", getcamerasdetailurl(),data).done(function (jsonresult) {
                if (jsonresult.Success) {
                    allcameradetails = jsonresult.data;
                    if (callback)
                        callback(allcameradetails);
                }
                if (callback)
                    callback(allcameradetails);
            }).error(function () {
                if (callback)
                    callback(allcameradetails);
            });
        }
    }
    function updatecapabilitycache(devcapabilityparam) {
        getuseddevicecapacity(function (issuccess) {
            if (issuccess)
                devicecapabilitymanager.updatedevicecapabilitycache(devcapabilityparam);
        });
    }
    function updatecapabilityprogress(devcapabilityparam) {
        getuseddevicecapacity(function (issuccess) {
            if (issuccess)
                devicecapabilitymanager.updatedevicecapability(devcapabilityparam);
        });
    }
    function getmaxbitrateduration(devcapabilityparam, callback) {
        gettotaldevicecapacity(function () {
            var maxduration = devicecapabilitymanager.getmaxbitrateduration(devcapabilityparam);
            if (callback)
                callback(maxduration);
        });
    }

    function getcameraconfigdetail() {
        data = ({ cameraId: currentSelectedcamera.nodedata.Id });
        return ajaxRequest("POST", getcameraconfigdetailurl(),data);
    }
    function getstreamers(cameramodel, callback) {
        data = ({parentmodeltype:parentData.DeviceType.Name,cameratype:cameramodel.SelectedCameraType().Key});
        ajaxRequest("POST", getstreamsurl( ),data).done(function (jsondata) {
            if (jsondata.Success) {
                var streams = $.map(jsondata.data, function (streamItem) {
                    return new CameraConfigContext.streamEntity(streamItem);
                });
                cameramodel.InitialiseStreamentities(streams);
            }
            if (callback)
                callback();
        }).error(function () {
            if (callback)
                callback();
        });
    }
    function getstreamerdetail(streamerid) {
        data = ({parentId:parentData.Id,streamerId:streamerid});
        return ajaxRequest("POST", getstreamdetailurl(),data);
    }
    function savecameraconfigdetail(data, successcallback, errorcallback) {
        return new ajaxRequest("post", savecameraconfigdetailurl(), data).done(function (jsonresult) {
            if (jsonresult.success) {
                currentSelectedcamera.updatecallback(jsonresult.data);
                if (successcallback) {
                    successcallback(jsonresult);
                }
            }
            else {
                if (errorcallback) {
                    errorcallback(jsonresult);
                }
            }
        }).error(function () {
            if (errorcallback) {
                errorcallback();
            }
        });
    }
    function getassociateddevices(cameramodel, issendonlycount, callback) {
        data = ({ cameraId: cameramodel.Id });
        return new ajaxRequest("POST", getassociateddevicesurl(),data).done(function (jsonresult) {
            if (jsonresult.Success) {
                if (issendonlycount) {                    
                    if (callback) {
                        callback(jsonresult.data);
                        return;
                    }
                }
                var result = cameramodel.InitialiseAssociatedDevices(jsonresult.data);
                if (callback) {
                    callback(result);
                }
            }
        }).error(function () {
            if (callback) {
                callback(null);
            }
        });
    }
    function getinputdetails() {
        data = ({ recorderId: parentData.Id });
        return ajaxRequest("POST", getinputdetailsurl(),data);
    }
    function geteventrecordingdetails() {
        data = ({ cameraId: currentSelectedcamera.nodedata.Id });
        return ajaxRequest("POST", geteventrecordingdetailsurl(),data);
    }
    function getcontinuousscheduledetails() {
        data = ({ recorderId: parentData.Id });
        return ajaxRequest("POST", getcontinuousscheduledetailsurl(),data);
    }
    function getcontinuousrecordingdetails() {
        data = ({ cameraId: currentSelectedcamera.nodedata.Id });
        return ajaxRequest("POST", getcontinuousrecordingdetailsurl(),data);
    }
    function getmotionscheduledetails() {
        data = ({ recorderId: parentData.Id });
        return ajaxRequest("POST", getmotionscheduledetailsurl(),data);
    }
    function getmotionrecordingdetails() {
        data = ({ cameraId: currentSelectedcamera.nodedata.Id });
        return ajaxRequest("POST", getmotionrecordingdetailsurl(),data);
    }


    function getLivestream(cameraid, sessionid) {
        data=({cameraId:cameraid ,Id:sessionid});
        return new ajaxRequest("POST", getLiveurl(),data);
    }

    function sendStopCamerarequest(cameraid, sessionid) {
        data=({cameraId:cameraid ,Id:sessionid});
        return new ajaxRequest("Post", sendStopCameraURL(),data);
    }


    function getcameraconfigdetailurl() {
        return $("#mpcacameraconfigurl").attr("data-url") + "/GetCameradetail";//?cameraId=" + cameraId;
    }
    function getstreamsurl() {
        return $("#mpcacameraconfigurl").attr("data-url") + "/GetStreamers";//?parentmodeltype=" + parentmodeltype + "&cameratype=" + cameratype;
    }
    function getstreamdetailurl() {
        return $("#mpcacameraconfigurl").attr("data-url") + "/GetStreamerdetail";//?parentId=" + parentid + "&streamerId=" + streamerid;
    }
    function savecameraconfigdetailurl() {
        return $("#mpcacameraconfigurl").attr("data-url") + "/SaveCameraConfigDetail";
    }
    function getassociateddevicesurl() {
        return $("#mpcacameraconfigurl").attr("data-url") + "/GetAssociatedDevices";//?cameraId=" + cameraId;
    }
    function geteventrecordingdetailsurl() {
        return $("#mpcacameraconfigurl").attr("data-url") + "/GetEventRecordingDetails";//?cameraId=" + cameraId;
    }
    function getdevicecapabilityinfourl() {
        return $("#mpcacameraconfigurl").attr("data-url") + "/GetDeviceCapabilityInfo";//?modeltype=" + modeltype;
    }
    function getinputdetailsurl() {
        return $("#mpcacameraconfigurl").attr("data-url") + "/GetInputDetails";//?recorderId=" + recorderId;
    }
    function getcontinuousscheduledetailsurl() {
        return $("#mpcacameraconfigurl").attr("data-url") + "/GetContinuousSchedulesDetails";//?recorderId=" + recorderId;
    }
    function getcontinuousrecordingdetailsurl() {
        return $("#mpcacameraconfigurl").attr("data-url") + "/GetContinuousRecordingDetails";//?cameraId=" + cameraId;
    }
    function getmotionscheduledetailsurl() {
        return $("#mpcacameraconfigurl").attr("data-url") + "/GetMotionSchedulesDetails";//?recorderId=" + recorderId;
    }
    function getmotionrecordingdetailsurl() {
        return $("#mpcacameraconfigurl").attr("data-url") + "/GetMotionRecordingScheduleDetails";//?cameraId=" + cameraId;
    }
    function getschedulesettingsurl() {
        return $("#mpcacameraconfigurl").attr("data-url") + "/GetScheduleSettings";//?scheduleId=" + scheduleId;
    }
    function saveschedulesettingsurl() {
        return $("#mpcacameraconfigurl").attr("data-url") + "/SaveScheduleDetail";//?recordingmode=" + scheduletype + "&recorderId=" + recorderid;  //model+data
    }
    function getcamerasdetailurl() {
        return $("#mpcacameraconfigurl").attr("data-url") + "/GetCamerasdetail";//?recorderId=" + recorderId;
    }
    function getdevicecapacityurl() {
        return $("#mpcacameraconfigurl").attr("data-url") + "/GetDeviceCapacity";//?recorderId=" + recorderId;
    }
    function getdiscoverydevicesurl() {
        return $("#mpcacameraconfigurl").attr("data-url") + "/GetDiscoveredDevices";//?recorderId=" + recorderId;
    }
    function getLiveurl() {
        var url = $("#getLiveUrl").attr("data-url");// + "?cameraId=" + cameraId + "&Id=" + Id;
        return url;
    }
    function sendStopCameraURL() {
        var url = $("#SendstopRequestUrl").attr("data-url");// + "?cameraId=" + cameraId + "&Id=" + Id;
        return url;
    }
    return CameraConfigContext;
})($, window.mpcacamerasetting.common);
