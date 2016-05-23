var Component, StatusBar, Style, Touchable, View, ref, screenWidth, styleDiffer;

ref = require("component"), Component = ref.Component, View = ref.View, Touchable = ref.Touchable, Style = ref.Style;

screenWidth = require("device").screenWidth;

styleDiffer = require("styleDiffer");

StatusBar = require("./StatusBar");

module.exports = Component("StatusBarView", {
  propTypes: {
    style: Style
  },
  initNativeValues: function() {
    return {
      pointerEvents: function() {
        if (StatusBar.isHiding) {
          return "none";
        } else {
          return "auto";
        }
      }
    };
  },
  shouldComponentUpdate: function(props) {
    return styleDiffer(props.style, this.props.style);
  },
  render: function() {
    var bar;
    bar = View({
      pointerEvents: this.pointerEvents,
      style: [
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: StatusBar.height,
          backgroundColor: "clear"
        }, this.props.style
      ]
    });
    return Touchable({
      onPress: function() {
        return StatusBar.onPress.emit();
      },
      children: bar
    });
  }
});

//# sourceMappingURL=../../map/src/StatusBarView.map
