var Animation, Event, Factory, Hideable, OneOf, StatusBar, StatusBarManager, Style, assertType, ref;

ref = require("type-utils"), OneOf = ref.OneOf, assertType = ref.assertType;

StatusBarManager = require("NativeModules").StatusBarManager;

Hideable = require("hideable");

Factory = require("factory");

Event = require("event");

Style = OneOf("StatusBar_Style", ["white", "black"]);

Style.toNative = {
  white: "light-content",
  black: "default"
};

Animation = OneOf("StatusBar_Animation", ["none", "fade", "slide"]);

module.exports = StatusBar = Factory("StatusBar", {
  singleton: true,
  Style: Style,
  Animation: Animation,
  customValues: {
    isBusy: {
      value: false,
      reactive: true,
      didSet: function(isBusy, wasBusy) {
        if (isBusy === wasBusy) {
          return;
        }
        return StatusBarManager.setNetworkActivityIndicatorVisible(isBusy);
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
        assertType(animation, Animation);
        StatusBarManager.setHidden(false, animation);
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
        assertType(animation, Animation);
        StatusBarManager.setHidden(true, animation);
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
    if (animated == null) {
      animated = false;
    }
    assertType(style, Style);
    if (style === this._style) {
      return;
    }
    StatusBarManager.setStyle(Style.toNative[style], animated);
    this._style = style;
  },
  pushState: function(state) {
    if (state == null) {
      state = {};
    }
    validateTypes(state, {
      isHiding: [Boolean, Void],
      animation: [Animation, Void],
      style: [Style, Void],
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
