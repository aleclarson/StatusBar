
NativeModules = require "NativeModules"
assertType = require "assertType"
ReactType = require "modx/lib/Type"
Hideable = require "Hideable"
OneOf = require "OneOf"

BarAnimation = OneOf "StatusBar_Animation", "none fade slide"
BarStyle = OneOf "StatusBar_Style", "white black"

nativeStyles =
  white: "light-content"
  black: "default"

type = ReactType "StatusBar"

type.defineReactiveValues

  _style: null

type.defineFrozenValues ->

  height: 21

  _states: []

type.defineProperties

  isBusy:
    value: no
    reactive: yes
    didSet: (isBusy, wasBusy) ->
      return if isBusy is wasBusy
      NativeModules.StatusBarManager
        .setNetworkActivityIndicatorVisible isBusy

type.defineReactions

  pointerEvents: ->
    if @isHiding then "none" else "auto"

#
# Prototype
#

type.defineGetters

  style: -> @_style

type.defineMethods

  setHiding: (isHiding, animation) ->
    assertType isHiding, Boolean
    assertType animation, BarAnimation.Maybe
    if isHiding then @hide animation
    else @show animation

  setStyle: (style, animated = no) ->
    assertType style, BarStyle
    if style isnt @_style
      @_style = style
      NativeModules.StatusBarManager
        .setStyle nativeStyles[style], animated
    return

  pushState: (state = {}) ->

    validateTypes state,
      isHiding: Boolean.Maybe
      animation: BarAnimation.Maybe
      style: BarStyle.Maybe
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

type.addMixin Hideable,

  isHiding: null

  show: (animation, onEnd) ->
    unless onEnd?
      onEnd = animation
      animation = null
    animation ?= "none"
    assertType animation, BarAnimation
    NativeModules.StatusBarManager
      .setHidden no, animation
    onEnd()
    return

  hide: (animation, onEnd) ->
    unless onEnd?
      onEnd = animation
      animation = null
    animation ?= "none"
    assertType animation, BarAnimation
    NativeModules.StatusBarManager
      .setHidden yes, animation
    onEnd()
    return

#
# Rendering
#

type.defineProps
  style: BarStyle.isRequired

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
