/* eslint-disable */

/*
 * @pqina/flip v1.8.4 - A Beautifully Animated Flip Clock
 * Copyright (c) 2025 PQINA - https://pqina.nl/flip/
 */
module.exports = (function() {
	if (!module) {
		var module = {};
	}
'use strict';

function _classCallCheck(a, n) {
  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}
function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), Object.defineProperty(e, "prototype", {
    writable: false
  }), e;
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r);
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (String )(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}

var index = (function (_ref) {
  var DOM = _ref.DOM;
    _ref.Animation.animate;
    var Extension = _ref.Extension,
    performance = _ref.Date.performance,
    _ref$View = _ref.View,
    rooter = _ref$View.rooter,
    destroyer = _ref$View.destroyer,
    drawer = _ref$View.drawer,
    updater = _ref$View.updater,
    styler = _ref$View.styler;
  var easeOutCubic = Extension.getExtension(Extension.Type.EASING_FUNCTION, 'ease-out-cubic');
  var easeOutSine = Extension.getExtension(Extension.Type.EASING_FUNCTION, 'ease-out-sine');
  var draw = function draw(state) {
    // create cards if not already created
    if (state.isInitialValue()) {
      // clear current content
      state.root.textContent = '';

      // value spacer
      state.spacer = DOM.create('span', 'tick-flip-spacer');
      state.root.appendChild(state.spacer);

      // shaders
      var shadowTop = DOM.create('span', 'tick-flip-shadow-top tick-flip-shadow tick-flip-front');
      var shadowBottom = DOM.create('span', 'tick-flip-shadow-bottom tick-flip-shadow tick-flip-back');
      state.root.appendChild(shadowTop);
      state.root.appendChild(shadowBottom);

      // create shadow element
      state.shadowCard = DOM.create('span', 'tick-flip-card-shadow');
      state.root.appendChild(state.shadowCard);
    }

    // set spacer value
    state.spacer.textContent = state.value;

    // don't animate when invisible to the user
    if (!state.isInitialValue() && !DOM.visible(state.root)) {
      state.cards.forEach(function (card) {
        card.back = state.value;
        card.front = state.value;
      });
      return;
    }

    // get previous card
    var turningCard = state.cards[state.cards.length - 1];
    if (turningCard) {
      turningCard.waiting = false;
      turningCard.offset = performance();
      turningCard.back = state.value;
    }

    // create a quick flipped initial card and then exit
    if (state.isInitialValue()) {
      // create flipped state (bottom)
      var initialBottomCard = new FlipCard();
      initialBottomCard.back = state.value;
      initialBottomCard.offset = null;
      initialBottomCard.progress = 1;
      state.root.insertBefore(initialBottomCard.root, state.root.firstChild);
      state.cards.push(initialBottomCard);
    }

    // create a new card
    var topCard = new FlipCard();
    topCard.offset = null;
    topCard.progress = 0;
    topCard.visual_progress = 0;
    topCard.waiting = true;
    topCard.front = state.value;
    topCard.rotate(0);
    // topCard.rotate(-1); // prevents slight anti-aliasing issues on Safari / Firefox

    state.root.insertBefore(topCard.root, state.root.firstChild);
    state.cards.push(topCard);
    if (!state.animating) {
      state.animating = true;
      var ease = Extension.getExtension(Extension.Type.EASING_FUNCTION, state.style.flipEasing);
      var _tick = function tick() {
        // find cards that require animation
        var cardsToAnimate = state.cards.filter(function (card) {
          return !card.done && !card.waiting;
        });
        if (cardsToAnimate.length === 0) {
          state.animating = false;
          return;
        }

        // calculate card progress
        cardsToAnimate.forEach(function (card) {
          if (card.offset !== null) {
            card.progress = (performance() - card.offset) / state.style.flipDuration;
          }
          if (card.progress >= 1) {
            card.progress = 1;
            card.done = true;
          }
          card.visual_progress = ease(card.progress);
        });

        // sort
        var cardDistance = 0.01;
        cardsToAnimate.reverse().forEach(function (card, index) {
          var previousCard = cardsToAnimate[index - 1];
          if (previousCard && card.visual_progress <= previousCard.visual_progress) {
            card.visual_progress = previousCard.visual_progress + cardDistance;
          }
        });
        cardsToAnimate.reverse();

        // update shadows
        state.cards.forEach(function (card, index) {
          // set default shadow and highlight levels based on visual animation progress
          var shadowFrontProgress = 1 - Math.abs(card.visual_progress - .5) * 2;
          var highlightBackProgress = 1 - (card.visual_progress - .5) / .5;
          card.shadowFront = shadowFrontProgress;
          card.highlightBack = highlightBackProgress;

          // recalculate levels based on other card positions
          var cardAbove = state.cards[index + 1];

          // if there's a card above me, my back is visible, and the above card is falling
          if (cardAbove && card.visual_progress > .5 && card.visual_progress > 0) {
            card.shadowBack = easeOutCubic(cardAbove.visual_progress);
          }
        });

        // update and animate cards
        cardsToAnimate.forEach(function (card, index) {
          var p = card.visual_progress;
          if (p > .5 && !card.done) {
            card.root.style.zIndex = 10 + index;
          } else {
            card.root.style.removeProperty('z-index');
          }
          card.rotate(p * -180);
        });

        // handle card stack shadow
        var shadowProgress = 0;
        var dist = 1;
        cardsToAnimate.forEach(function (card) {
          var d = Math.abs(card.visual_progress - .5);
          if (d < dist) {
            dist = d;
            shadowProgress = card.visual_progress;
          }
        });
        var s = shadowProgress < .5 ? easeOutSine(shadowProgress / .5) : easeOutSine((1 - shadowProgress) / .5);
        state.shadowCard.style.opacity = s;
        DOM.transform(state.shadowCard, 'scaleY', s);

        // clean up cards that finished animating
        state.cards.filter(function (card) {
          return card.done;
        }) // gather all done cards
        .slice(0, -1) // don't delete the last one
        .forEach(function (card) {
          // let's delete them

          // remove predecessor from cards array
          state.cards = state.cards.filter(function (c) {
            return c !== card;
          });

          // remove predecessor from the DOM
          if (card.root.parentNode) {
            state.root.removeChild(card.root);
          }
        });
        requestAnimationFrame(_tick);
      };
      _tick();
    }
  };
  var FlipCard = /*#__PURE__*/function () {
    function FlipCard() {
      _classCallCheck(this, FlipCard);
      this._root = DOM.create('span', 'tick-flip-card');

      // card front
      var front = DOM.create('span', 'tick-flip-panel-front tick-flip-front tick-flip-panel');
      var textFront = DOM.create('span', 'tick-flip-panel-front-text');
      var textFrontWrapper = DOM.create('span', 'tick-flip-panel-text-wrapper');
      textFront.appendChild(textFrontWrapper);
      var shadowFront = DOM.create('span', 'tick-flip-panel-front-shadow');
      front.appendChild(textFront);
      front.appendChild(shadowFront);
      var back = DOM.create('span', 'tick-flip-panel-back tick-flip-back tick-flip-panel');
      var textBack = DOM.create('span', 'tick-flip-panel-back-text');
      var textBackWrapper = DOM.create('span', 'tick-flip-panel-text-wrapper');
      textBack.appendChild(textBackWrapper);
      var highlightBack = DOM.create('span', 'tick-flip-panel-back-highlight');
      var shadowBack = DOM.create('span', 'tick-flip-panel-back-shadow');
      back.appendChild(textBack);
      back.appendChild(highlightBack);
      back.appendChild(shadowBack);

      // create card
      this._root.appendChild(front);
      this._root.appendChild(back);

      // references for animation
      this._front = front;
      this._back = back;
      this._shadowFront = shadowFront;
      this._shadowBack = shadowBack;
      this._highlightBack = highlightBack;

      // back
      this._textBack = textBackWrapper;
      this._textFront = textFrontWrapper;

      // front and back values
      this._frontValue = null;
      this._backValue = null;
    }
    return _createClass(FlipCard, [{
      key: "root",
      get: function get() {
        return this._root;
      }
    }, {
      key: "front",
      get: function get() {
        return this._frontValue;
      },
      set: function set(value) {
        this._frontValue = value;
        this._textFront.textContent = value;
      }
    }, {
      key: "back",
      get: function get() {
        return this._backValue;
      },
      set: function set(value) {
        this._backValue = value;
        this._textBack.textContent = value;
      }
    }, {
      key: "highlightBack",
      set: function set(value) {
        this._highlightBack.style.opacity = value;
      }
    }, {
      key: "shadowBack",
      set: function set(value) {
        this._shadowBack.style.opacity = value;
      }
    }, {
      key: "shadowFront",
      set: function set(value) {
        this._shadowFront.style.opacity = value;
      }
    }, {
      key: "rotate",
      value: function rotate(degrees) {
        this._front.style.transform = "rotateX(".concat(degrees, "deg)");
        this._back.style.transform = "rotateX(".concat(-180 + degrees, "deg)");
      }
    }]);
  }();
  /**
   * Expose
   */
  return function (root) {
    var state = {
      cards: [],
      lastCard: null,
      initialCard: null,
      shadowAbove: null,
      shadowBelow: null,
      shadowCard: null,
      currentValue: null,
      lastValue: null,
      front: null,
      back: null
    };
    return Object.assign({}, rooter(state, root, 'flip'), updater(state), styler(state, {
      flipDuration: 800,
      flipEasing: 'ease-out-bounce'
    }), drawer(state, draw), destroyer(state));
  };
});

module.exports = index;

	module.exports.identifier = {
		name:'flip',
		type:'view'
	};
    return module.exports;
}());