export default ({
	DOM,
	Animation: { animate },
	Extension,
	Date: { performance },
	View: { rooter, destroyer, drawer, updater, styler } }) => {

	const easeOutCubic = Extension.getExtension(Extension.Type.EASING_FUNCTION, 'ease-out-cubic');
	const easeOutSine = Extension.getExtension(Extension.Type.EASING_FUNCTION, 'ease-out-sine');

	const draw = (state) => {

		// create cards if not already created
		if (state.isInitialValue()) {

			// clear current content
			state.root.textContent = '';

			// value spacer
			state.spacer = DOM.create('span','tick-flip-spacer');
			state.root.appendChild(state.spacer);

			// shaders
			const shadowTop = DOM.create('span','tick-flip-shadow-top tick-flip-shadow tick-flip-front');
			const shadowBottom = DOM.create('span','tick-flip-shadow-bottom tick-flip-shadow tick-flip-back');
			state.root.appendChild(shadowTop);
			state.root.appendChild(shadowBottom);

			// create shadow element
			state.shadowCard = DOM.create('span','tick-flip-card-shadow');
			state.root.appendChild(state.shadowCard);
		}

		// set spacer value
		state.spacer.textContent = state.value;

		// don't animate when invisible to the user
		if (!state.isInitialValue() && !DOM.visible(state.root)) {
			state.cards.forEach(card => {
				card.back = state.value;
				card.front = state.value;
			});
			return;
		}

		// get previous card
		const turningCard = state.cards[state.cards.length - 1];
		if (turningCard) {
			turningCard.waiting = false;
			turningCard.offset = performance();
			turningCard.back = state.value;
		}

		// create a quick flipped initial card and then exit
		if (state.isInitialValue()) {

			// create flipped state (bottom)
			const initialBottomCard = new FlipCard();
			initialBottomCard.back = state.value;

			initialBottomCard.offset = null;
			initialBottomCard.progress = 1;

			state.root.insertBefore(initialBottomCard.root, state.root.firstChild);
			state.cards.push(initialBottomCard);
		}

		// create a new card
		const topCard = new FlipCard();

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

			const ease = Extension.getExtension(Extension.Type.EASING_FUNCTION, state.style.flipEasing);

			const tick = () => {

				// find cards that require animation
				const cardsToAnimate = state.cards.filter(card => !card.done && !card.waiting);

				if (cardsToAnimate.length === 0) {
					state.animating = false;
					return;
				}

				// calculate card progress
				cardsToAnimate.forEach(card => {

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
				let cardDistance = 0.01;
				cardsToAnimate.reverse().forEach((card, index) => {

					const previousCard = cardsToAnimate[index - 1];

					if (previousCard && card.visual_progress <= previousCard.visual_progress) {
						card.visual_progress = previousCard.visual_progress + cardDistance;
					}

				});

				cardsToAnimate.reverse();

				// update shadows
				state.cards.forEach((card, index) => {

					// set default shadow and highlight levels based on visual animation progress
					const shadowFrontProgress = 1 - (Math.abs(card.visual_progress - .5) * 2);
					const highlightBackProgress = 1 - ((card.visual_progress - .5) / .5);

					card.shadowFront = shadowFrontProgress;
					card.highlightBack = highlightBackProgress;

					// recalculate levels based on other card positions
					const cardAbove = state.cards[index + 1];

					// if there's a card above me, my back is visible, and the above card is falling
					if (cardAbove && card.visual_progress > .5 && card.visual_progress > 0) {
						card.shadowBack = easeOutCubic(cardAbove.visual_progress);
					}

				});

				// update and animate cards
				cardsToAnimate.forEach((card, index) => {

					const p = card.visual_progress;

					if (p > .5 && !card.done) {
						card.root.style.zIndex = 10 + index;
					}
					else {
						card.root.style.removeProperty('z-index');
					}

					card.rotate(p * -180);
				});

				// handle card stack shadow
				let shadowProgress = 0;
				let dist = 1;
				cardsToAnimate.forEach(card => {
					let d = Math.abs(card.visual_progress - .5);
					if (d < dist) {
						dist = d;
						shadowProgress = card.visual_progress;
					}
				});

				let s = shadowProgress < .5 ? easeOutSine(shadowProgress / .5) : easeOutSine((1 - shadowProgress) / .5);
				state.shadowCard.style.opacity = s;
				DOM.transform(state.shadowCard, 'scaleY', s);

				// clean up cards that finished animating
				state.cards
					.filter(card => card.done) // gather all done cards
					.slice(0, -1) // don't delete the last one
					.forEach(card => { // let's delete them

						// remove predecessor from cards array
						state.cards = state.cards.filter(c => c !== card);

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




	class FlipCard {
		constructor() {

			this._root = DOM.create('span', 'tick-flip-card');

			// card front
			const front = DOM.create('span', 'tick-flip-panel-front tick-flip-front tick-flip-panel');
			const textFront = DOM.create('span', 'tick-flip-panel-front-text');
			const textFrontWrapper = DOM.create('span','tick-flip-panel-text-wrapper');
			textFront.appendChild(textFrontWrapper);
			const shadowFront = DOM.create('span', 'tick-flip-panel-front-shadow');
			front.appendChild(textFront);
			front.appendChild(shadowFront);

			const back = DOM.create('span', 'tick-flip-panel-back tick-flip-back tick-flip-panel');
			const textBack = DOM.create('span', 'tick-flip-panel-back-text');
			const textBackWrapper = DOM.create('span','tick-flip-panel-text-wrapper');
			textBack.appendChild(textBackWrapper);
			const highlightBack = DOM.create('span', 'tick-flip-panel-back-highlight');
			const shadowBack = DOM.create('span', 'tick-flip-panel-back-shadow');
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

		get root() {
			return this._root;
		}

		set front(value) {
			this._frontValue = value;
			this._textFront.textContent = value;
		}

		set back(value) {
			this._backValue = value;
			this._textBack.textContent = value;
		}

		get front() {
			return this._frontValue;
		}

		get back() {
			return this._backValue;
		}

		set highlightBack(value) {
			this._highlightBack.style.opacity = value;
		}

		set shadowBack(value) {
			this._shadowBack.style.opacity = value;
		}

		set shadowFront(value) {
			this._shadowFront.style.opacity = value;
		}

		rotate(degrees) {
			this._front.style.transform = `rotateX(${ degrees }deg)`;
			this._back.style.transform = `rotateX(${ -180 + degrees }deg)`;
		}

	}

	/**
	 * Expose
	 */
	return (root) => {

		const state = {

			cards:[],
			lastCard:null,
			initialCard:null,

			shadowAbove:null,
			shadowBelow:null,
			shadowCard:null,

			currentValue:null,
			lastValue:null,

			front:null,
			back:null
		};


		return Object.assign(
			{},
			rooter(state, root, 'flip'),
			updater(state),
			styler(state, {
				flipDuration: 800,
				flipEasing: 'ease-out-bounce'
			}),
			drawer(state, draw),
			destroyer(state)
		);

	};

};