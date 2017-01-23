var BarAnimation, BarStyle, Hideable, NativeModules, OneOf, ReactType, assertType, nativeStyles, type;

NativeModules = require("NativeModules");

assertType = require("assertType");

ReactType = require("modx/lib/Type");

Hideable = require("Hideable");

OneOf = require("OneOf");

BarAnimation = OneOf("StatusBar_Animation", "none fade slide");

BarStyle = OneOf("StatusBar_Style", "white black");

nativeStyles = {
  white: "light-content",
  black: "default"
};

type = ReactType("StatusBar");

type.defineReactiveValues({
  _style: null
});

type.defineFrozenValues(function() {
  return {
    height: 21,
    _states: []
  };
});

type.defineProperties({
  isBusy: {
    value: false,
    reactive: true,
    didSet: function(isBusy, wasBusy) {
      if (isBusy === wasBusy) {
        return;
      }
      return NativeModules.StatusBarManager.setNetworkActivityIndicatorVisible(isBusy);
    }
  }
});

type.defineReactions({
  pointerEvents: function() {
    if (this.isHiding) {
      return "none";
    } else {
      return "auto";
    }
  }
});

type.defineGetters({
  style: function() {
    return this._style;
  }
});

type.defineMethods({
  setHiding: function(isHiding, animation) {
    assertType(isHiding, Boolean);
    assertType(animation, BarAnimation.Maybe);
    if (isHiding) {
      return this.hide(animation);
    } else {
      return this.show(animation);
    }
  },
  setStyle: function(style, animated) {
    if (animated == null) {
      animated = false;
    }
    assertType(style, BarStyle);
    if (style !== this._style) {
      this._style = style;
      NativeModules.StatusBarManager.setStyle(nativeStyles[style], animated);
    }
  },
  pushState: function(state) {
    if (state == null) {
      state = {};
    }
    validateTypes(state, {
      isHiding: Boolean.Maybe,
      animation: BarAnimation.Maybe,
      style: BarStyle.Maybe,
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

type.addMixin(Hideable, {
  isHiding: null,
  show: function(animation, onEnd) {
    if (onEnd == null) {
      onEnd = animation;
      animation = null;
    }
    if (animation == null) {
      animation = "none";
    }
    assertType(animation, BarAnimation);
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
    assertType(animation, BarAnimation);
    NativeModules.StatusBarManager.setHidden(true, animation);
    onEnd();
  }
});

type.defineProps({
  style: BarStyle.isRequired
});

type.render(function() {
  return View({
    pointerEvents: this.pointerEvents,
    style: [this.styles.container(), this.props.style]
  });
});

type.defineStyles({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: function() {
      return this.height;
    },
    backgroundColor: "transparent"
  }
});

module.exports = type.construct();

//# sourceMappingURL=map/StatusBar.map
