(function() {
  var vexFactory;

  vexFactory = function($) {
    var animationEndSupport, vex;
    animationEndSupport = false;
    $(function() {
      var s;
      s = (document.body || document.documentElement).style;
      animationEndSupport = s.animation !== void 0 || s.WebkitAnimation !== void 0 || s.MozAnimation !== void 0 || s.MsAnimation !== void 0 || s.OAnimation !== void 0;
      return $(window).bind('keyup.vex', function(event) {
        if (event.keyCode === 27) {
          return vex.closeByEscape();
        }
      });
    });
    return vex = {
      globalID: 1,
      animationEndEvent: 'animationend webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend',
      baseClassNames: {
        vex: 'vex',
        wrapper: 'vex-wrapper',
        header: 'vex-header',
        footer: 'vex-footer',
        body: 'vex-body',
        overlay: 'vex-overlay',
        close: 'vex-close',
        closing: 'vex-closing',
        open: 'vex-open'
      },
      defaultOptions: {
        content: '',
        header: '',
        footer: '',
        showCloseButton: true,
        escapeButtonCloses: true,
        overlayClosesOnClick: true,
        appendLocation: 'body',
        className: '',
        css: {},
        overlayClassName: '',
        overlayCSS: {},
        wrapperClassName: '',
        wrapperCSS: {},
        closeClassName: '',
        closeCSS: {}
      },
      open: function(options) {
        options = $.extend({}, vex.defaultOptions, options);
        options.id = vex.globalID;
        vex.globalID += 1;
        options.$vex = $('<div>').addClass(vex.baseClassNames.vex).addClass(options.className).css(options.css).data({
          vex: options
        });
        options.$vexOverlay = $('<div>').addClass(vex.baseClassNames.overlay).addClass(options.overlayClassName).css(options.overlayCSS).data({
          vex: options
        });
        if (options.overlayClosesOnClick) {
          options.$vexOverlay.bind('click.vex', function(e) {
            if (e.target !== this) {
              return;
            }
            return vex.close($(this).data().vex.id);
          });
        }
        options.$vex.append(options.$vexOverlay);
        if (options.header) {
          options.$vexHeader = $('<div>').addClass(vex.baseClassNames.header).append(options.header);
        } else {
          options.$vex.addClass("_no-header");
        }
        if (options.footer) {
          options.$vexFooter = $('<div>').addClass(vex.baseClassNames.footer).append(options.footer);
        } else {
          options.$vex.addClass("_no-footer");
        }
        options.$vexWrapper = $('<div>').addClass(vex.baseClassNames.wrapper).addClass(options.wrapperClassName).css(options.wrapperCSS).append(options.$vexHeader).append($('<div>').addClass(vex.baseClassNames.body).append(options.content)).append(options.$vexFooter).data({
          vex: options
        });
        options.$vex.append(options.$vexWrapper);
        if (options.showCloseButton) {
          options.$closeButton = $('<div>').addClass(vex.baseClassNames.close).addClass(options.closeClassName).css(options.closeCSS).data({
            vex: options
          }).bind('click.vex', function() {
            return vex.close($(this).data().vex.id);
          });
          options.$vexWrapper.append(options.$closeButton);
        }
        $(options.appendLocation).append(options.$vex);
        vex.setupBodyClassName(options.$vex);
        if (options.afterOpen) {
          options.afterOpen(options.$vexWrapper, options);
        }
        setTimeout((function() {
          return options.$vexWrapper.trigger('vexOpen', options);
        }), 0);
        return options.$vexWrapper;
      },
      getSelectorFromBaseClass: function(baseClass) {
        return "." + (baseClass.split(' ').join('.'));
      },
      getAllVexes: function() {
        return $("." + vex.baseClassNames.vex + ":not(\"." + vex.baseClassNames.closing + "\") " + (vex.getSelectorFromBaseClass(vex.baseClassNames.wrapper)));
      },
      getVexByID: function(id) {
        return vex.getAllVexes().filter(function() {
          return $(this).data().vex.id === id;
        });
      },
      close: function(id) {
        var $lastVex;
        if (!id) {
          $lastVex = vex.getAllVexes().last();
          if (!$lastVex.length) {
            return false;
          }
          id = $lastVex.data().vex.id;
        }
        return vex.closeByID(id);
      },
      closeAll: function() {
        var ids;
        ids = vex.getAllVexes().map(function() {
          return $(this).data().vex.id;
        }).toArray();
        if (!(ids != null ? ids.length : void 0)) {
          return false;
        }
        $.each(ids.reverse(), function(index, id) {
          return vex.closeByID(id);
        });
        return true;
      },
      closeByID: function(id) {
        var $vex, $vexWrapper, beforeClose, close, options;
        $vexWrapper = vex.getVexByID(id);
        if (!$vexWrapper.length) {
          return;
        }
        $vex = $vexWrapper.data().vex.$vex;
        options = $.extend({}, $vexWrapper.data().vex);
        beforeClose = function() {
          if (options.beforeClose) {
            return options.beforeClose($vexWrapper, options);
          }
        };
        close = function() {
          $vexWrapper.trigger('vexClose', options);
          $vex.remove();
          $('body').trigger('vexAfterClose', options);
          if (options.afterClose) {
            return options.afterClose($vexWrapper, options);
          }
        };
        if (animationEndSupport) {
          if (beforeClose() !== false) {
            $vex.unbind(vex.animationEndEvent).bind(vex.animationEndEvent, function() {
              return close();
            }).addClass(vex.baseClassNames.closing);
          }
        } else {
          if (beforeClose() !== false) {
            close();
          }
        }
        return true;
      },
      closeByEscape: function() {
        var $lastVex, id, ids;
        ids = vex.getAllVexes().map(function() {
          return $(this).data().vex.id;
        }).toArray();
        if (!(ids != null ? ids.length : void 0)) {
          return false;
        }
        id = Math.max.apply(Math, ids);
        $lastVex = vex.getVexByID(id);
        if ($lastVex.data().vex.escapeButtonCloses !== true) {
          return false;
        }
        return vex.closeByID(id);
      },
      setupBodyClassName: function($vex) {
        return $('body').bind('vexOpen.vex', function() {
          return $('body').addClass(vex.baseClassNames.open);
        }).bind('vexAfterClose.vex', function() {
          if (!vex.getAllVexes().length) {
            return $('body').removeClass(vex.baseClassNames.open);
          }
        });
      },
      hideLoading: function() {
        return $('.vex-loading-spinner').remove();
      },
      showLoading: function() {
        vex.hideLoading();
        return $('body').append("<div class=\"vex-loading-spinner " + vex.defaultOptions.className + "\"></div>");
      }
    };
  };

  if (typeof define === 'function' && define.amd) {
    define(['jquery'], vexFactory);
  } else if (typeof exports === 'object') {
    module.exports = vexFactory(require('jquery'));
  } else {
    window.vex = vexFactory(jQuery);
  }

}).call(this);
