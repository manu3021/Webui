
$(function () {
    var timeout = 5000;
    window.MPC = window.MPC || {};
    window.MPC.dialogActive = false;
    window.MPC.dialog = null;
    $(document).bind("idle.idleTimer", function () {
        console.log('User is Idle:' + Date());
        if (!window.MPC.dialogActive)
            window.MPC.dialog = $.timeoutDialog({ timeout: 20*60, countdown: 60, logout_url: $("#signout").attr("data-url"), restart_on_yes: false });
    });
    $(document).bind("active.idleTimer", function () {
        // function you want to fire when the user becomes active again
        console.log('User is Active:' + Date());
        if (!window.MPC.dialogActive)
            window.MPC.dialog.reset();
    });
    $.idleTimer(timeout);
});