
{ Component, View, Touchable, Style } = require "component"

{ screenWidth } = require "device"

styleDiffer = require "styleDiffer"

StatusBar = require "./StatusBar"

module.exports = Component "StatusBarView",

  propTypes:
    style: Style

  initNativeValues: ->

    pointerEvents: ->
      if StatusBar.isHiding then "none" else "auto"

  shouldComponentUpdate: (props) ->
    styleDiffer props.style, @props.style

  render: ->

    bar = View {
      @pointerEvents
      style: [
        position: "absolute"
        top: 0
        left: 0
        right: 0
        height: StatusBar.height
        backgroundColor: "clear"
        @props.style
      ]
    }

    return Touchable
      onPress: -> StatusBar.onPress.emit()
      children: bar
