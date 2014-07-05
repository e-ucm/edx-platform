window.MiniGame = function (el) {
    RequireJS.require(['MiniGameMain'], function (MiniGameMain) {
        new MiniGameMain(el);
    });


};
