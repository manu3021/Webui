/// <reference path="uicontext.js" />
/// <reference path="datacontext.js" />
/// <reference path="common.js" />

(function (ko, datacontext, uicontext, common) {
    window.configuration.configviewmodel = window.configuration.configviewmodel || {};
    uicontext = uicontext || window.configuration.uicontext;
    var packagesummarymodel = function () {
        var self = this;
        self.PackageDetails = ko.observableArray([]);
        self.Initialize = function (currentaccountId, data) {
            self.PackageDetails($.map(data, function (item) {
                var packagedetail = new datacontext.packagedetailmodel();
                packagedetail.Initialize(currentaccountId, item);
                return packagedetail;
            }));
        }
        self.toJson = function () {
            return ko.toJSON(self);
        }
    }
    var packagedetailmodel = function () {
        var self = this;
        self.Packages = ko.observableArray([]);
        self.SelectedpackageId = ko.observable();
        self.CurrentpackageName = ko.observable();
        self.CurrentpackageId = 0;
        self.RetentionDays = ko.observable();
        self.AccountId = 0;
        self.oldRetentionDays = 15;
        self.AccountName = ko.observable();
        self.AccountHierarchy = ko.observable();
        self.SiteCount = ko.observable();
        self.DoorCount = ko.observable();
        self.CameraCount = ko.observable();
        self.UpgradeRequestDeleted = ko.observable(false);
        self.UpgradeRequestData = {
            UpgradeRequestPackageName: ko.observable(),
            UpgradeRequestPackageId: ko.observable(),
            UpgradeRequestRequestDate: ko.observable(),
            UpgradeRequestPackageCost: ko.observable()
        };
        self.Initialize = function (currentaccountId, data) {
            self.Packages($.map(data.Packages, function (item) { return new datacontext.packagemodel(item) }));
            self.SelectedpackageId(data.SelectedpackageId);
            self.RetentionDays(data.RetentionDays);
            self.oldRetentionDays = self.RetentionDays();
            self.AccountId = currentaccountId;
            self.AccountName(data.AccountName);
            self.AccountHierarchy(data.AccountHierarchy);
            self.SiteCount(data.SiteCount);
            self.DoorCount(data.DoorCount);
            self.CameraCount(data.CameraCount);
            self.UpgradeRequestDeleted(data.UpgradeRequestDeleted);
        }
        self.UpgradeRequestInitialize = function (upgradereqdata) {
            self.UpgradeRequestData.UpgradeRequestPackageName(upgradereqdata.Name);
            self.UpgradeRequestData.UpgradeRequestPackageId(upgradereqdata.PackageId);
            self.UpgradeRequestData.UpgradeRequestRequestDate(upgradereqdata.StartDate);
            self.UpgradeRequestData.UpgradeRequestPackageCost(upgradereqdata.Cost);
        }
        self.selectbasic = function (data, event) {
            var IsDowngrade = (self.Packages()[2].IsSelected() == true || self.Packages()[1].IsSelected() == true);
            self.CurrentpackageName("Basic");
            self.CurrentpackageId = data.PackageId;
            window.configuration.uicontext.showPackageUpgradeDialog(IsDowngrade);
            //self.postpackageselection(data, event, IsDowngrade);
        }
        self.selectpremium = function (data, event) {
            console.log("Premium");
            var IsDowngrade = (self.Packages()[2].IsSelected() == true);
            self.CurrentpackageName("Premium");
            self.CurrentpackageId = data.PackageId;
            window.configuration.uicontext.showPackageUpgradeDialog(IsDowngrade);
            //self.postpackageselection(data, event,false);
        }
        self.selectpro = function (data, event) {
            console.log("Pro");
            self.CurrentpackageName("Pro");
            self.CurrentpackageId = data.PackageId;
            window.configuration.uicontext.showPackageUpgradeDialog(false);
            //self.postpackageselection(data, event, IsDowngrade);
        }
        self.cancelPackage = function (data, event) {
            alertify.confirm("Do you want to cancel the pending request ?", function (e) {
                if (e) {
                    blockUI();
                    datacontext.deletePackage(function (jsonResult) {
                        self.UpgradeRequestDeleted(jsonResult.Deleted);
                        var ActPendingPackage = ko.utils.arrayFirst(self.Packages(), function (pkg) {
                            return pkg.UpgradePending() == true;
                        })
                        if (ActPendingPackage != null || ActPendingPackage != undefined)
                            ActPendingPackage.UpgradePending(false);
                        alertify.success(jsonResult.successMessage);
                        unblockUI();
                    }, function (errorResult) {
                        unblockUI();
                        alertify.error(errorResult);
                    })
                }
            });
        }
        self.postpackageselection = function (data, event, IsDowngrade) {
            self.SelectedpackageId = data.PackageId;
            datacontext.activatePackage(self, IsDowngrade, function (successResult) {
                //self.IsSelected(true);
                $.publish(common.events.packageaddedsuccess, successResult);
            }, function (errorResult) {
                //self.IsError(true);
                //self.ErrorMessage(errorResult);
                alertify.error(errorResult);
            })
        }
        self.upgradeRetentionDays = function (data, event) {
            if (self.oldRetentionDays > self.RetentionDays()) {
                alertify.confirm(Resources.Config_ChangeRetention + " " + self.oldRetentionDays + " " + Resources.Config_ToText + " " + self.RetentionDays() + " " + Resources.Config_WillRetain + " " + self.RetentionDays() + " " + Resources.Config_DaysClips, function (e) {
                    if (e) {
                        blockUI();
                        datacontext.changeRetentionDays(self.SelectedpackageId(), self.AccountId, self.RetentionDays(), function (successResult) {
                            var msg = common.messages.RetentionDays_Updated;
                            $.publish(common.events.retentionaddedsuccess, msg);
                            self.oldRetentionDays = self.RetentionDays();
                        }, function (errorResult) {
                            unblockUI();
                            alertify.error(errorResult);
                        })
                    }
                    else {
                        self.RetentionDays(self.oldRetentionDays);
                    }
                });
            }
            else {
                alertify.confirm(Resources.Config_WillChangeRetention + " " + self.oldRetentionDays + " " + Resources.Config_ToText + " " + self.RetentionDays(), function (e) {
                    if (e) {
                        blockUI();
                        datacontext.changeRetentionDays(self.SelectedpackageId(), self.AccountId, self.RetentionDays(), function (successResult) {
                            var msg = common.messages.RetentionDays_Updated;
                            $.publish(common.events.retentionaddedsuccess, msg);
                            self.oldRetentionDays = self.RetentionDays();
                        }, function (errorResult) {
                            unblockUI();
                            alertify.error(errorResult);
                        })
                    }
                    else {
                        self.RetentionDays(self.oldRetentionDays);
                    }
                });
            }

        }
        self.onImmediate = function (data, event) {
            var activePkg = ko.utils.arrayFilter(self.Packages(), function (pkg) {
                return pkg.IsActive();
            });
            datacontext.changePackage(self.CurrentpackageId(), self.AccountId, self.RetentionDays(), function (successResult) {
                var msg;
                if (activePkg.length > 0)
                    msg = common.messages.Successfully_Activated;
                else
                    msg = common.messages.Successfully_Associated;
                $.publish(common.events.packageaddedsuccess, msg);
                window.configuration.uicontext.closecurrentdialog();
            }, function (errorResult) {
                alertify.error(errorResult);
            })
        }
        self.onNextBillingCycle = function (data, event) {
            datacontext.upgradePackage(self.CurrentpackageId(), self.AccountId, self.RetentionDays(), false, function (successResult) {
                //self.IsSelected(true);
                $.publish(common.events.packageaddedsuccess, successResult);
                window.configuration.uicontext.closecurrentdialog();
            }, function (jsResult) {
                //self.IsError(true);
                //self.ErrorMessage(errorResult);
                alertify.error(jsResult.errorMessage);
            })
        }
        self.onDowngradePackageDialog = function (data, event) {
            datacontext.upgradePackage(self.CurrentpackageId(), self.AccountId, self.RetentionDays(), true, function (successResult) {
                //self.IsSelected(true);
                $.publish(common.events.packageaddedsuccess, successResult);
                window.configuration.uicontext.closecurrentdialog();
            }, function (jsResult) {
                //self.IsError(true);
                //self.ErrorMessage(errorResult);
                alertify.error(jsResult.errorMessage);

                window.configuration.uicontext.closecurrentdialog();
            })
        }
        self.onCancelUpgradePackage = function (data, event) {
            window.configuration.uicontext.closecurrentdialog();
        }

        self.toJson = function () {
            return ko.toJSON(self);
        }
    }
    var packagemodel = function (data) {
        var self = this;
        //self.currentplan = data;
        //self.currentplanId = ko.observable(data.Id);
        var selectedclipretention = ko.utils.arrayFirst(data.Features, function (item) {
            return item.Name == "ClipRetention";
        })
        var stdfeatures = ko.utils.arrayFilter(data.Features, function (item) {
            return item.IsStandard == true;
        })
        var packfeatures = ko.utils.arrayFilter(data.Features, function (item) {
            return (item.IsStandard == false && item.Name != "Retention Days" && item.Name != "Doors" && item.Name != "Cameras");
        })
        var doorFeature = ko.utils.arrayFirst(data.Features, function (item) {
            return item.Name == "Doors";
        })
        var cameraFeature = ko.utils.arrayFirst(data.Features, function (item) {
            return item.Name == "Cameras";
        })      
        self.PackageId = ko.observable(data.Id);
        self.Name = ko.observable(data.Name);        
        self.IsSelected = ko.observable(data.IsSelected);
        self.IsActive = ko.observable(data.IsActive);
        self.StartDate = ko.observable(data.StartDate);
        self.ExpiryDate = ko.observable(data.ExpiryDate);
        self.Cost = ko.observable(data.Cost);
        self.Features = ko.observable(data.Features);
        self.IsVIP = ko.observable(data.IsVIP);
        self.DoorCost = ko.observable(doorFeature != null ? doorFeature.FeatureCost : 0);
        self.CameraCost = ko.observable(cameraFeature != null ? cameraFeature.FeatureCost : 0);
        self.IsDowngrade = ko.observable(data.IsDowngrade);
        self.UpgradePending = ko.observable(data.UpgradePending);
        //self.selectedclipretentionval = ko.observable(selectedclipretention.FeatureValue);
        self.standardfeatures = ko.observableArray(stdfeatures);
        self.perpackagefeatures = ko.observableArray(packfeatures);
        self.DoorCameraCost = ko.computed(function () {
            return "$" + self.DoorCost() + " " + Resources.per_Door + "," + "$" + self.CameraCost() + " " + Resources.per_Camera;
        });
        self.ActivateBtntextCustomer = ko.computed(function () {
            var btnText = "";
            if (self.IsActive())
                btnText = common.messages.Activated;
            else if (self.UpgradePending())
                btnText = common.messages.Upgrade_Pending;
            else if (self.IsSelected())
                btnText = common.messages.Approved;
            else {
                if (self.Name() == 'Basic' && (self.IsSelected() == true && self.IsActive() == false))
                    btnText = common.messages.Activate_Pending;
                else
                    btnText = common.messages.Upgrade;
            }
            return btnText;
        });
        self.ActivateBtntextDealer = ko.computed(function () {
            var btnText = "";
            if (self.IsActive() || self.IsSelected())
                btnText = common.messages.Activated;
            else if (self.UpgradePending() && self.IsDowngrade() == false)
                btnText = common.messages.Upgrade_Pending;
            else if (self.UpgradePending() && self.IsDowngrade())
                btnText = Resources.Downgrade_Pending;
            else if (self.IsDowngrade())
                btnText = Resources.Downgrade;
            else {
                /*if (self.Name() == 'Basic' && (self.IsSelected() == true && self.IsActive() == false))
                    btnText = common.messages.Selected;
                else*/
                btnText = common.messages.Upgrade;
            }

            return btnText;
        });

        self.ApplyUI = function () {
            $('#packageSelection button').removeClass('disabledStyle').removeAttr('disabled');
            $("#packageSelection button[data-packageid='" + self.currentplanId().toUpperCase() + "']").addClass('disabledStyle').attr('disabled', 'disabled');;
        }
        self.onStdFeaturesclick = function (data, event) {
            window.configuration.uicontext.showStdFeaturesDialog(data);
        }
        self.onCancelStdFeatures = function (data, event) {
            window.configuration.uicontext.closecurrentdialog();
        }
        self.toJson = function () {
            return ko.toJSON(self);
        }
    }
    datacontext.packagesummarymodel = packagesummarymodel;
    datacontext.packagedetailmodel = packagedetailmodel;
    datacontext.packagemodel = packagemodel;
    var newdevicemodel = function (data) {
        var self = this;
        data = data || {};
        self.devicetypes = ko.observableArray([]);
        self.Id = data.Id;
        self.Isnew = ko.observable(true);
        self.ParentId = data.ParentId;
        self.UniqueId = ko.observable();
        self.DeviceType = ko.observable();
        self.EntityType = data.EntityType;
        self.IsError = ko.observable(false);
        self.ErrorMessage = ko.observable("");
        self.Name = ko.computed(function () {
            return self.UniqueId();
        });
        self.adddevice = function (event, data) {
            if (self.Isnew()) {
                if (window.configuration.uicontext.validatedeviceform(self.EntityType, true)) {
                    blockUI();
                    datacontext.adddevice(self, function (result) {
                        self.Isnew(false);
                        $.publish(common.events.confignewaccountadded, result);
                        window.configuration.uicontext.closecurrentdialog();
                        alertify.success(common.messages.CreateSuccessfull);
                        unblockUI();
                    },
                        function (errorResult) {
                            self.IsError(true);
                            self.ErrorMessage(errorResult);
                            unblockUI();
                        });
                }
                else {
                }
            }
        }
        self.toJson = function () {
            return ko.toJSON(self);
        }
    }
    var optionmenuitem = function (data) {
        var self = this;
        data = data || {};
        self.Id = data.Id;
        self.title = data.Name;
        self.icon = ko.computed(function () {
            return "icon_" + self.Id;
        });
        self.menuclicked = function (event, data) {
            $.publish(common.events.configMenuclicked, self);
        }
    }
    var addressresult = function (data) {
        var self = this;
        data = data || {};
        self.Address = ko.observable(data.formatted_address);
        self.objdata = data;
    }
    var accountdetailentity = function (data) {
        var self = this;
        data = data || {};
        self.Name = ko.observable(data.Name).extend({ watch: self });

        self.Id = data.Id;
        self.image = ko.observable(data.FloorPlanInfo.FloorImageRef);
        self.imageType = ko.observable();
        self.imageFile = ko.observable();
        self.imagePath = ko.observable();
        self.IsImageDirty = false;
        self.IsDefault = false;
        self.imageObjectURL = ko.observable();
        self.floorPhoto = ko.observable("").extend({ watch: self });

        self.IsImageloaded = ko.observable(true);
        self.floorPhoto.subscribe(function (newval) {
            if (newval) {
                self.IsImageloaded(false);

            }
        });
        self.imageSrc = ko.computed(function () {

            if (self.imageType() && self.image()) {
                {
                    self.PhotoType = self.imageFile().type;
                    self.FloorPlanInfo.FloorImageRef(self.image());
                    self.floorPhoto(self.imageType() + "," + self.image());
                    self.FloorPlanInfo.IsImageDirty = true;
                    self.FloorPlanInfo.FloorImageType = self.imageFile().type;
                    self.IsImageDirty = true;
                    // datacontext.getfloorPlanImage(data.Id, null, null);
                    self.IsDefault = true; // Hardcoded the value need to alter the value
                    // $('#floormap_canvas img').attr('src', self.floorPhoto());// $('#editSite img').attr('src'));
                    $('#floorcontainercanvas').css("background-image", "url(" + self.floorPhoto() + ")").css("background-repeat", "no-repeat");
                    $('#editfloormapmsg').hide();

                }
            }
        });
        self.FloorPlanInfo = {
            Id: ko.observable(data.FloorPlanInfo.Id).extend({ watch: self }),
            AccountId: ko.observable(data.Id),
            FloorImageId: ko.observable(data.FloorPlanInfo.FloorImageId),
            FloorImageName: ko.observable(data.Name),
            FloorImageType: ko.observable(self.PhotoType),
            FloorImageDescription: ko.observable(""),
            FloorImageRef: ko.observable(self.image()),
            IsImageDirty: ko.observable(self.IsImageDirty),
            IsDefault: ko.observable(self.IsDefault),
            Items: ko.observableArray([])
        };

        if (data.FloorPlanInfo.Id && data.EntityType.toLowerCase() == "site") {
            self.IsImageloaded(true);
            datacontext.getfloorPlanImage(data.Id, self.floorPhoto, self.ErrorMessage);
            //  $('#floormap_canvas img').attr('src', self.imageSrc());

        }
        else {
            self.IsImageloaded(false);
            //   $('#floormap_canvas img').attr('src', "");
            $('#floorcontainercanvas').css("background-image", "");
            $('#editfloormapmsg').show();

        }
        self.Isnew = ko.observable(false);
        self.ParentId = data.ParentId;
        self.EntityType = data.EntityType;
        self.Devices = data.Devices;
        self.LocationInfo = {
            Lattitude: ko.observable(data.LocationInfo.Lattitude),
            Longitude: ko.observable(data.LocationInfo.Longitude)
        };
        self.ContactInfo = {
            AddressLine1: ko.observable(data.ContactInfo.AddressLine1).extend({ watch: self }),
            City: ko.observable(data.ContactInfo.City).extend({ watch: self }),
            Region: ko.observable(data.ContactInfo.Region).extend({ watch: self }),
            Country: ko.observable(data.ContactInfo.Country).extend({ watch: self }),
            ZipCode: ko.observable(data.ContactInfo.ZipCode).extend({ watch: self }),
            Phone: ko.observable(data.ContactInfo.Phone).extend({ watch: self }),
            EmailAddress: ko.observable(data.ContactInfo.EmailAddress).extend({ watch: self })

        };

        self.NewAddress = ko.computed(function () {
            return self.ContactInfo.AddressLine1() + "+" + self.ContactInfo.City() + "+" + self.ContactInfo.Region() + "+" + self.ContactInfo.Country() + "+" + self.ContactInfo.ZipCode();
        })
        self.OldAddress = self.NewAddress();
        self.AddressForGeolocation = ko.computed(function () {
            return self.Name() + "+" + self.ContactInfo.AddressLine1() + "+" + self.ContactInfo.City() + "+" + self.ContactInfo.Region() + "+" + self.ContactInfo.Country();
        })

        self.Logo = data.Logo;
        self.Branding = data.Branding;
        self.ErrorMessage = ko.observable("");
        self.IsError = ko.observable(false);
        self.RegionalTimeZone = ko.observable(data.RegionalTimeZone).extend({ watch: self });
        self.resolvegeolocation = function (bAddressMode, OnSuccess, onFail) {
            var type = bAddressMode ? 'address' : 'zipcode';
            var param = bAddressMode ? self.AddressForGeolocation() : self.ContactInfo.ZipCode();
            getGoogleurl(type, param).done(function (result) {
                var data = result.Url ? JSON.parse(result.Url) : "";
                if (data && data.results != undefined && data.results[0] != undefined) {
                    if (typeof (data.results[0].geometry.location.lat) === 'function') {
                        self.LocationInfo.Lattitude(data.results[0].geometry.location.lat());
                        self.LocationInfo.Longitude(data.results[0].geometry.location.lng());
                    }
                    else {
                        self.LocationInfo.Lattitude(data.results[0].geometry.location.lat);
                        self.LocationInfo.Longitude(data.results[0].geometry.location.lng);
                    }
                    if (OnSuccess)
                        OnSuccess(data)
                }
                else {
                    if (onFail)
                        onFail();
                }
            }).fail(function () {
                if (onFail)
                    onFail();
            });


        }
        self.uploadImage = function (cb) {
            var needtouploadphoto = self.IsImageDirty;
            if (needtouploadphoto) {
                var fd = new FormData();
                fd.append('photofile', document.getElementById("floorplanimgfile").files[0]);
                fd.append("BlobId", self.FloorPlanInfo.FloorImageId());
                fd.append("TypeName", "FloorMap");
                ajaxfilePost($('#floorplanimgfile').data("uploadurl"), fd).done(function (result) {
                    var newId = "";
                    if (result.Success) {
                        newId = result.data.Result[1].Value;
                        self.IsImageDirty = false;
                    }
                    self.FloorPlanInfo.FloorImageId(newId);
                    if (cb)
                        cb(self.FloorPlanInfo.FloorImageId());
                });
            }
            else {
                if (cb)
                    cb(self.FloorPlanInfo.FloorImageId());
            }

        }
        self.finalSave = function () {
            blockUI();
            self.uploadImage(function (newid) {
                if (newid === "")
                    console.log("error in image upload");
                if (self.Isnew()) {
                    datacontext.addaccount(self, function (result) {
                        self.Isnew(false);
                        $.publish(common.events.confignewaccountadded, result.data);
                        window.configuration.uicontext.closecurrentdialog();
                        alertify.success(common.messages.CreateSuccessfull);
                        unblockUI();
                    }, function (errorResult) {
                        self.IsError(true);
                        self.ErrorMessage(errorResult);
                        unblockUI();
                    });
                }
                else {
                    datacontext.saveaccountsettings(self, function (successResult) {
                        self.IsError(false);
                        alertify.success(common.messages.UpdateSuccess);
                        self.resetwatch();
                        unblockUI();
                        self.OldAddress = self.NewAddress();
                    }, function (errorResult) {
                        self.IsError(true);
                        self.ErrorMessage(errorResult);
                        unblockUI();
                    });
                }
            });

        }
        self.dosavesettings = function (event, data) {
            if (window.configuration.uicontext.validateform(self.EntityType, self.Id.length == 0)) {
                try {
                    if ((self.OldAddress.localeCompare(self.NewAddress()) != 0) ||
                        (self.LocationInfo.Lattitude() == 0 && self.LocationInfo.Longitude() == 0)) {
                        if ((self.bNeedToResolve == undefined || self.bNeedToResolve) && self.EntityType.toLowerCase() != "group") {
                            self.resolvegeolocation(true, function () {
                                self.getTimeZoneWithLatLng(function () { self.finalSave(); });

                            }, function () {
                                //try with zipcode
                                self.resolvegeolocation(false, function () {
                                    self.getTimeZoneWithLatLng(function () { self.finalSave(); });
                                }, function () {
                                    //failed with both mode, let us warn and proceed if needed
                                    alertify.confirm(Resources.Login_FacingDifficultyinSaving, function (e) {
                                        if (e) {
                                            self.finalSave()
                                        }
                                    });
                                })
                            });
                        }
                        else {
                            self.finalSave();
                        }
                    }
                    else {
                        self.finalSave();
                    }
                } catch (e) {
                    alertify.confirm(Resources.Login_FacingDifficultyinSaving, function (e) {
                        if (e) {
                            self.finalSave()
                        }
                    });
                }

            }
        }
        self.toJson = function () {

            var copy = ko.toJS(this);
            delete copy.FloorPlanInfo.FloorImageRef;
            delete copy.floorPhoto;
            delete copy.image;
            delete copy.watchItems;
            return ko.toJSON(copy);
        }
        self.resizemodel = function () {
            if (self.EntityType.toLowerCase() == common.constants.accounttypes.SITE)
                $('#siteModal').width(960);
            else
                $('#customerModal').width(960);
        }
        self.getMapId = function () {
            if (self.EntityType.toLowerCase() == common.constants.accounttypes.SITE)
                return document.getElementById('newsitemap');
            else if (self.EntityType.toLowerCase() == common.constants.accounttypes.CUSTOMER || self.EntityType.toLowerCase() == common.constants.accounttypes.DEALER)
                return document.getElementById('newcustmap');
        }
        self.showmap = function () {
            $(self.getMapId()).show();
            $('.mapCloseIcon').show();
            $('.mapDoneIcon').show();
            $('.mapShowIcon').hide();
            $('.addresscontainer').height(260);
            $('.primary-button').hide();
            $('.secondary-button').hide();
            $('.account-done').show();

        }
        self.hidemap = function (data, even) {
            $(self.getMapId()).hide();
            $('.mapCloseIcon').hide();
            $('.mapDoneIcon').hide();
            $('.mapShowIcon').show();
            $('.addresscontainer').height(205);
            $('.primary-button').show();
            $('.secondary-button').show();
            $('.account-done').hide();
            if (data != null)
                self.done();
        }
        self.getmapobj = function () {
            return window.mpcregcontext.map;
        }
        self.setmap = function (mapobj) {
            window.mpcregcontext = window.mpcregcontext || {};
            window.mpcregcontext.map = mapobj;
            google.maps.event.addListener(self.getmapobj(), 'click', function (event) {
                self.removeallmarkers();
                self.resolvedResults.removeAll();
                self.placemarkerdragabale(event.latLng);
            });

        }
        self.done = function () {
            self.extractaddress();
            self.hidemap();
        }
        self.onAutoComplete = function (data, el) {
            el.val(data.City);
            self.ContactInfo.City(data.City);
            self.ContactInfo.Region(data.Region);
            self.ContactInfo.Country(data.Country);
        }
        self.initMap = function () {
            try {
                self.bNeedToResolve = true;
                if (self.EntityType && self.EntityType.toLowerCase() == "site" && !self.Isnew()) {
                    self.ContactInfo.City.subscribe(function () {
                        self.resolveaddressbymap();
                    })
                    self.ContactInfo.Region.subscribe(function () {
                        self.resolveaddressbymap();
                    })
                    self.ContactInfo.Country.subscribe(function () {
                        self.resolveaddressbymap();
                    })
                    self.ContactInfo.ZipCode.subscribe(function () {
                        self.resolveaddressbymap();
                    })
                }
                self.geocoder = new google.maps.Geocoder();
                $(self.getMapId()).hide();
                $('.mapCloseIcon').hide();
                $('.mapShowIcon').hide();
                $('.addresscontainer').hide();
                $('.account-done').hide();
            }
            catch (e) {
            }
        }
        self.removeallmarkers = function () {
            window.mpcregcontext = window.mpcregcontext || {};
            if (window.mpcregcontext.markers == undefined)
                window.mpcregcontext.markers = [];
            for (var i = 0; i < window.mpcregcontext.markers.length; i++) {
                window.mpcregcontext.markers[i].setMap(null);
            }
        }
        self.geocodePosition = function (pos, callback) {
            self.geocoder.geocode({
                latLng: pos
            }, function (responses) {
                if (responses && responses.length > 0) {
                    if (callback) callback(responses)
                }
            });
        }
        self.placemarkerdragabale = function (location) {
            var marker = new google.maps.Marker({
                position: location,
                draggable: true,
                map: self.getmapobj()
            });
            window.mpcregcontext = window.mpcregcontext || {};
            if (window.mpcregcontext.markers == undefined)
                window.mpcregcontext.markers = [];
            window.mpcregcontext.markers.push(marker);
            google.maps.event.addListener(marker, 'dragend', function () {
                self.geocodePosition(marker.getPosition(), function (result) {
                    var data = {};
                    data.results = result;
                    self.addToResolvedList(data, false);
                    //self.resolvedaddressclick(result);
                });
            });
            var current_bounds = self.getmapobj().getBounds();
            var marker_pos = marker.getPosition();

            if (current_bounds != undefined) {
                if (!current_bounds.contains(marker_pos)) {

                    var new_bounds = current_bounds.extend(marker_pos);
                    self.getmapobj().fitBounds(new_bounds);
                }
            }
        }
        self.isMapInitialised = false;
        self.placeMarker = function (location) {
            var marker = new google.maps.Marker({
                position: location,
                map: self.getmapobj()
            });
            window.mpcregcontext = window.mpcregcontext || {};
            if (window.mpcregcontext.markers == undefined)
                window.mpcregcontext.markers = [];
            window.mpcregcontext.markers.push(marker);
            var current_bounds = self.getmapobj().getBounds();
            var marker_pos = marker.getPosition();

            if (current_bounds != undefined) {
                if (!current_bounds.contains(marker_pos)) {

                    var new_bounds = current_bounds.extend(marker_pos);
                    self.getmapobj().fitBounds(new_bounds);
                }
            }
        }
        self.cancelmapassist = function () {
            self.bNeedToResolve = true;
            self.hidemap();
        }
        self.selectedAddressObj = ko.observable();
        self.isParsing = false;
        self.extractaddress = function () {
            if (self.selectedAddressObj() != null) {
                var data = self.selectedAddressObj();
                var addressline1 = '';
                var state = '';
                var city = '';
                var Country = '';
                var zipcode = '';


                // iterate through address_component array
                $.each(data.objdata.address_components, function (i, address_component) {


                    if (address_component.types[0] == "locality" || address_component.types[0] == 'sublocality') {
                        city = city + ' ' + address_component.long_name;
                    }
                    if (address_component.types[0] == "administrative_area_level_1" || address_component.types[0] == 'administrative_area_level_2') {
                        state = state + ' ' + address_component.long_name;
                    }

                    if (address_component.types[0] == "country") {
                        Country = address_component.long_name;
                    }

                    if (address_component.types[0] == "postal_code") {
                        zipcode = address_component.long_name;
                    }

                    if (address_component.types[0] == "street_number" || address_component.types[0] == "street_address" || address_component.types[0] == "route" || address_component.types[0] == 'intersection' || address_component.types[0] == 'political') {
                        addressline1 = addressline1 + ' ' + address_component.long_name;
                    }
                });
                var fullladdress = data.objdata.formatted_address;
                fullladdress = fullladdress.substr(0, fullladdress.indexOf(city) - 1);
                addressline1 = addressline1.length > 0 ? addressline1 : fullladdress;
                self.isParsing = true;
                self.ContactInfo.AddressLine1(addressline1);
                self.ContactInfo.City(city);
                self.ContactInfo.Region(state);
                self.ContactInfo.Country(Country);
                self.ContactInfo.ZipCode(zipcode);

                if (typeof (data.objdata.geometry.location.lat) === 'function') {
                    self.LocationInfo.Lattitude(data.objdata.geometry.location.lat());
                    self.LocationInfo.Longitude(data.objdata.geometry.location.lng());
                }
                else {
                    self.LocationInfo.Lattitude(data.objdata.geometry.location.lat);
                    self.LocationInfo.Longitude(data.objdata.geometry.location.lng);
                }

                self.isParsing = false;
                self.bNeedToResolve = false;

            }
        }

        self.addToResolvedList = function (data, bAddmarker) {
            $.each(data.results, function (key, result) {
                self.resolvedResults.push(new addressresult(result));
                //if (bAddmarker)
                //    self.placeMarker(result.geometry.location);
            })
        }
        self.resolvedResults = ko.observableArray([]);
        self.getTimeZoneWithLatLng = function (cb) {
            getGoogleurl("location", self.LocationInfo.Lattitude() + ',' + self.LocationInfo.Longitude() + '&timestamp=0').done(function (res) {
                var data = res.Url ? JSON.parse(res.Url) : "";
                self.RegionalTimeZone($('#site_RegionalTimeZone option[value="' + data.timeZoneId + '"]').val());//attr("selected", true);
                if (cb)
                    cb(data)
            }).error(function () {
                if (cb)
                    cb(data)
            });;

        }
        self.resolveaddressbymap = function () {
            if (self.isParsing) return;
            self.bNeedToResolve = true;
            self.resolvegeolocation(true, function (data) {
                self.getTimeZoneWithLatLng();
            },
            function () {
                self.resolvegeolocation(false, function (data) {
                    self.getTimeZoneWithLatLng();
                })
            });
        }
    }
    datacontext.newdevicemodel = newdevicemodel;
    datacontext.optionmenuitem = optionmenuitem;
    datacontext.accountdetailentity = accountdetailentity;
    datacontext.getemptyaccount = function (type, parent) {
        var emptyEntity = new accountdetailentity({
            Name: "", Id: "", ParentId: parent.nodedata.Id, GeolocationEntity: {},
            ContactInfo: { AddressLine1: "", City: "", Region: "", Country: "", ZipCode: "", Phone: "", EmailAddress: "" },
            LocationInfo: { Lattitude: "0", Longitude: "0" },
            Logo: null, Branding: "",
            EntityType: type,
            FloorPlanInfo: { AccountId: "", FloorImageId: "", FloorImageName: "", FloorImageType: "", FloorImageDescription: "", FloorImageRef: "" },
            RegionalTimeZone: $("#site_RegionalTimeZone option:first-child").val()
        });

        emptyEntity.Isnew(true);
        return emptyEntity;
    };
    datacontext.getemptydevice = function (type, parenId) {
        var emptyEntity = new newdevicemodel({
            Id: "", Name: "", ParentId: parenId, EntityType: type
        });

        return emptyEntity;
    }
})(ko, window.configuration.datacontext, window.configuration.uicontext, window.configuration.common);

window.configuration.configviewmodel = (function (ko, datacontext) {
    var configOptions = ko.observableArray(),
      erorr = ko.observable(),
      deleteoptions = ko.observableArray(),
      currentSelectedAccount = ko.observable(),
      packagedetailmodel = ko.observable(),
      accountdetailentity = ko.observable(),
     refreshmenu = function () {
         ko.cleanNode(document.getElementById("createbar"));
         // document.getElementById("createbar").innerHTML = '';
         ko.cleanNode(document.getElementById("deletebar"));
         ko.applyBindings(window.configuration.configviewmodel, document.getElementById("createbar"));
         ko.applyBindings(window.configuration.configviewmodel, document.getElementById("deletebar"));
     }
    deleteAccount = function (data, event) {
        window.configuration.uicontext.configoptionsselected({ Id: "1001" });
    };

    // datacontext.getconfioptions("GENERAL", window.configuration.configviewmodel.configOptions, erorr);
    datacontext.getdeleteoptions(deleteoptions);

    return {
        configOptions: configOptions,
        deleteoptions: deleteoptions,
        error: erorr,
        refreshmenu: refreshmenu
    };
})(ko, window.configuration.datacontext);
window.configuration.configviewmodel.refreshmenu();