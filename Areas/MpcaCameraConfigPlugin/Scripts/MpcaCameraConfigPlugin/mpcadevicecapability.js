/// <reference path="mpcacamera.common.js" />

window.mpcacamerasetting.devicecapability = (function (common) {
    var devcapabilityparam = function (data) {
        var self = this;
        data = data || {};
        self.isactivechannel = false;
        self.channel = data.Address;
        self.resolution = data.Resolution;
        self.frameratelive = parseInt(data.FPS);
        self.qualitylive = data.Quality;
        self.frameraterecord = parseInt(data.RecordingFPS);
        self.qualityrecord = data.RecordingQuality;
        self.preeventduration = parseInt(data.PreEvent);
        self.usedlivecapability = 0;
        self.usedrecordcapability = 0;
    }
    window.mpcacamerasetting.datacontext.devcapabilityparam = devcapabilityparam;

    var devcapabilitymanager = function (data) {
        var self = this;
        data = data || {};       

        var discreteframeratelist = [5, 15, 30];
        var numdiscreteresolution = 5;
        var numdiscreteframerate = 3;
        var ConfigCoeffTableA = data.ConfigCoeffTableA;
        var ConfigCoeffTableB = data.ConfigCoeffTableB;
        var ConfigCoeffTableClive = data.ConfigCoeffTableClive;
        var ConfigCoeffTableCrecord = data.ConfigCoeffTableCrecord;
        var ConfigCoeffD = data.ConfigCoeffD;
        var ConfigResourceUnitsLive = data.ConfigResourceUnitsLive;
        var ConfigResourceUnitsRecord = data.ConfigResourceUnitsRecord;
        var ClipSize = 10240; //temporarily hardcoding but need to get from device during configupload
        var usedcapabilitylist = [];

        function ceil_quality(quality) {
            var discreteQualityIndex = 0;
            switch (quality.toUpperCase()) {
                case common.constants.QualityList.GOOD:
                    discreteQualityIndex = 0;
                    break;
                case common.constants.QualityList.BETTER:
                    discreteQualityIndex = 1;
                    break;
                case common.constants.QualityList.BEST:
                    discreteQualityIndex = 2;
                    break;
                default:
                    discreteQualityIndex = 1;
                    break;
            }
            return discreteQualityIndex;
        }

        function ceil_resolution(resolution) {
            var discreteResolutionIndex = 0;
            if (resolution) {
                switch (resolution.toUpperCase()) {
                    case common.constants.ResolutionList.CIF.toUpperCase():
                        discreteResolutionIndex = 0;
                        break;
                    case common.constants.ResolutionList.R320_180.toUpperCase():
                    case common.constants.ResolutionList.R320_240.toUpperCase():
                    case common.constants.ResolutionList.R352_240.toUpperCase():
                    case common.constants.ResolutionList.R352_288.toUpperCase():
                        discreteResolutionIndex = 1;
                        break;
                    case common.constants.ResolutionList.R640_360.toUpperCase():
                    case common.constants.ResolutionList.R640_480.toUpperCase():
                    case common.constants.ResolutionList.R800_450.toUpperCase():
                        discreteResolutionIndex = 2;
                        break;
                    case common.constants.ResolutionList.R1280_720.toUpperCase():
                        discreteResolutionIndex = 3;
                        break;
                    case common.constants.ResolutionList.R1920_1080.toUpperCase():
                        discreteResolutionIndex = 4;
                        break;
                    default:
                        discreteResolutionIndex = 0;
                        break;
                }
            }
            return discreteResolutionIndex;
        }

        function ceil_framerate(framerate) {
            var discretFrameRateIndex;
            for (discretFrameRateIndex = numdiscreteframerate - 1; discretFrameRateIndex > 0; discretFrameRateIndex--) {
                if (framerate > discreteframeratelist[discretFrameRateIndex - 1]) {
                    break;
                }
            }
            return discretFrameRateIndex;
        }

        function get_coeff_A(resolution, framerate, quality) {
            var DiscreteQualityIndex, DiscreteResolutionIndex, DiscreteFrameRateIndex;

            DiscreteQualityIndex = ceil_quality(quality);
            DiscreteResolutionIndex = ceil_resolution(resolution);
            DiscreteFrameRateIndex = ceil_framerate(framerate);

            return ConfigCoeffTableA[
                (DiscreteQualityIndex * numdiscreteresolution * numdiscreteframerate)
                + (DiscreteResolutionIndex * numdiscreteframerate)
                + DiscreteFrameRateIndex];
        }

        function get_coeff_B(framerate) {
            return ConfigCoeffTableB[ceil_framerate(framerate)];
        }

        function get_coeff_C_live(framerate) {
            return ConfigCoeffTableClive[ceil_framerate(framerate)];
        }

        function get_coeff_C_record(framerate) {
            return ConfigCoeffTableCrecord[ceil_framerate(framerate)];
        }

        function get_resource_req_record(capabilityparam, isformaxbitrate) {
            var A, B, C, val;

            A = get_coeff_A(capabilityparam.resolution,
                            capabilityparam.frameraterecord,
                            capabilityparam.qualityrecord);

            B = get_coeff_B(capabilityparam.frameraterecord);
            C = get_coeff_C_record(capabilityparam.frameraterecord);

            var preevent = capabilityparam.preeventduration;
            if (preevent < common.constants.DefaultMinimumPreevent) {
                preevent = common.constants.DefaultMinimumPreevent;
            }

            if (isformaxbitrate) {
                val = A * ((B * capabilityparam.frameraterecord) + C) * (1 + 0);
            }
            else {
                val = A * ((B * capabilityparam.frameraterecord) + C) * (preevent + ConfigCoeffD);
            }
            return parseInt(val);
        }

        function get_resource_req_live(capabilityparam) {
            var A, B, C, val;

            A = get_coeff_A(capabilityparam.resolution,
                            capabilityparam.frameratelive,
                            capabilityparam.qualitylive);

            B = get_coeff_B(capabilityparam.frameratelive);
            C = get_coeff_C_live(capabilityparam.frameratelive);

            val = A * ((B * capabilityparam.frameratelive + C) * (1.5));
            return parseInt(val);
        }

        self.getmaxbitrateduration = function (currentcamera) {
            var bitRate = get_resource_req_record(currentcamera, true);
            var maxduration = parseInt(ClipSize * 8 / bitRate);
            return maxduration;
        };

        self.loadparamforallcameras = function (cameraparams) {
            usedcapabilitylist = [];
            $.map(cameraparams, function (param) {
                param.usedlivecapability = get_resource_req_live(param);
                param.usedrecordcapability = get_resource_req_record(param);
                usedcapabilitylist.push(param);
            });
        };

        self.updatedevicecapability = function (currentcamera) {
            var capparam;
            var totalusedlivecapability = 0;
            var totalusedrecordcapability = 0;

            if (currentcamera.isactivechannel) {
                currentcamera.usedlivecapability = get_resource_req_live(currentcamera);
                currentcamera.usedrecordcapability = get_resource_req_record(currentcamera);
            }
            else {
                currentcamera.usedlivecapability = 0;
                currentcamera.usedrecordcapability = 0;
            }
            var curcamoldusedlivecapability = 0;//currentcamera.usedlivecapability;
            var curcamoldusedrecordcapability = 0;//currentcamera.usedrecordcapability;

            for (var i = 0; i < usedcapabilitylist.length; i++) {
                totalusedlivecapability += usedcapabilitylist[i].usedlivecapability;
                totalusedrecordcapability += usedcapabilitylist[i].usedrecordcapability;
                if (usedcapabilitylist[i].channel == currentcamera.channel) {
                    capparam = usedcapabilitylist[i];
                    curcamoldusedlivecapability = capparam.usedlivecapability;
                    curcamoldusedrecordcapability = capparam.usedrecordcapability;
                }
            }            

            var finallivecapability = totalusedlivecapability - curcamoldusedlivecapability + currentcamera.usedlivecapability;
            var finalrecordcapability = totalusedrecordcapability - curcamoldusedrecordcapability + currentcamera.usedrecordcapability;

            if (finallivecapability > finalrecordcapability) {
                var livepercent = finallivecapability * 100 / ConfigResourceUnitsLive;
                window.mpcacamerasetting.datacontext.currentcapabilitymodal.ActualValue(livepercent);
            }
            else {
                var recordpercent = finalrecordcapability * 100 / ConfigResourceUnitsRecord;
                window.mpcacamerasetting.datacontext.currentcapabilitymodal.ActualValue(recordpercent);
            }
        }
        self.updatedevicecapabilitycache = function (currentcamera) {
            var capparam;
            if (currentcamera.isactivechannel) {
                currentcamera.usedlivecapability = get_resource_req_live(currentcamera);
                currentcamera.usedrecordcapability = get_resource_req_record(currentcamera);
            }
            else {
                currentcamera.usedlivecapability = 0;
                currentcamera.usedrecordcapability = 0;
            }
            var curcamoldusedlivecapability = currentcamera.usedlivecapability;
            var curcamoldusedrecordcapability = currentcamera.usedrecordcapability;
            for (var i = 0; i < usedcapabilitylist.length; i++) {
                if (usedcapabilitylist[i].channel == currentcamera.channel) {
                    capparam = usedcapabilitylist[i];
                    capparam.usedlivecapability = curcamoldusedlivecapability;
                    capparam.usedrecordcapability = curcamoldusedrecordcapability;
                    break;
                }
            }
        };
    }

    window.mpcacamerasetting.datacontext.devicecapabilitymanager = devcapabilitymanager;
})(window.mpcacamerasetting.common)