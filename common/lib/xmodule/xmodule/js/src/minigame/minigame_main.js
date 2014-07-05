/**
 * @file The main module definition for the MiniGame XModule.
 *
 *  Defines a constructor function which operates on a DOM element. 
 *  Show the user inputs so he can enter "game progress", 
 *
 *  @module MiniGameMain
 *
 *  @exports MiniGameMain
 *
 *  @requires logme
 *
 *  @external $, RequireJS
 */

(function (requirejs, require, define) {
define('MiniGameMain', ['logme'], function (logme) {

    /**
     * @function MiniGameMain
     *
     * This function will process all the attributes from the DOM element passed, taking all of
     * the configuration attributes. It will either then attach a callback handler for the click
     * event on the button in the case when the user needs to enter words, or it will call the
     * appropriate method to generate and render a word cloud from user's entered words along with
     * all of the other words.
     *
     * @constructor
     *
     * @param {jQuery} el DOM element where the minigame is to be rendered.
     */
    var MiniGameMain = function (el) {
        var _this = this;

        _this.miniGameEl = $(el).find('.minigame');
        
        // Get the URL to which we will post user actions; set by html via data-ajax-url="..."
        _this.ajax_url = this.miniGameEl.data('ajax-url');
        
        // hide until configured
        _this.miniGameEl.hide();
        _this.miniGameEl.displayed = false;

        // Retrieve response from the server as an AJAX request. 
        // Attach a callback that will be fired on server's response.
        $.postWithPrefix(
            _this.ajax_url + '/' + 'get_state', null,
            function (response) {
                if (response.status !== 'success') {
                    logme('ERROR: ' + response.error, response.levels);
                    return;
                }
                _this.configJson = response;
            }
        )
        .done(function () {
            if (_this.configJson) {
                _this.showMiniGame();
            }
        });
    }; // End-of: var MiniGameMain = function (el) {

    /**
     * @function submitProgress
     *
     * Callback to be executed when the user updates progress.
     */
    MiniGameMain.prototype.submitProgress = function () {
        var _this = this,
            data = {'levels': _this.configJson.levels};

        // Send the data to the server as an AJAX request. Attach a callback that will
        // be fired on server's response.
        $.postWithPrefix(
            _this.ajax_url + '/' + 'submit', $.param(data),
            function (response) {
                if (response.status !== 'success') {
                    logme('ERROR: ' + response.error, response);

                    return;
                } else {
                    logme('OK: successfuly sent ', data);
                    _this.showMiniGame();
                }
            }
        );

    }; // End-of: MiniGameMain.prototype.submitAnswer = function () {

    /**
     * @function showMiniGame
     *
     * This function updates the miniGame element with the current settings &
     * progress
     */
    MiniGameMain.prototype.showMiniGame = function () {
        var _this = this;
        function createLevel(i, level) {

            var wrapper = $("<div class='level_" + i + "'>");
            var inputEl = $("<input type='range'" 
                    + " class='input-minigame' min='0' max='" + level.max + "'"
                    + " value='" + level.progress + "'></input>");
            var checkboxEl = $("<input type='checkbox'" 
                    + " class='input-minigame-finished'"
                    + (level.finished ? " checked='true' " : "")
                    + ">Finished</input>");
            _this.miniGameEl.append(wrapper);
            wrapper.append("Level " + i + " -- <b>" + level.name + "</b>"
                    + " (<span class='progress'>" + level.progress + "</span>/" 
                    + level.max + ") <br>");
            wrapper.append(inputEl);
            wrapper.append(checkboxEl);
            
            function handler() {
                if (inputEl.val() > level.max) {
                    inputEl.val(level.max);
                }
                var changesDetected = false;
                if (inputEl.val() !== level.progress) {
                    level.progress = inputEl.val();
                    changesDetected = true;
                }
                if (checkboxEl.is(':checked') !== level.finished) {
                    level.finished = checkboxEl.is(':checked');
                    changesDetected = true;
                }
                if (changesDetected) {
                    _this.submitProgress();                    
                }
            };

            RequireJS.require(['raphael'], function (Raphael) {
        var paper = Raphael(10, 50, 320, 200);
	var circle = paper.circle(50, 40, 10);
 	paper.circle(320, 240, 60).animate({fill: "#223fa3", stroke: "#000", "stroke-width": 80, "stroke-opacity": 0.5}, 2000);
    });
            inputEl.blur(handler);
            checkboxEl.click(handler);            
        }
        
        function updateLevel(i, level) {
            var levelEl = _this.miniGameEl.find(".level_"+i);
            levelEl.find("span.progress").text(level.progress);
            levelEl.find(".input-minigame").val(level.progress);
            var checkboxEl = levelEl.find(".input-minigame-finished");
            if (level.finished) {
                checkboxEl.prop('checked', true);
            } else {
                checkboxEl.prop('checked', false);                
            }
        }
        
        if ( ! _this.displayed) {
            // create view for each level
            _this.displayed = true;
            $.each(_this.configJson.levels, createLevel);        
            var buttonEl = $("<button class='save'>Save</button>");            
            _this.miniGameEl.append(buttonEl);
            buttonEl.click(_this.submitProgress());
        } else {
            $.each(_this.configJson.levels, updateLevel);
        }

            
        _this.miniGameEl.show();
    };
    
    return MiniGameMain;

}); // End-of: define('MiniGameMain', ['logme'], function (logme) {
}(RequireJS.requirejs, RequireJS.require, RequireJS.define)); // End-of: (function (requirejs, require, define) {
