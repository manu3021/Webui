(function () {

    var treeNodeModel = uibase.BaseModel.inherits({
        initialize: function (data, parentNode) {
            this.initializeBinding(data, parentNode);
        },
        initializeBinding: function (data, parentNode) {
            var self = this;
            data = data || {};
            this.isdirty = ko.observable(false);
            this.id = ko.observable(data.Id);
            this.name = ko.observable(data.Name);
            this.isexpanded = ko.observable(false);
            this.children = ko.observableArray([]);
            this.parentId = ko.observable(data.ParentId);
            this.type = ko.observable(data.EntityType);
            this.statusclass = ko.observable('');
            this.isselected = ko.observable(!!data.isselected);
            this.ishover = ko.observable(false);
            this.icon = ko.computed(function () {
                if (self.type()) {
                    if (self.statusclass())
                        return "icon_" + self.type().toLowerCase() + "_" + self.statusclass();
                    return "icon_" + self.type().toLowerCase();
                }
                else
                    return " tree-open-icon";
            });
            this.parentNode = parentNode;
            this.bindChildNodes(data.Children);
        },
        bindChildNodes: function (nodeDataList) {
            if (nodeDataList) {
                var self = this;
                this.children.removeAll();
                this.children.push.apply(this.children, nodeDataList.map(function (n) {
                    n.isselected = self.isselected();
                    return new treeNodeModel(n, self);
                }));
            }
        },
        selectNode: function (isSelected, isReverse, index) {
            index = index || 0;
            this.isselected(isSelected);
            if (!isReverse && this.children()) {
                for (var i in this.children()) {
                    this.children()[i].selectNode(isSelected, false, index + 1);
                }
            }
            if (index == 0 && isSelected && this.parentNode && !this.parentNode.isselected()) {
                var self = this;
                var unSelectedNode = ko.utils.arrayFirst(this.parentNode.children(), function (node) {
                    return !node.isselected();
                });
                if (!unSelectedNode) {
                    self.parentNode.selectNode(isSelected, true);
                }
            }
            if (index == 0 && !isSelected && this.parentNode && this.parentNode.isselected()) {
                this.parentNode.selectNode(isSelected, true);
            }
        }
    });

    var treeView = uibase.BaseEventModel.inherits({
        initialize: function (options) {
            this.bindAll(this, 'toggleExpand', 'handleSelection');
            this.options = options;
            this.initializeBinding(options);
        },
        initializeBinding: function(options) {
            this.rootNode = new treeNodeModel();
            if (options.rootNodeData) {
                this.rootNode.bindChildNodes([options.rootNodeData]);
            }
            if (options.depth == 1) {
                this.expandChildren(this.rootNode);
            }
            if (!options.lazyLoading) {
                this.render();
            }
        },
        toggleExpand: function (record) {
            var isExpanded = record.isexpanded();
            if (isExpanded) {
                record.isexpanded(false);
            }
            else {
                this.expandNode(record, isExpanded);
            }
        },
        expandNode: function (record, isExpanded) {
            if (!isExpanded && this.isExpandable(record)) {
                if (record.children().length == 0) {
                    this.ajaxRequest({
                        id: record.id(),
                        nodeType: record.type() ? record.type().toUpperCase() : null,
                        parentId: record.parentId()
                    }).done(function (val) {
                        record.bindChildNodes(val);
                        if (val && val.length > 0) {
                            record.isexpanded(true);
                        }
                    });
                }
                else {
                    record.isexpanded(true);
                }
            }
        },
        expandChildren: function (record) {
            if (record.children()) {
                for (var i in record.children()) {
                    this.expandNode(record.children()[i], false);
                }
            }
        },
        ajaxRequest: function(data) {
            var options = {
                dataType: "json",
                contentType: "application/json",
                cache: false,
                type: 'GET',
                data: data || null
            };
            if (this.options.antiForgeryToken) {
                options.headers = {
                    'RequestVerificationToken': this.options.antiForgeryToken
                }
            }
            return $.ajax(this.options.url, options);
        },
        render: function () {
            var treeViewEl = $(this.options.el).find('ul.tree:first');
            if (treeViewEl.length > 0) {
                ko.cleanNode(treeViewEl.get(0));
            }
            $(this.options.el).html(this.getTemplate());
            ko.applyBindings(this, $(this.options.el).find('ul.tree:first').get(0));
        },
        getTemplate: function () {
            treeviewTemplate = "<ul class=\"tree layoutrow scroll-y scroll-x\" data-bind=\"template: { name: '{templateId}', foreach: $data.rootNode.children }\">";
            treeviewTemplate += "<\/ul>";
            treeviewTemplate += "<script id=\"{templateId}\" type=\"text\/html\">";
            treeviewTemplate += "<li class=\"treenormal\">";
            treeviewTemplate += "   <div class=\"expand\" data-bind=\"event: { mouseover: $root.handleHover, mouseout: $root.handleHoverOut }, click: $root.handleSelection";
            treeviewTemplate += ", css: { 'Item-State-hover': $data.ishover, 'Item-State-selected': $data.isselected }\">";
            treeviewTemplate += "       <i class=\"tree-open-icon\" data-bind=\"attr: { 'class': icon}, click: $root.toggleExpand, clickBubble: false\"></i>";
            treeviewTemplate += "       <span class=\"tree-label\" data-bind=\" text: name\"></span>";
            treeviewTemplate += "       <span id=\"loadingicon\"><\/span>";
            treeviewTemplate += "   </div>";
            treeviewTemplate += "   <div class=\"expandul\" data-bind=\"if: isexpanded\">";
            treeviewTemplate += "       <ul class=\"tree\" data-bind=\"template: { name: '{templateId}', foreach: $data.children,drag: {value: $data.children} }\">";
            treeviewTemplate += "       <\/ul>";
            treeviewTemplate += "   </div>";
            treeviewTemplate += "</li>";
            treeviewTemplate += "<\/script>";
            return treeviewTemplate.replace(new RegExp('{templateId}', 'g'), this.getGuid());
        },
        getGuid: function() {
            return (function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                }
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
            })();
        },
        isExpandable: function (node) {
            var nodeType = node.type();
            if (nodeType) {
                return !this.options.expandableNodeTypes || this.options.expandableNodeTypes.indexOf(nodeType.toUpperCase()) != -1;
            }
            return false;
        },
        handleHover: function (record) {
            if (!record.isselected()) {
                record.ishover(true);
            }
            record.statusclass('Hover');
        },
        handleHoverOut: function (record) {
            record.ishover(false);
            record.statusclass('');
        },
        handleSelection: function (record) {
            var isSelected = !record.isselected();
            record.ishover(false);
            record.selectNode(isSelected);
        }
    });

    window.accesspersona.TreeView = treeView;

})();