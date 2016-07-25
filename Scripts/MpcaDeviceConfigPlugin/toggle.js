jQuery(document).ready(function () {

    jQuery('.switch_options').each(function () {
        ko.bindingHandlers.fireInputChange = {
            update: function (element, valueAccessor, allBindingsAccessor) {
                var bindings = allBindingsAccessor();
                if (bindings.value != null) {
                    $(element).change();
                }
            }
        };

        //This object
        var obj = jQuery(this);

        var enb = obj.children('.switch_enable'); //cache first element, this is equal to ON
        var dsb = obj.children('.switch_disable'); //cache first element, this is equal to OFF
        var input = obj.children('input'); //cache the element where we must set the value
        var input_val = obj.children('input').val(); //cache the element where we must set the value

        /* Check selected */
        if (0 == input_val) {
            dsb.addClass('selected');
        }
        else if (1 == input_val) {
            enb.addClass('selected');
        }
        $(document).on('click', '.switch_enable', function () {        //Action on user's click(ON)
            //$(dsb).removeClass('selected'); //remove "selected" from other elements in this object class(OFF)
            var diselem = $(this.parentElement).find('.switch_disable');
            $(diselem).removeClass('selected');
            $(this).addClass('selected'); //add "selected" to the element which was just clicked in this object class(ON) 
            //$(input).val(1).change(); //Finally change the value to 1
            var inpelem = $(this.parentElement).find('.switch_val');
            $(inpelem).val(1).change();
        });

        //Action on user's click(OFF)
        $(document).on('click', '.switch_disable', function () {
            //$(enb).removeClass('selected'); //remove "selected" from other elements in this object class(ON)
            //$(this).addClass('selected'); //add "selected" to the element which was just clicked in this object class(OFF) 
            //$(input).val(0).change(); // //Finally change the value to 0

            var enbelem = $(this.parentElement).find('.switch_enable');
            $(enbelem).removeClass('selected');
            $(this).addClass('selected'); //add "selected" to the element which was just clicked in this object class(ON) 
            var inpelem = $(this.parentElement).find('.switch_val');
            $(inpelem).val(0).change();
        });


        //$(".switch_val").change(function () {
        //    var $input = $(this);
        //    var iVal = $input.val();
        //    if (0 == iVal) {
        //        dsb.addClass('selected');
        //        enb.removeClass('selected');
        //    }
        //    else if (1 == iVal) {
        //        enb.addClass('selected');
        //        dsb.removeClass('selected');
        //    }
        //}).change();

        $(document).on('change', '.switch_val', function () {
            var $input = $(this);
            var iVal = $input.val();
            if (0 == iVal) {
                var diselem = $(this.parentElement).find('.switch_disable');
                $(diselem).addClass('selected');
                var enbelem = $(this.parentElement).find('.switch_enable');
                $(enbelem).removeClass('selected');
            }
            else if (1 == iVal) {
                var diselem = $(this.parentElement).find('.switch_disable');
                $(diselem).removeClass('selected');
                var enbelem = $(this.parentElement).find('.switch_enable');
                $(enbelem).addClass('selected');
            }
        });
    });

});