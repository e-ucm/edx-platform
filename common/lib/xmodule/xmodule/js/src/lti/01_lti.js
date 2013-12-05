/**
 * File: lti.js
 *
 * Purpose: LTI module constructor. Given an LTI element, we process it.
 *
 *
 * Inside the element there is a form. If that form has a valid action
 * attribute, then we do one of:
 *
 *     1.) Submit the form. The results will be shown on the current page in an
 *         iframe.
 *     2.) Attach a handler function to a link which will submit the form. The
 *         results will be shown in a new window.
 *
 * The 'open_in_a_new_page' data attribute of the LTI element dictates which of
 * the two actions will be performed.
 */

/*
 * So the thing to do when working on a motorcycle, as in any other task, is to
 * cultivate the peace of mind which does not separate one's self from one's
 * surroundings. When that is done successfully, then everything else follows
 * naturally. Peace of mind produces right values, right values produce right
 * thoughts. Right thoughts produce right actions and right actions produce
 * work which will be a material reflection for others to see of the serenity
 * at the center of it all.
 *
 * ~ Robert M. Pirsig
 */

(function (requirejs, require, define) {

// JavaScript LTI XModule
define(
'lti/01_lti.js',
[],
function () {

    var LTI = LTIConstructor;

    LTI.prototype = {
        submitFormHandler: submitFormHandler,
        getNewSignature: getNewSignature,
        handleAjaxUpdateSignature: handleAjaxUpdateSignature
    };

    return LTI;

    // JavaScript LTI XModule constructor
    function LTIConstructor(element) {
        // In cms (Studio) the element is already a jQuery object. In lms it is
        // a DOM object.
        //
        // To make sure that there is no error, we pass it through the $()
        // function. This will make it a jQuery object if it isn't already so.
        this.el = $(element);

        this.formEl = this.el.find('.ltiLaunchForm');
        this.formAction = this.formEl.attr('action');

        // If action is empty string, or action is the default URL that should
        // not cause a form submit.
        if (!this.formAction || this.formAction === 'http://www.example.com') {

            // Nothing to do - no valid action provided. Error message will be
            // displaced in browser (HTML).
            return;
        }

        // We want a Boolean 'true' or 'false'. First we will retrieve the data
        // attribute.
        this.openInANewPage = this.el.find('.lti').data('open_in_a_new_page');
        // Then we will parse it via native JSON.parse().
        this.openInANewPage = JSON.parse(this.openInANewPage);

        // The URL where we can request for a new OAuth signature for form
        // submission to the LTI provider.
        this.ajaxUrl = this.el.find('.lti').data('ajax_url');

        // The OAuth signature can only be used once (because of timestamp
        // and nonce). This will be reset each time the form is submitted so
        // that we know to fetch a new OAuth signature on subsequent form
        // submit.
        this.signatureIsNew = true;

        // If the Form's action attribute is set (i.e. we can perform a normal
        // submit), then we (depending on instance settings) submit the form
        // when user will click on a link, or submit the form immediately.
        if (this.openInANewPage === true) {
            this.newWindowBtnEl = this.el.find('.link_lti_new_window')
                .on(
                    'click',
                    { ltiInstance: this },
                    this.submitFormHandler
                );
        } else {
            // At this stage the form exists on the page and has a valid
            // action. We are safe to submit it, even if `openInANewPage` is
            // set to some weird value.
            this.submitFormHandler();
        }
    }

    // The form submit handler. Before the form is submitted, we must check if
    // the OAuth signature is new (valid). If it is not new, block form
    // submission and request for a signature. After a new signature is
    // fetched, the form will be submitted.
    function submitFormHandler(event) {
        var lti;

        if (event) {
            lti = event.data.ltiInstance;
        } else {
            lti = this;
        }

        if (lti.signatureIsNew) {
            // If the OAuth signature is new, mark it as old.
            lti.signatureIsNew = false;

            // Continue with submitting the form.
            lti.formEl.submit();
        } else {
            // The OAuth signature is old. Request for a new OAuth signature.
            lti.getNewSignature();

            // Don't submit the form. It will be submitted once a new OAuth
            // signature is received.
        }
    }

    // Request form the server a new OAuth signature.
    function getNewSignature() {
        $.postWithPrefix(
            this.ajaxUrl + '/regenerate_signature',
            {},
            this.handleAjaxUpdateSignature
        );
    }

    // When a new OAuth signature is received, and if the data received back is
    // OK, update the form, and submit it.
    function handleAjaxUpdateSignature(response) {
        var _this = this;

        // If the response is valid, and contains expected data.
        if ($.isPlainObject(response.input_fields)) {
            // We received a new OAuth signature.
            this.signatureIsNew = true;

            // Update the form fields with new data, and new OAuth
            // signature.
            $.each(response.input_fields, function (name, value) {
                var inputEl = _this.formEl.find("input[name='" + name + "']");

                inputEl.val(value);
            });

            // Submit the form.
            this.submitFormHandler();
        } else {
            console.log('[LTI info]: ERROR. Could not update signature.');
        }
    }
});

}(RequireJS.requirejs, RequireJS.require, RequireJS.define));
