
{ OneOf
  assertType } = require "type-utils"

{ NativeModules } = require "component"

Hideable = require "hideable"
Factory = require "factory"
Event = require "event"

STYLE_MAP =
  white: "light-content"
  black: "default"

module.exports =
StatusBar = Factory "StatusBar",

  singleton: yes

  Style: OneOf [ "white", "black" ]

  Animation: OneOf [ "none", "fade", "slide" ]

  customValues:

    isBusy:
      value: no
      reactive: yes
      didSet: (isBusy, wasBusy) ->
        return if isBusy is wasBusy
        NativeModules.StatusBarManager.setNetworkActivityIndicatorVisible isBusy

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
        assertType animation, StatusBar.Animation
        NativeModules.StatusBarManager.setHidden no, animation
        onEnd()
        return

      hide: (animation, onEnd) ->
        unless onEnd?
          onEnd = animation
          animation = null
        animation ?= "none"
        assertType animation, StatusBar.Animation
        NativeModules.StatusBarManager.setHidden yes, animation
        onEnd()
        return

  setHiding: (isHiding, animation) ->
    if state.isHiding then @hide state.animation
    else @show state.animation

  setStyle: (style, animated) ->
    assertType style, StatusBar.Style
    return if style is @_style
    NativeModules.StatusBarManager.setStyle STYLE_MAP[style], animated
    @_style = style
    return

  pushState: (state = {}) ->

    validateTypes state,
      isHiding: [ Boolean, Void ]
      animation: [ StatusBar.Animation, Void ]
      style: [ StatusBar.Style, Void ]
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
