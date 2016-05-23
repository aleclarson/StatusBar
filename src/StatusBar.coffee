
{ OneOf
  assertType } = require "type-utils"

{ StatusBarManager } = require "NativeModules"

Hideable = require "hideable"
Factory = require "factory"
Event = require "event"

Style = OneOf "StatusBar_Style", [
  "white"
  "black"
]

Style.toNative =
  white: "light-content"
  black: "default"

Animation = OneOf "StatusBar_Animation", [
  "none"
  "fade"
  "slide"
]

module.exports =
StatusBar = Factory "StatusBar", {

  singleton: yes

  Style

  Animation

  customValues:

    isBusy:
      value: no
      reactive: yes
      didSet: (isBusy, wasBusy) ->
        return if isBusy is wasBusy
        StatusBarManager.setNetworkActivityIndicatorVisible isBusy

    style: get: ->
      @_style

    render: lazy: ->
      require "./StatusBarView"

  initFrozenValues: ->

    height: 21

    onPress: Event()

    _states: []

  initReactiveValues: ->

    _style: null

  init: ->

    Hideable this,

      isHiding: null

      show: (animation, onEnd) ->
        unless onEnd?
          onEnd = animation
          animation = null
        animation ?= "none"
        assertType animation, Animation
        StatusBarManager.setHidden no, animation
        onEnd()
        return

      hide: (animation, onEnd) ->
        unless onEnd?
          onEnd = animation
          animation = null
        animation ?= "none"
        assertType animation, Animation
        StatusBarManager.setHidden yes, animation
        onEnd()
        return

  setHiding: (isHiding, animation) ->
    if state.isHiding then @hide state.animation
    else @show state.animation

  setStyle: (style, animated = no) ->
    assertType style, Style
    return if style is @_style
    StatusBarManager.setStyle Style.toNative[style], animated
    @_style = style
    return

  pushState: (state = {}) ->

    validateTypes state,
      isHiding: [ Boolean, Void ]
      animation: [ Animation, Void ]
      style: [ Style, Void ]
      animatedStyle: [ Boolean, Void ]

    state.isHiding ?= @isHiding
    state.animation ?= "none"

    if state.isHiding isnt @isHiding
      @setHiding state.isHiding, state.animation

    state.style ?= @_style
    state.animatedStyle ?= no

    if state.style isnt @_style
      @setStyle state.style, state.animatedStyle

    @_states.push state
    return

  popState: ->

    # Remove current state.
    @_states.pop()

    @pushState @_states.pop()
}
