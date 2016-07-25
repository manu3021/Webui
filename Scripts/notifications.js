
ko.applyBindings({    
    messages: [
        { time: '10:20', msg: 'Lorem ipsum dolorLorem ipsum dolor dolorLorem ipsum dolor ', icon:'icon' },
        { time: '10:21', msg: 'Lorem ipsum dolorLorem ipsum dolor dolorLorem ipsum dolor ', icon:'icon' },
        { time: '10:22', msg: 'Lorem ipsum dolorLorem ipsum dolor dolorLorem ipsum dolor ', icon:'icon' }     
    ],
    userProfileMenu: [
        { title:'Save Workspace',url:'#',icon:'images/icons/popup_profile/icon_saveNormal.png'},
        { title:'Load Workspace',url:'#',icon:'images/icons/popup_profile/icon_loadNormal.png'},
        { title:'Profile Details',url:'myprofile.html',icon:'images/icons/popup_profile/icon_userNormal.png'},
        { title:'Full Screen',url:'#',icon:'images/icons/popup_profile/icon_saveNormal.png'},
        { title:'Help',url:'#',icon:'images/icons/popup_profile/icon_helpNormal.png'},
        { title:'Settings',url:'#',icon:'images/icons/popup_profile/icon_settingsNormal.png'},
        { title:'Logout',url:'login.html',icon:'images/icons/popup_profile/icon_logoutNormal.png'}
    ],
    mainMenu: [
        { title:'Dashboard',url:'dashboard.html'},
        { title:'Alarms',url:'alarm.html'},
        { title:'Create / Edit',url:'createandedit.html'},
        { title:'Reports',url:'reports.html'},
        { title:'Viewer',url:'viewerConfig.html'}
    ],
    dashblubs: [
        { title:'viewer Page',count:'04',url:'#'},
        { title:'alarm handling',count:'10',url:'alarm.html'},
        { title:'configure new',count:'10',url:'#'},
        { title:'maps',count:'10',url:'#'},
        { title:'reports page',count:'10',url:'#'},
        { title:'camera',count:'10',url:'#'}
    ],
    alarmMenu1: [
        { title:'New Alarms[10]',count:'10',url:'#'},
        { title:'Acknowledged',count:'10',url:'#'},
        { title:'Events',count:'10',url:'#'}     
    ],
    alarmActionMenu: [
        { title:'Acknowledge All',count:'10',url:'#'},    
        { title:'Clear All',count:'10',url:'#'},  
        { title:'Freeze Alarm stream',count:'10',url:'#'}
    ],
    alarmViewMenu: [
        { title:'Type',count:'10',url:'alarm-schedule.html'},    
        { title:'Severity',count:'10',url:'#'},  
        { title:'Time and Date',count:'10',url:'#'},
        { title:'Location',count:'10',url:'#'},
        { title:'Actions',count:'10',url:'#'}
    ],
    viewgridHeading: [
        { title:'Alarm Title',id:'box-col-2' },
        { title:'Type',id:'box-col-3' },
        { title:'Severity',id:'box-col-4' },
        { title:'Time',id:'box-col-5' },
        { title:'Date',id:'box-col-6' },
        { title:'Location',id:'box-col-7' },
        { title:'Action and Instructions',id:'box-col-8' },
        { title:'More',id:'box-col-9' }
    ],
    viewgridContent: [
        { value:'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',id:'box-col-2' },
        { value:'icon',id:'box-col-3' },
        { value:'High',id:'box-col-4' },
        { value:'12:32:34',id:'box-col-5' },
        { value:'14th Jan 12',id:'box-col-6' },
        { value:'Building 4,Floor 2 Zone Canteen',id:'box-col-7' },
        { value:'Acknowledge',id:'box-col-8' },
        { value:'More',id:'box-col-9' }
    ],
    configGridHeading: [
        { title:'Photo',id:'box-col-2' },
        { title:'Names',id:'box-col-3' },
        { title:'Display Name',id:'box-col-4' },
        { title:'Assigned Cards',id:'box-col-5' },
        { title:'Blood Group',id:'box-col-6' },
        { title:'Contact No.',id:'box-col-7' },
        { title:'Actions',id:'box-col-8' }
    ],
    configGridContent: [
        { title:'Photo',id:'box-col-2' },
        { title:'Names',id:'box-col-3' },
        { title:'Display Name',id:'box-col-4' },
        { title:'Assigned Cards',id:'box-col-5' },
        { title:'Blood Group',id:'box-col-6' },
        { title:'Contact No.',id:'box-col-7' },
        { title:'Actions',id:'box-col-8' }
    ],
    dashboardCrousal: [
        { headerH1:'All System Health',headerH3:'Devices with events/exceptions/not responding',headerH2:'MacDonald\'s Trending'},
        { headerH1:'MacDonald\'s Trending',headerH3:'Devices with events/exceptions/not responding',headerH2:'MacDonald\'s Trending'}
    ],
    videoOverlay : [
        { title: 'Drag New Entry to View'},
        { title: 'Drag New Entry to View'},
        { title: 'Drag New Entry to View'},
        { title: 'Drag New Entry to View'},
        { title: 'Drag New Entry to View'},
        { title: 'Drag New Entry to View'},
    ],
    userBadge : [
        { fname: 'First Name',lname:'Last Name',cardno:'5313 + 3',expire_date:'20-jan-2014',swipe:'20-jan-2014'},
        { fname: 'First Name',lname:'Last Name',cardno:'5313 + 3',expire_date:'20-jan-2014',swipe:'20-jan-2014'},
        { fname: 'First Name',lname:'Last Name',cardno:'5313 + 3',expire_date:'20-jan-2014',swipe:'20-jan-2014'},
        { fname: 'First Name',lname:'Last Name',cardno:'5313 + 3',expire_date:'20-jan-2014',swipe:'20-jan-2014'},
        { fname: 'First Name',lname:'Last Name',cardno:'5313 + 3',expire_date:'20-jan-2014',swipe:'20-jan-2014'},
        { fname: 'First Name',lname:'Last Name',cardno:'5313 + 3',expire_date:'20-jan-2014',swipe:'20-jan-2014'},
        { fname: 'First Name',lname:'Last Name',cardno:'5313 + 3',expire_date:'20-jan-2014',swipe:'20-jan-2014'},
    ]

});
/*
var ViewNotificationModel = function(){

}    

var view_notification_model = new ViewNotificationModel();
view_notification_model.messages = ko.observableArray([
    { time: '10:20', msg: 'Lorem ipsum dolorLorem ipsum dolor', icon:'icon' },
    { time: '10:21', msg: 'Lorem ipsum dolorLorem ipsum dolor', icon:'icon' },
    { time: '10:21', msg: 'Lorem ipsum dolorLorem ipsum dolor', icon:'icon' },
    { time: '10:21', msg: 'Lorem ipsum dolorLorem ipsum dolor', icon:'icon' },
    { time: '10:21', msg: 'Lorem ipsum dolorLorem ipsum dolor', icon:'icon' },
    { time: '10:22', msg: 'Lorem ipsum dolorLorem ipsum dolor', icon:'icon' }     
]);

ko.applyBindings(view_notification_model);

var ViewUserMenuModel = function(){
    userProfileMenu: [
        { title:'Save Workspace',url:'logout.html'},
        { title:'Load Workspace',url:'logout.html'},
        { title:'Profile Details',url:'logout.html'},
        { title:'Full Screen',url:'fullscreen.html'},
        { title:'Help',url:'help.html'},
        { title:'Logout',url:'logout.html'}
    ]
};

var ViewUserProfileMenuModel = function(){

}    

var view_user_model = new ViewUserProfileMenuModel();
view_user_model.userProfileMenu = ko.observableArray([
    { title:'Save Workspace',url:'logout.html'},
    { title:'Load Workspace',url:'logout.html'},
    { title:'Profile Details',url:'logout.html'},
    { title:'Full Screen',url:'fullscreen.html'},
    { title:'Help',url:'help.html'},
    { title:'Logout',url:'logout.html'}
]);

ko.applyBindings(view_user_model);
*/