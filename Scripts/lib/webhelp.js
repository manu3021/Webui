$(document).ready(function (common) {
// Tree accordion
    $('.tree li ul').hide();
    $('.tree li').addClass('parent_li').find(' > span');
    $('.tree li > span').on('click', function (e) {       
        var children = $(this).parent('li.parent_li').find(' > ul');
        if (children.is(":hidden")) {
            children.show('fast');
            $(this).find(' > i').addClass('icon-minus-sign').removeClass('icon-plus-sign');
            $(this).addClass('treeitemactive');
            $(".tab-pane.active .tree li.parent_li > span").not($(this)).removeClass('treeitemactive');
        } else {           
            children.hide('fast');
            $(this).find(' > i').addClass('icon-plus-sign').removeClass('icon-minus-sign');
            $(".tab-pane.active .tree li.parent_li > span").addClass('treeitemactive');
            $(".tab-pane.active .tree li.parent_li > span").not($(this)).removeClass('treeitemactive');
        }
        e.stopPropagation();
    });

    $("li.search-item span span").click(function (e) {       
        var $link = $(this).find("a");       
        if ($link[0] != undefined) {            
            $(this).closest('div').next().find('iframe').attr('src', $link[0].href);
        }        
    });
    
// Search filter
    ko.bindingHandlers.autoFilter = {
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            if (value) {
                var wrapperClassName = value.wrapperClassName;
                $(element).on('keyup paste', function () {
                    var searchText = !!$(element).val() ? $(element).val().toLowerCase() : '';
                    var selector = '.' + wrapperClassName + ' .search-item';
                    //input value
                    var helpvalue = $('.helpsearch').val();
                    $(selector).each(function () {
                        var excludeOthers = false;
                        $(this).find(".search-item-text").each(function () {
                            //search text
                            var elValue = $(this).text();
                            var parentEl = $(this).closest(".search-item");
                            if (elValue)
                            {
                                elValue = elValue.toLowerCase();
                                if (elValue.indexOf(searchText) >= 0 || searchText.length < 1) {                                    
                                    if (parentEl)
                                    {
                                        if ('helpvalue:contains(elValue)')
                                        {
                                            parentEl.css("display", "block");
                                            $(this).parents('ul').css('display', 'block');
                                            if (helpvalue == elValue) {
                                                //selected state
                                                $(this).parent("span").addClass("treeitemactive");
                                                //content load based on search
                                                var linkhref = $(this).parent("span").find("a").attr('href');
                                                $('.contentarea iframe').attr('src', linkhref);
                                                //level 1 and 2 search text
                                                var leveltwo = $(this).parents().hasClass('list-level2');
                                                var leveltwo_parents = $(this).parents("li.main-par").find('i');
                                                var levelone_parent = $(this).parents(".list-level1").prev("span").find('i');
                                                    if (leveltwo) {
                                                        leveltwo_parents.addClass("icon-minus-sign");
                                                        levelone_parent.addClass("icon-minus-sign");
                                                    }
                                                //level 3 search text
                                                var levelthree = $(this).parents().hasClass('list-level3');
                                                    if (levelthree) {
                                                        $(this).parents(".list-level3,.list-level1").prev("span").find('i').addClass("icon-minus-sign");
                                                    }
                                            }
                                            else {
                                                $(".help_parent span").removeClass("treeitemactive");
                                                $(".list-level1 i").removeClass("icon-minus-sign");
                                            }
                                        }
                                        excludeOthers = true;
                                        if (helpvalue == '')
                                        {
                                            $('.help_parent li').css("display", "block");
                                            $('.help_parent li ul').css("display", "none");
                                            $('.help_parent').find('i').removeClass("icon-minus-sign")
                                        }
                                    }
                                }
                                //hide other parent ul's
                                else if (!excludeOthers) {
                                    parentEl.find("ul").hide();
                                    if (parentEl) {
                                        parentEl.hide();
                                    }
                                }
                            }
                        });
                    });
                });
            }
        }
    }
        
// KO binding

    var variables = [];
    var viewModel = {
        query: ko.observable(''),
        selected: ko.observable(),
        contentHeader: ko.observable(''),
        culture: ko.observable(getCookie('_culture'))
    };    
    viewModel.variables = ko.dependentObservable(function () {
        var search = this.query().toLowerCase();
        return ko.utils.arrayFilter(variables, function (variables) {
            return variables.name.toLowerCase().indexOf(search) >= 0;
        });
    }, viewModel);

    viewModel.select = function (option) {        
        this.selected(option);        
        var culture = getCookie('_culture');
        if (option == 'tab1') $('#helpIframe').attr('src', culture + '/overview.html');
        else if (option == 'tab2') $('#helpInstallationIframe').attr('src', culture + '/installation.html');
        else $('#helpToolsIframe').attr('src', culture + '/tools.html');
    }    
    ko.applyBindings(viewModel);
    viewModel.selected('tab1');    
});


function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}