var Animation, Event, Hideable, OneOf, StatusBarManager, Style, Type, assertType, type;

StatusBarManager = require("NativeModules").StatusBarManager;

Type = require("modx").Type;

assertType = require("assertType");

Hideable = require("hideable");

OneOf = require("OneOf");

Event = require("Event");

Style = OneOf("StatusBar_Style", ["white", "black"]);

Style.toNative = {
  white: "light-content",
  black: "default"
};

Animation = OneOf("StatusBar_Animation", ["none", "fade", "slide"]);

type = Type("StatusBar");

type.defineReactiveValues({
  _style: null
});

type.defineFrozenValues({
  height: 21,
  onPress: function() {
    return Event();
  },
  _states: function() {
    return [];
  }
});

type.initInstance(function() {
  var hide, show;
  show = function(animation, onEnd) {
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
  };
  hide = function(animation, onEnd) {
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
  };
  return Hideable(this, {
    isHiding: null,
    show: show,
    hide: hide
  });
});

type.defineProperties({
  isBusy: {
    value: false,
    reactive: true,
    didSet: function(isBusy, wasBusy) {
      if (isBusy === wasBusy) {
        return;
      }
      return StatusBarManager.setNetworkActivityIndicatorVisible(isBusy);
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

type.propTypes = {
  style: Style
};

type.defineNativeValues({
  pointerEvents: function() {
    return (function(_this) {
      return function() {
        if (_this.isHiding) {
          return "none";
        } else {
          return "auto";
        }
      };
    })(this);
  }
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
