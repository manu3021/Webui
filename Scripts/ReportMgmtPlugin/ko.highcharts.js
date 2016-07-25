ko.bindingHandlers.highcharts = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var allBindings = allBindingsAccessor();
        var highChartsOptions = allBindings.highcharts() || {};
        var defaultOptions = {
            chart: {
                renderTo: 'container',
                type: 'pie'
                
            },

            title: {
                text: '',
                align: 'center',
                verticalAlign: 'middle',
               
            },
            yAxis: {
                title: {
                    text: ''
                }
            },
            tooltip: {
                enabled:false,
                formatter: function () {
                    return '<b>' + this.point.name + '</b>: ' + this.y ;
                }
            },
            plotOptions: {
                pie: {
                   // allowPointSelect: true,
                   // cursor: 'pointer',
                    showInLegend: true,
                    connectorColor: 'transparent',
                    align:'right'
                }
            },
            series: []
        }

        $(element).empty().highcharts($.extend(defaultOptions, highChartsOptions));
        return { controlsDescendantBindings: true };
    },
    update: function (element, valueAccessor) {
        var charts=$(element).data('highcharts');
    }
   
}


