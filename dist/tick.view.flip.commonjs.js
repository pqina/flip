/* eslint-disable */

/*
 * @pqina/flip v1.8.0 - A Beautifully Animated Flip Clock
 * Copyright (c) 2023 PQINA - https://pqina.nl/flip/
 */
module.exports = (function() {
	if (!module) {
		var module = {};
	}
'use strict';

function _AsyncGenerator(gen) {
  var front, back;
  function resume(key, arg) {
    try {
      var result = gen[key](arg),
        value = result.value,
        overloaded = value instanceof _OverloadYield;
      Promise.resolve(overloaded ? value.v : value).then(function (arg) {
        if (overloaded) {
          var nextKey = "return" === key ? "return" : "next";
          if (!value.k || arg.done) return resume(nextKey, arg);
          arg = gen[nextKey](arg).value;
        }
        settle(result.done ? "return" : "normal", arg);
      }, function (err) {
        resume("throw", err);
      });
    } catch (err) {
      settle("throw", err);
    }
  }
  function settle(type, value) {
    switch (type) {
      case "return":
        front.resolve({
          value: value,
          done: !0
        });
        break;
      case "throw":
        front.reject(value);
        break;
      default:
        front.resolve({
          value: value,
          done: !1
        });
    }
    (front = front.next) ? resume(front.key, front.arg) : back = null;
  }
  this._invoke = function (key, arg) {
    return new Promise(function (resolve, reject) {
      var request = {
        key: key,
        arg: arg,
        resolve: resolve,
        reject: reject,
        next: null
      };
      back ? back = back.next = request : (front = back = request, resume(key, arg));
    });
  }, "function" != typeof gen.return && (this.return = void 0);
}
_AsyncGenerator.prototype["function" == typeof Symbol && Symbol.asyncIterator || "@@asyncIterator"] = function () {
  return this;
}, _AsyncGenerator.prototype.next = function (arg) {
  return this._invoke("next", arg);
}, _AsyncGenerator.prototype.throw = function (arg) {
  return this._invoke("throw", arg);
}, _AsyncGenerator.prototype.return = function (arg) {
  return this._invoke("return", arg);
};
function _OverloadYield(value, kind) {
  this.v = value, this.k = kind;
}
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}
function _toPrimitive(input, hint) {
  if (typeof input !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return typeof key === "symbol" ? key : String(key);
}

var index = (function (_ref) {
  var DOM = _ref.DOM,
    animate = _ref.Animation.animate,
    Extension = _ref.Extension,
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
      var tick = function tick() {
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
        requestAnimationFrame(tick);
      };
      tick();
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
    _createClass(FlipCard, [{
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
    return FlipCard;
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