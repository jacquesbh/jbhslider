/**
 * JbhSlider, a simple jQuery slider. v1.0.5.2
 *
 * http://jacques.sh/jbhslider/
 *
 *  ***
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/lgpl.html>.
 *
 *  ***
 *
 * @author Jacques Bodin-Hullin <http://jacques.sh>
 * @version 1.0.5.2
 */

if (!jQuery.fn.jbhSlider) {

    (function($) {

        var version = '1.0.5.2';

        var settings = {
            init: function (slider) {},
            selector: '> ul',
            cssClass: 'jbhSlider',
            elements: {
                selector: '> li',
                cssClass: 'jbhSliderItem',
                css: {}
            },
            css: {
                width: 500,
                height: 250
            },
            transition: {
                type: 'fade', /* fade, horizontal-left, horizontal-right */
                duration: 1000,
                timer: 3000,
                actionStopTimer: true,
                mouseHoverStop: true,
                before: function (slider, to, transition) {transition();},
                success: function (slider, to) {},
                maxZIndex: 300,
                repeat: -1
            },
            pagination: {
                type: null /* numbers, bullets, custom, NULL */,
                text: '{{page}}',
                cssClass: 'jbhSliderPages',
                id: null,
                currentCssClass: 'current',
                tag: 'ol',
                subTag: 'li',
                position: 'after', /* after, before */
                container: null
            },
            navigation: {
                active: true,
                cssClass: 'jbhSliderNavigation',
                id: null,
                loop: true,
                tag: 'ul',
                subTag: 'li',
                next: {
                    text: '&gt;',
                    cssClass: 'jbhSliderNavigationNext' //,
                    //link: null
                },
                previous: {
                    text: '&lt;',
                    cssClass: 'jbhSliderNavigationPrevious' //,
                    //link: null
                },
                position: 'after', /* after, before */
                container: null
            }
        };

        var i = 0;

        var methods = {
            version: function () {
                return this.version;
            },

            init: function (options) {

                /* Settings */
                var sets = {};
                $.extend(true, sets, settings, options);

                /* Get elements */
                $this = this;
                $ul = (sets.selector != null) ? $this.find(sets.selector) : $this;
                $liList = $ul.find(sets.elements.selector);

                /* Basics attributes */
                $this.addClass(sets.cssClass)
                     .css($.extend({}, sets.css, {
                         overflow: 'hidden'
                     }));
                $liList.addClass(sets.elements.cssClass);

                /* More than one li ? */
                if ($liList.length < 2) {
                    return $this;
                }

                /* Data */
                sets.data = {
                    isJbhSlider: true,
                    ul: $ul,
                    liList: $liList,
                    inTransitionTo: $($liList[0]),
                    mouseIn: false
                };
                count = $liList.length;
                $this.data({
                    settings: sets,
                    jbhSliderInit: true,
                    count: count,
                    repetitions: 0,
                    current: $($liList[0]),
                    to: null
                });
                for (i = 0; i < count; i++) {
                    $.data($liList[i], {
                        slider: $this,
                        pos: i+1,
                        first: false,
                        last: false
                    });
                }
                $.data($liList[0], 'first', true);
                $.data($liList[count-1], 'last', true);

                /* Mouse events */
                $this.hover(function () {
                    $(this).data('mouseIn', $(this).data('settings').transition.mouseHoverStop);
                }, function () {
                    $(this).data('mouseIn', false);
                });

                /* Functions */
                var transition = null;
                var init = null;

                if (!sets.selector) {
                    sets.transition.type = 'fade';
                }

                switch (sets.transition.type) {

                    case 'horizontal-left':
                        init = function (slider) {
                            var sets = slider.data('settings');
                            slider.css({
                                position: 'relative'
                            });
                            sets.data.ul.css($.extend({}, sets.css, {
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: sets.css.width * count
                            }));
                            sets.data.liList.css($.extend({}, (Object.keys(sets.elements.css).length ? sets.elements.css : sets.css), {
                                'float': 'left'
                            }));
                            $(sets.data.liList[0]).css({
                                opacity: 1
                            });
                        };
                        transition = function (slider, from, to) {
                            var sets = slider.data('settings');
                            sets.data.ul.animate({
                                left: (to.data('pos')-1) * -sets.css.width
                            }, sets.transition.duration, function () {
                                slider.jbhSlider('_transitionSuccess', from, to);
                            });
                        };
                    break;

                    case 'horizontal-right':
                        init = function (slider) {
                            var sets = slider.data('settings');
                            slider.css({
                                position: 'relative'
                            });
                            sets.data.ul.css($.extend({}, sets.css, {
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: sets.css.width * count
                            }));
                            sets.data.liList.css($.extend({}, (Object.keys(sets.elements.css).length ? sets.elements.css : sets.css), {
                                'float': 'right'
                            }));
                            $(sets.data.liList[0]).css({
                                opacity: 1
                            });
                        };
                        transition = function (slider, from, to) {
                            var sets = slider.data('settings');
                            sets.data.ul.animate({
                                right: (to.data('pos')-1) * -sets.css.width
                            }, sets.transition.duration, function () {
                                slider.jbhSlider('_transitionSuccess', from, to);
                            });
                        };
                    break;

                    case 'fade':
                    default:
                        sets.data.zIndex = 1;
                        init = function (slider) {
                            var sets = slider.data('settings');
                            sets.data.ul.css($.extend({}, sets.css, {
                                position: 'relative'
                            }));
                            sets.data.liList.css($.extend({}, (Object.keys(sets.elements.css).length ? sets.elements.css : sets.css), {
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                opacity: 0
                            }));
                            $(sets.data.liList[0]).css({
                                opacity: 1,
                                zIndex: sets.data.zIndex
                            });
                        };
                        transition = function (slider, from, to) {
                            from.stop(true);
                            to.stop(true);
                            from.animate({
                                opacity: 0
                            }, sets.transition.duration);
                            to.animate({
                                opacity: 1
                            }, sets.transition.duration, function () {
                                to.css('z-index', ++sets.data.zIndex);
                                slider.jbhSlider('_transitionSuccess', from, to);
                                var count = slider.data('count');

                                // Check z-index maximum
                                var zIndexMax = sets.transition.maxZIndex; // It's max + items count
                                if (sets.data.zIndex > (zIndexMax + count)) {
                                    for (i = 0; i <= count-1; i++) {
                                        $(sets.data.liList[i]).css('z-index', $(sets.data.liList[i]).css('z-index') - zIndexMax);
                                    }
                                    sets.data.zIndex = count + 1;
                                }
                            });
                        };
                    break;
                }

                /* Init slider */
                sets.init($this);
                init($this);

                sets.data.transition = transition;

                /* Timer */
                if (sets.transition.timer > 0) {
                    $this.jbhSlider('_loadTimer');
                }

                /* Pagination */
                var $pagination = $('<'+sets.pagination.tag+'></'+sets.pagination.tag+'>');
                $pagination.addClass(sets.pagination.cssClass);

                if (sets.pagination.id) {
                    $pagination.attr('id', sets.pagination.id);
                }

                sets.pagination.element = $pagination;

                switch (sets.pagination.type) {

                    case 'numbers':
                        sets.pagination.text = '{{page}}';
                    break;

                    case 'custom':
                    break;

                    case 'bullets':
                        sets.pagination.text = '&bull;';
                    default:
                    break;
                }

                sets.pagination.elements = new Array();

                for (i = 1; i <= $this.data('count'); i++) {
                    var $link = $('<a href="#"></a>');
                    $li = $($liList[i-1]);
                    $link.data({
                        slider: $this,
                        to: $li
                    });
                    $link.html(sets.pagination.text.replace('{{page}}', i))
                         .click(function () {
                             var $this = $(this);
                             var slider = $this.data('slider');
                             slider.jbhSlider('_slide', $(this).data('to'), transition, true);

                             return false;
                         });
                    $li.data('pager', $link);
                    if (sets.pagination.subTag != null && sets.pagination.subTag.length > 0) {
                        $pagination.append($('<'+sets.pagination.subTag+'></'+sets.pagination.subTag+'>').append($link));
                    } else {
                        $pagination.append($link);
                    }
                    sets.pagination.elements[i-1] = $link;
                }
                if (sets.pagination.subTag != null && sets.pagination.subTag.length > 0) {
                    $pagination.find(sets.pagination.subTag + ':first').addClass(sets.pagination.currentCssClass);
                }
                sets.pagination.last = $pagination.find('a:first').addClass(sets.pagination.currentCssClass);


                if (sets.pagination.type != null && sets.pagination.type.length > 0) {
                    var $pagesContainer = $this;
                    if (sets.pagination.container != null) {
                        $pagesContainer = $(sets.pagination.container);
                        if (sets.pagination.position == 'before') {
                            $pagesContainer.prepend($pagination);
                        } else {
                            $pagesContainer.append($pagination);
                        }
                    } else {
                        if (sets.pagination.position == 'before') {
                            $pagesContainer.before($pagination);
                        } else {
                            $pagesContainer.after($pagination);
                        }
                    }
                }

                /* Navigation */
                var $navigation = $('<'+sets.navigation.tag+'></'+sets.navigation.tag+'>');
                $navigation.addClass(sets.navigation.cssClass);

                if (sets.navigation.id) {
                    $navigation.attr('id', sets.navigation.id);
                }

                sets.navigation.element = $navigation;

                /* Previous Link */
                var $previousLink = null;
                if (sets.navigation.previous.link == null) {
                    $previousLink = $('<a href="#"></a>');
                    sets.navigation.previous.link = $previousLink;
                } else {
                    $previousLink = sets.navigation.previous.link;
                }
                $previousLink.addClass(sets.navigation.previous.cssClass);
                $previousLink.data('slider', $this);
                if (sets.navigation.loop) {
                    $this.data('previous', $($liList[count-1]));
                    $previousLink.css('visibility', 'visible');
                } else {
                    $this.data('previous', null);
                    $previousLink.css('visibility', 'hidden');
                }
                $previousLink.html(sets.navigation.previous.text)
                    .click(function () {
                        $(this).data('slider').jbhSlider('previous', true);
                        return false;
                    });

                if (sets.navigation.subTag != null && sets.navigation.subTag.length > 0) {
                    $navigation.append($('<'+sets.navigation.subTag+'></'+sets.navigation.subTag+'>').append($previousLink));
                } else {
                    $navigation.append($previousLink);
                }

                /* Next Link */
                var $nextLink = null;
                if (sets.navigation.next.link == null) {
                    $nextLink = $('<a href="#"></a>');
                    sets.navigation.next.link = $nextLink;
                } else {
                    $nextLink = sets.navigation.next.link;
                }
                $nextLink.addClass(sets.navigation.next.cssClass);
                $nextLink.data('slider', $this);
                $nextLink.css('display', null);
                $this.data('next', $($liList[1]));
                $nextLink.html(sets.navigation.next.text)
                    .click(function () {
                        $(this).data('slider').jbhSlider('next', true);
                        return false;
                    });

                if (sets.navigation.subTag != null && sets.navigation.subTag.length > 0) {
                    $navigation.append($('<'+sets.navigation.subTag+'></'+sets.navigation.subTag+'>').append($nextLink));
                } else {
                    $navigation.append($nextLink);
                }

                if (sets.navigation.active) {
                    var $navContainer = $this;
                    if (sets.navigation.container != null) {
                        $navContainer = $(sets.navigation.container);
                        if (sets.navigation.position == 'before') {
                            $navContainer.prepend($navigation);
                        } else {
                            $navContainer.append($navigation);
                        }
                    } else {
                        if (sets.navigation.position == 'before') {
                            $navContainer.before($navigation);
                        } else {
                            $navContainer.after($navigation);
                        }
                    }
                }

                return $this;
            },

            _slide: function (to, transition, killTimer) {
                if (to == null) {
                    return this;
                }
                var $this = this;
                var sets = $this.data('settings');
                if (killTimer == true && sets.transition.actionStopTimer) {
                    this.jbhSlider('_killTimer');
                }
                if (sets.data.inTransitionTo.data('pos') != to.data('pos')) {
                    sets.data.inTransitionTo = to;
                    $this.jbhSlider('_stopAnim', to);
                    sets.transition.before($this, to, function () {
                        transition($this, $this.data('current'), to);
                        $this.jbhSlider('_updatePagination', to);
                        $this.jbhSlider('_updateNavigation', to);
                    });
                }
                return this;
            },

            slide: function (num) {
                var slide = null;
                for (i = 0; i < this.data('count'); i++) {
                    var page = this.data('settings').pagination.elements[i];
                    if (page.data('to').data('pos') == num) {
                        slide = page.data('to');
                        break;
                    }
                }
                this.jbhSlider('_slide', slide, this.data('settings').data.transition, true);
            },

            _transitionSuccess: function (from, to) {
                this.data('settings').transition.success(this, to);
                this.data('current', to);
                if (this.data('timer') != null) {
                    this.jbhSlider('_updateRepetitions', from, to);
                }
            },

            _updateRepetitions : function(from , to) {
                var liList = this.data('settings').data.liList;
                if((to.data('pos') == 1) && (from.data('pos') == liList.length)) {
                    this.data('repetitions', this.data('repetitions') + 1);
                    if(this.data('repetitions') == this.data('settings').transition.repeat) {
                        this.jbhSlider('_killTimer');
                    }
                }
            },

            _stopAnim: function (to) {
                var $this = this;
                var sets = $this.data('settings');
                switch (sets.transition.type) {

                    case 'horizontal-left':
                    case 'horizontal-right':
                        sets.data.ul.stop(true);
                    break;

                    case 'fade':
                    default:
                        var $liList = sets.data.liList;
                        $liList.stop(true);
                        for (i = 0; i < $this.data('count'); i++) {
                            if (i != to.data('pos')-1) {
                                    var $li = $($liList[i]);
                                    if ($li.css('opacity') != 0 && $li.data('pos') != $this.data('current').data('pos')) {
                                        $li.animate({
                                            opacity: 0
                                        }, sets.transition.duration);
                                    }
                            }
                        }
                    break;
                }
            },

            _updatePagination: function ($to) {
                var sets = this.data('settings');
                if (sets.pagination.last.data('to') != $to) {
                    sets.pagination.last.removeClass(sets.pagination.currentCssClass);
                    if (sets.pagination.subTag != null && sets.pagination.subTag.length > 0) {
                        sets.pagination.last.parent().removeClass(sets.pagination.currentCssClass);
                    }
                    sets.pagination.last = $to.data('pager').addClass(sets.pagination.currentCssClass);
                    if (sets.pagination.subTag != null && sets.pagination.subTag.length > 0) {
                        $to.data('pager').parent().addClass(sets.pagination.currentCssClass);
                    }
                }
            },

            _loadTimer: function () {
                var $this = this;
                function timer () {
                    if ($this.data('mouseIn') != true) {
                        $this.jbhSlider('next');
                    }
                    $this.data('timer', setTimeout(timer, $this.data('settings').transition.timer));
                }
                this.data('timer', setTimeout(timer, this.data('settings').transition.timer));
            },

            _killTimer: function () {
                if (this.data('timer') != null) {
                    clearTimeout(this.data('timer'));
                    this.data('timer', null);
                }
            },

            next: function (killTimer) {
                this.jbhSlider('_slide', this.data('next'), this.data('settings').data.transition, killTimer);
            },

            previous: function (killTimer) {
                this.jbhSlider('_slide', this.data('previous'), this.data('settings').data.transition, killTimer);
            },

            _updateNavigation: function ($to) {
                var $this = $(this);
                var sets = $this.data('settings');
                var active = sets.navigation.active;
                var count = $this.data('count');

                if (active) {
                    var $nextLink = sets.navigation.next.link;
                }
                if ($to.data('pos') == count) {
                    if (sets.navigation.loop == true) {
                        if (active) {
                            $nextLink.css('visibility', 'visible');
                        }
                        $this.data('next', $(sets.data.liList[0]));
                    } else {
                        if (active) {
                            $nextLink.css('visibility', 'hidden');
                        }
                        $this.data('next', null);
                    }
                } else {
                    if (active) {
                        $nextLink.css('visibility', 'visible');
                    }
                    $this.data('next', $(sets.data.liList[$to.data('pos')]));
                }

                if (active) {
                    var $prevLink = sets.navigation.previous.link;
                }
                if ($to.data('pos') == 1) {
                    if (sets.navigation.loop == true) {
                        if (active) {
                            $prevLink.css('visibility', 'visible');
                        }
                        $this.data('previous', $(sets.data.liList[count-1]));
                    } else {
                        if (active) {
                            $prevLink.css('visibility', 'hidden');
                        }
                        $this.data('previous', null);
                    }
                } else {
                    if (active) {
                        $prevLink.css('visibility', 'visible');
                    }
                    $this.data('previous', $(sets.data.liList[$to.data('pos') - 2]));
                }
            }
        };


        $.fn.jbhSlider = function(method) {
            if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object' || !method) {
                return methods.init.apply(this, arguments);
            }
            $.error('Method ' +  method + ' does not exist on jQuery.tooltip');
            return this;
        };

    })(jQuery);
}
