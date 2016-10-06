
{StatusBarManager} = require "NativeModules"
{Type} = require "modx"

assertType = require "assertType"
Hideable = require "hideable"
OneOf = require "OneOf"
Event = require "Event"

BarAnimation = OneOf "StatusBar_Animation", "none fade slide"
BarStyle = OneOf "StatusBar_Style", "white black"

nativeStyles =
  white: "light-content"
  black: "default"

type = Type "StatusBar"

type.defineReactiveValues

  _style: null

type.defineFrozenValues ->

  height: 21

  onPress: Event()

  _states: []

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
    assertType isHiding, Boolean
    assertType animation, BarAnimation.Maybe
    if isHiding then @hide animation
    else @show animation

  setStyle: (style, animated = no) ->
    assertType style, BarStyle
    return if style is @_style
    StatusBarManager.setStyle nativeStyles[style], animated
    @_style = style
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

hideableMixin = Hideable

  isHiding: null

  show: (animation, onEnd) ->
    unless onEnd?
      onEnd = animation
      animation = null
    animation ?= "none"
    assertType animation, BarAnimation
    StatusBarManager.setHidden no, animation
    onEnd()
    return

  hide: (animation, onEnd) ->
    unless onEnd?
      onEnd = animation
      animation = null
    animation ?= "none"
    assertType animation, BarAnimation
    StatusBarManager.setHidden yes, animation
    onEnd()
    return

type.addMixins [
  hideableMixin
]

#
# Rendering
#

type.defineProps
  style: BarStyle.isRequired

type.defineNativeValues

  pointerEvents: ->
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
