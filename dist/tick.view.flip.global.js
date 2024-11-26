/* eslint-disable */

/*
 * @pqina/flip v1.8.4 - A Beautifully Animated Flip Clock
 * Copyright (c) 2024 PQINA - https://pqina.nl/flip/
 */
(function(root, undefined) {
	'use strict';

	// only create tick extensions queue if not already available
	if (!root.Tick) {
		root.Tick = [];
	}

	// add this extension
	root.Tick.push(['view', 'flip', (function() {
	if (!module) {
		var module = {};
	}
'use strict';

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

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

	var FlipCard = function () {
		function FlipCard() {
			classCallCheck(this, FlipCard);


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

		createClass(FlipCard, [{
			key: 'rotate',
			value: function rotate(degrees) {
				this._front.style.transform = 'rotateX(' + degrees + 'deg)';
				this._back.style.transform = 'rotateX(' + (-180 + degrees) + 'deg)';
			}
		}, {
			key: 'root',
			get: function get$$1() {
				return this._root;
			}
		}, {
			key: 'front',
			set: function set$$1(value) {
				this._frontValue = value;
				this._textFront.textContent = value;
			},
			get: function get$$1() {
				return this._frontValue;
			}
		}, {
			key: 'back',
			set: function set$$1(value) {
				this._backValue = value;
				this._textBack.textContent = value;
			},
			get: function get$$1() {
				return this._backValue;
			}
		}, {
			key: 'highlightBack',
			set: function set$$1(value) {
				this._highlightBack.style.opacity = value;
			}
		}, {
			key: 'shadowBack',
			set: function set$$1(value) {
				this._shadowBack.style.opacity = value;
			}
		}, {
			key: 'shadowFront',
			set: function set$$1(value) {
				this._shadowFront.style.opacity = value;
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
}())]);

}(window));