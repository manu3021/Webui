(function () {

    var calendarSearchUrl = $('#calendarSearchUrl').val();
    var playerDefaultImage = $("#calendarPlayerImage").attr('data-playerimage');

    var CalendarSearchView = uibase.BaseView.inherits({
        initializeView: function (options) {
            this.player = null;
            this.isLoaded = false;
            this.subscribe(window.calendarsearch.events.application_page_changed, this.showView, true);
        },
        showView: function (event, data) {
            if (data && data.pageName == window.calendarsearch.constants.Calendar) {
                if (!this.isLoaded) {
                    this.show(new window.calendarsearch.CalendarSearchViewModel({
                        baseUrl: this.baseUrl,
                        viewName: this.viewName,
                        treeview: new window.calendarsearch.TreeViewModel({
                            baseUrl: this.baseUrl,
                            expandableNodeTypes: ['SITE', 'CUSTOMER', 'GENERAL', 'ROOT', 'DEALER', 'GROUP'],
                            depth: 1
                        })
                    }));
                    this.showPlayer();
                    this.isLoaded = true;
                }
            }
        },
        subscribeEvents: function () {
            this.subscribe(window.calendarsearch.events.play_clip_requested, this.onPlayClipRequestRecieved);
            this.subscribe(window.calendarsearch.events.close_clip_requested, this.onCloseClipRequestRecieved);
            this.subscribe(window.calendarsearch.events.event_action_performed, this.onEventActionPerformed);
        },
        showPlayer: function (url) {
            if (url) {              
                //var vm = this.viewModel;
                //vm.startDateTimeObj(new Date(vm.clipModel.StartDate()).addSeconds(-1 * vm.clipModel.Prevent()));
                //vm.playingDateTime(ToJavaScriptDate(new Date(vm.clipModel.StartDate()).addSeconds(-1 * vm.clipModel.Prevent())));

                window.mpcplayer.getplayeroptions(false, url, 300, 500, playerDefaultImage, function (playeroptions) {
                    this.player = jwplayer(calendarVideoPlayerWrapper).setup(playeroptions);
                    this.player.onPlay(function () {
                        if (this.player.getCaptionsList() && this.player.getCaptionsList().length > 0) {
                            this.player.setCurrentCaptions(1);
                        }
                    });
                    //this.player.onTime(function (event) {
                        //var secs = (Math.floor(event.position)), playingDateTime;
                        //if (secs != vm.playingSec) {                            
                        //    vm.playingSec = secs;
                        //    playingDateTime = new Date(vm.startDateTimeObj().getTime() + (vm.playingSec * 1000));
                        //    vm.playingDateTime(ToJavaScriptDate(playingDateTime));                            
                        //}
                    //});                    
                });
            }
        },
        onPlayClipRequestRecieved: function (event, data) {            
            if (this.viewModel && data && data.url) {
                this.showPlayer(data.url);
            }
        },
        onCloseClipRequestRecieved: function () {
            if (this.player) {
                this.player.remove();
                this.player = null;
            }
        },
        onEventActionPerformed: function (event, data) {
            if (data.Success) {
                alertify.success(window.calendarsearch.messages.event_action_success);
            }
            else {
                alertify.error(window.calendarsearch.messages.event_action_failed);
            }
        }
    });

    var ClipExportView = uibase.BaseView.inherits({
        initializeView: function (options) {
            this.subscribe(window.calendarsearch.events.clip_export_show, this.clipExportShow, true); 
        },
        subscribeEvents: function () {
            this.subscribe(window.calendarsearch.events.clip_export_close, this.closeClipExport, true);
        },
        clipExportShow: function (event, data) {
            if (data && data.clipModel) {
                this.show(new window.calendarsearch.ClipExportViewModel({
                    baseUrl: this.baseUrl,
                    viewName: this.viewName,
                    antiForgeryToken: this.antiForgeryToken,
                    validationContext: new uibase.BaseValidationContext(this.viewName, window.calendarsearch.ClipExportValidations),
                    clipModel: data.clipModel
                }));
            }
        },
        closeClipExport: function (event, data) {
            this.close();
        }
    });

    window.calendarsearch.views = {
        calendarSearchView: new CalendarSearchView({
            baseUrl: calendarSearchUrl,
            viewName: 'calendar-search-view'
        }),
        clipExportView: new ClipExportView({
            baseUrl: calendarSearchUrl,
            viewName: 'calendar_export_clip_form',
            modalId: 'calExportClipModal'
        })
    };

})();

function ToJavaScriptDate(value) {    
    var formattedDate = new Date(value);
    var final = moment(formattedDate).format(window.calendarsearch.dateTimeFormat.LongDateTime);
    return final;
}