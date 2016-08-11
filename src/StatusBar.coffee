
{StatusBarManager} = require "NativeModules"
{Type} = require "modx"

assertType = require "assertType"
Hideable = require "hideable"
OneOf = require "OneOf"
Event = require "Event"

Style = OneOf "StatusBar_Style", [ "white", "black" ]
Style.toNative = { white: "light-content", black: "default" }

Animation = OneOf "StatusBar_Animation", [ "none", "fade", "slide" ]

type = Type "StatusBar"

type.defineReactiveValues

  _style: null

type.defineFrozenValues

  height: 21

  onPress: -> Event()

  _states: -> []

type.initInstance ->

  show = (animation, onEnd) ->
    unless onEnd?
      onEnd = animation
      animation = null
    animation ?= "none"
    assertType animation, Animation
    StatusBarManager.setHidden no, animation
    onEnd()
    return

  hide = (animation, onEnd) ->
    unless onEnd?
      onEnd = animation
      animation = null
    animation ?= "none"
    assertType animation, Animation
    StatusBarManager.setHidden yes, animation
    onEnd()
    return

  Hideable this, {
    isHiding: null
    show
    hide
  }

type.defineProperties

  isBusy:
    value: no
    reactive: yes
    didSet: (isBusy, wasBusy) ->
      return if isBusy is wasBusy
      StatusBarManager.setNetworkActivityIndicatorVisible isBusy

type.defineGetters

  style: -> @_style

type.defineMethods

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

#
# Rendering
#

type.propTypes =
  style: Style

type.defineNativeValues

  pointerEvents: -> =>
    if @isHiding then "none" else "auto"

type.render ->
  return View {
    @pointerEvents
    style: [ @styles.container(), @props.style ]
  }

type.defineStyles

  container:
    position: "absolute"
    top: 0
    left: 0
    right: 0
    height: -> @height
    backgroundColor: "transparent"

module.exports = type.construct()
