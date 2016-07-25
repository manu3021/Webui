
//$('.dropdown-menu input, .dropdown-menu label').click(function (e) {
//    e.stopPropagation();
//});
//$('.dropdown-menu a[data-toggle="tab"]').click(function (e) {
//    e.stopPropagation();
//    $(this).tab('show')
//})
//function onAddTag(tag) {
//    alert("Added a tag: " + tag);
//}
//function onRemoveTag(tag) {
//    alert("Removed a tag: " + tag);
//}

//function onChangeTag(input, tag) {
//    alert("Changed a tag: " + tag);
//}

//$(function () {
//    $('.tags').tagsInput({
//        width: '300px', inputWidth: 1,
//        onChange: function (elem, elem_tags) {
//            var arrTag = ['php', 'ruby', 'javascript'];
//            $('.tags', elem_tags).each(function () {
//                if ($(this).text().search(new RegExp('\\b(' + arrTag.join('|') + ')\\b')) >= 0)
//                    $(this).css('background-color', 'yellow');
//            });
//        }
//    });
//    $("div.tagsinput").addClass("dropdown-toggle tags");
//    $("div.tagsinput").attr("data-toggle", "dropdown");
//    // $('#tags_2').tagsInput({
//    // 	width: 'auto',
//    // 	onChange: function(elem, elem_tags)
//    // 	{
//    // 		var arrTag = ['php','ruby','javascript'];
//    // 		$('.tag', elem_tags).each(function()
//    // 		{
//    // 			if($(this).text().search(new RegExp('\\b(' + arrTag.join('|') + ')\\b')) >= 0)
//    // 				$(this).css('background-color', 'yellow');
//    // 		});
//    // 	}
//    // });
//    // $('#tags_3').tagsInput({
//    // 	width: 'auto',
//    // 	autocomplete_url:'test/fake_json_endpoint.html'

//    // });

//});//function getresult(data, url) {
//    return ajaxRequest("POST", url, data);
//};
//function getTemplates(url) {
//    return ajaxRequest("GET", url);
//};
//var resultitem = function (data) {
//    var self = this;
//    self.Name = 'Name';//data.Name;
//    self.location = 'location';// data.location;
//}
//function getdummyresult() {
//    var retval = [];
//    retval.push(new resultitem());
//    retval.push(new resultitem());
//    retval.push(new resultitem());
//    return retval;
//}
//function ajaxRequest(type, url, data, dataType) {
//    var options = {
//        dataType: dataType || "json",
//        contentType: "application/json",
//        cache: false,
//        type: type,
//        data: data ? data.toJson() : null
//    };
//    var antiForgeryToken = $(".antiForgeryTokenLogin").val();
//    if (antiForgeryToken) {
//        options.headers = {
//            'RequestVerificationToken': antiForgeryToken
//        }
//    }
//    return $.ajax(url, options);
//}
//var searchmodel = function (options) {
//    var self = this;
//    self.options = options;
//    self.Query = ko.observable("");
//    self.Tags = ko.observable("");
//    self.results = ko.observableArray([]);
//    self.search = function (data, event) {
//        if (self.options.url == undefined)
//            self.options.url = $(event.currentTarget).attr('data-searchurl');
//        self.Query(event.currentTarget.value);
//        self.Tags($(event.currentTarget).attr('data-searchtags'));
//        if (self.Query().length > 2) {
//            getresult(this, options.url).done(function (json) {
//                if (json.Success) {
//                    json.data = json.data || [];
//                    if (json.data.length > 0) {
//                        try {
//                            $.map(json.data, function (uItem) { self.results.push(new resultitem(uItem)); });
//                            if (self.options.SuccessCallback) {
//                                self.options.SuccessCallback(json.data)
//                            }
//                        } catch (e) {
//                            console.error("search script exception " + e.message);
//                            if (self.options.FailedsCallback) {
//                                self.options.FailedsCallback(e);
//                            }
//                            alertify.success('Success' + json.data);
//                            $("#result_" + self.options.searchId).show();
//                        }
//                    }
//                    else {
//                        alertify.success('Failed');
//                    }
//                }

//            });
//        }
//    }
//    self.toJson = function () { return ko.toJSON(this) };
//}//ko.applyBindings(new searchmodel(), document.getElementById('#searchcontainer'));