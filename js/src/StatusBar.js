var Event, Factory, Hideable, NativeModules, OneOf, STYLE_MAP, StatusBar, assertType, ref;

ref = require("type-utils"), OneOf = ref.OneOf, assertType = ref.assertType;

NativeModules = require("component").NativeModules;

Hideable = require("hideable");

Factory = require("factory");

Event = require("event");

STYLE_MAP = {
  white: "light-content",
  black: "default"
};

module.exports = StatusBar = Factory("StatusBar", {
  singleton: true,
  Style: OneOf(["white", "black"]),
  Animation: OneOf(["none", "fade", "slide"]),
  customValues: {
    isBusy: {
      value: false,
      reactive: true,
      didSet: function(isBusy, wasBusy) {
        if (isBusy === wasBusy) {
          return;
        }
        return NativeModules.StatusBarManager.setNetworkActivityIndicatorVisible(isBusy);
      }
    },
    style: {
      get: function() {
        return this._style;
      }
    },
    render: {
      lazy: function() {
        return require("./StatusBarView");
      }
    }
  },
  initFrozenValues: function() {
    return {
      height: 21,
      onPress: Event(),
      _states: []
    };
  },
  initReactiveValues: function() {
    return {
      _style: null
    };
  },
  init: function() {
    return Hideable(this, {
      isHiding: null,
      show: function(animation, onEnd) {
        if (onEnd == null) {
          onEnd = animation;
          animation = null;
        }
        if (animation == null) {
          animation = "none";
        }
        assertType(animation, StatusBar.Animation);
        NativeModules.StatusBarManager.setHidden(false, animation);
        onEnd();
      },
      hide: function(animation, onEnd) {
        if (onEnd == null) {
          onEnd = animation;
          animation = null;
        }
        if (animation == null) {
          animation = "none";
        }
        assertType(animation, StatusBar.Animation);
        NativeModules.StatusBarManager.setHidden(true, animation);
        onEnd();
      }
    });
  },
  setHiding: function(isHiding, animation) {
    if (state.isHiding) {
      return this.hide(state.animation);
    } else {
      return this.show(state.animation);
    }
  },
  setStyle: function(style, animated) {
    assertType(style, StatusBar.Style);
    if (style === this._style) {
      return;
    }
    NativeModules.StatusBarManager.setStyle(STYLE_MAP[style], animated);
    this._style = style;
  },
  pushState: function(state) {
    if (state == null) {
      state = {};
    }
    validateTypes(state, {
      isHiding: [Boolean, Void],
      animation: [StatusBar.Animation, Void],
      style: [StatusBar.Style, Void],
      animatedStyle: [Boolean, Void]
    });
    if (state.isHiding == null) {
      state.isHiding = this.isHiding;
    }
    if (state.animation == null) {
      state.animation = "none";
    }
    if (state.isHiding !== this.isHiding) {
      this.setHiding(state.isHiding, state.animation);
    }
    if (state.style == null) {
      state.style = this._style;
    }
    if (state.animatedStyle == null) {
      state.animatedStyle = false;
    }
    if (state.style !== this._style) {
      this.setStyle(state.style, state.animatedStyle);
    }
    this._states.push(state);
  },
  popState: function() {
    this._states.pop();
    return this.pushState(this._states.pop());
  }
});

//# sourceMappingURL=../../map/src/StatusBar.map
