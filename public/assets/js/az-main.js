function changePassSetup() {
    $('#pass_new').val('');
    $('#pass_new_copy').val('');
    $('#msg-new-pass-success').removeClass('form__msg--on');
    $('#msg-new-pass-warning').removeClass('form__msg--on');
}

function comparePassFields() {
    return $('#pass_new').val() === $('#pass_new_copy').val();
}

function showNewPassMsg() {
    var succesMsg = $('#msg-new-pass-success');
    var warnMsg = $('#msg-new-pass-warning');

    if (comparePassFields()) {
        succesMsg.addClass('form__msg--on');
        warnMsg.removeClass('form__msg--on');
    } else {
        succesMsg.removeClass('form__msg--on');
        warnMsg.addClass('form__msg--on');
    }
}

document.addEventListener( 'keyup', function( event ) { showNewPassMsg(); });

function toogleMenu() {
    $('#global-nav-menu').toggleClass('global-nav__list--is-show');
    $('body').toggleClass('overflow-hidden');
}

$(document).on('click', '.global-nav__trigger', function () { toogleMenu(); });
$(document).on('click', '.global-nav__close', function () { toogleMenu(); });

function toogleSub(target) {
    $(target).toggleClass('submenu--is-show');
}

$(document).on('click', '.j-thumb', function () { toogleSub('#thumbSubmenu'); });
$(document).on('click', '.j-timeline', function () { toogleSub('#timelineSubmenu'); });

function toogleAccordion() {
    $('.accordion').toggleClass('accordion--is-show');
}

$(document).on('click', '.accordion__trigger', function () { toogleAccordion(); });

function tooglePopover() {
    $('.popover').toggleClass('popover--is-show');
}

$(document).on('click', '.popover__trigger', function () { tooglePopover(); });
$(document).on('click', '.popover__close', function () { tooglePopover(); });

function toogleModal(target) {
    var el = document.getElementById(target);
    $(el).toggleClass('modal--is-show');
    $('body').toggleClass('overflow-hidden');
}

$(document).on('click', '#change_pass_trigger', function () {
    toogleModal('change_pass_modal');
    toogleSub();
    changePassSetup();
});

$(document).on('click', '#change_pass_close', function () { toogleModal('change_pass_modal'); });

$(document).on('click', '#change_image_trigger', function () {
    toogleModal('change_image_modal');
    toogleSub();
});

$(document).on('click', '#change_image_close', function () { toogleModal('change_image_modal'); });

function scrollUp() {
    var y = $('.course-nav__nav').scrollTop();
    $('.course-nav__nav').animate({ scrollTop: y - 104}, 300);
}

function scrollDown() {
    var y = $('.course-nav__nav').scrollTop();
    $('.course-nav__nav').animate({ scrollTop: y + 104}, 300);
}

$(document).on('click', '.course-nav__chevron--up', function () { scrollUp(); });
$(document).on('click', '.course-nav__chevron--down', function () { scrollDown(); });


function tabsControl(el) {

    $('.tabs_tab').each(function() {
        $(this).removeClass('tabs__tab--is-active');
    });

    $('.report__section').each(function() {
        $(this).removeClass('report__section--is-active');
    });

    var target = $('#' + el.data('target') );

    el.addClass('tabs__tab--is-active');
    target.addClass('report__section--is-active');

}

$(document).on('click', '.report__tab', function () { tabsControl($(this)); });

function toogleAddUser(el) {

    $('.add-user').each(function() {
        $(this).removeClass('add-user--is-show');
    });

    var target = $('#' + el.data('target') );
    target.toggleClass('add-user--is-show');
}

function closeAddUser(el) {
    var target = $('#' + el.data('target') );
    target.toggleClass('add-user--is-show');
}

$(document).on('click', '.j-add-user-cta', function () { toogleAddUser($(this)); });
$(document).on('click', '.j-add-user-close', function () { closeAddUser($(this)); });

var allEnrolledShowing = false;
var personSpecificShowing = false;
var quizSpecificShowing = false;

function toogleAllEnrolled() {
    if(allEnrolledShowing) {
        $('#report-all-enrolled').hide();
        $('#report-courses').addClass('report__section--is-active');
        $('#report-header').show();
        $('.report__tabs').show();

        allEnrolledShowing = false;
    } else {
        $('#report-all-enrolled').show();
        $('#report-courses').removeClass('report__section--is-active');
        $('#report-header').hide();
        $('.report__tabs').hide();

        allEnrolledShowing = true;
    }
}

$(document).on('click', '#cta-all-enrolled', function () { toogleAllEnrolled(); });
$(document).on('click', '#back-all-enrolled', function () { toogleAllEnrolled(); });

function tooglePersonSpecific() {
    if(personSpecificShowing) {
        $('#report-person-specific').hide();
        $('#report-people').addClass('report__section--is-active');
        $('#report-header').show();

        personSpecificShowing = false;
    } else {
        $('#report-person-specific').show();
        $('#report-people').removeClass('report__section--is-active');
        $('#report-header').hide();


        personSpecificShowing = true;
    }
}

$(document).on('click', '#person__0', function () { tooglePersonSpecific(); });
$(document).on('click', '#back-person-specific', function () { tooglePersonSpecific(); });


function toogleQuizSpecific() {
    if(quizSpecificShowing) {
        $('#report-quiz-specific').hide();
        $('#report-quiz').addClass('report__section--is-active');
        $('#report-header').show();

        quizSpecificShowing = false;
    } else {
        $('#report-quiz-specific').show();
        $('#report-quiz').removeClass('report__section--is-active');
        $('#report-header').hide();

        quizSpecificShowing = true;
    }

    if ($('html').scrollTop()) {
        $('html').animate({ scrollTop: 0 });
        return;
    }

    if ($('body').scrollTop()) {
        $('body').animate({ scrollTop: 0 });
        return;
    }

}

$(document).on('click', '#quiz__class1__0', function () { toogleQuizSpecific(); });
$(document).on('click', '#quiz__class2__0', function () { toogleQuizSpecific(); });
$(document).on('click', '#back-quiz-specific', function () { toogleQuizSpecific(); });

function questionScrollLeft() {
    var x = $('#side-arrows-container-questions').scrollLeft();
    $('#side-arrows-container-questions').animate({ scrollLeft: x - 128}, 300);
}

function questionScrollRight() {
    var x = $('#side-arrows-container-questions').scrollLeft();
    $('#side-arrows-container-questions').animate({ scrollLeft: x + 128}, 300);
}

$(document).on('click', '#side-arrows-container-arrow-left', function () { questionScrollLeft(); });
$(document).on('click', '#side-arrows-container-arrow-right', function () { questionScrollRight(); });