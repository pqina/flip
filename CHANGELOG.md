# Changelog

**1.8.4** | 26-11-2024

-   Update Tick

**1.8.3** | 17-11-2023

-   Remove stray console log statement

**1.8.2** | 16-11-2023

-   Update Tick

**1.8.1** | 31-08-2023

-   Update Tick

**1.8.0** | 02-11-2020

-   Add credits property.

**1.7.2** | 25-06-2019

-   Fix issue with JavaScript based templates not rendering correctly.

**1.7.1** | 31-12-2018

-   Fix problem where setting format to ['d', 'm'] would throw an error.

**1.7.0** | 14-05-2018

-   Performance improvements
-   Add `ascii` and `char` transforms, updated billboard template.

**1.5.2** | 22-02-2018

-   Fix problem with rendering on Edge 16.

**1.5.0** | 02-08-2017

-   Add auto fit to container option, add `fit` to the `data-layout` attribute to enable.
-   Add chained scheduling, a counter can now contain multiple scheduled moments separated by commas.
-   Improved module version so it's easier to use in React.
-   Improved visual quality now no longer renders transparent gap between top and bottom cards.

**1.4.2** | 12-07-2017

-   Improved rendering quality in newer versions of Firefox and Safari.

**1.4.1** | 03-07-2017

-   Fixed problem where jQuery API would not create ticker.

**1.4.0** | 08-06-2017

-   Improved rendering performance, elements out of view are no longer redrawn.
-   Add `setConstant` and `setPreset` methods which can be used in conjunction with the `preset` transform to create transform presets.
-   Fixed problem where programmatic creation of view did not work.

**1.3.4** | 12-04-2017

-   Fixed problem where removing repeater elements did not work.

**1.3.3** | 23-03-2017

-   Improved performance of Flip counters.

**1.3.2** | 23-02-2017

-   Improved `arrive`, `spring`, `step` and `tween` transforms handling of string input.
-   Fixed `destroy` method destroying a little bit too much property.
-   Fixed `boom` playing a sound when value did not change.
-   Fixed `boom` returning the wrong element definition ('audio' instead of 'boom').

**1.3.1** | 21-02-2017

-   Fixed problem where `Tick.create` would throw an error if no element and no options were supplied.

**1.3.0** | 20-02-2017

-   Release of Flip.

**1.2.0** | 15-02-2017

-   Add cancel method to internal animation function.
-   Add value and tween transform functions.
-   Add `data-value` attribute to default text view.
-   Improved step, spring and arrive transform functions.
-   Improved internal counter setup.

**1.1.0** | 31-01-2017

-   Improved internal duration code.
-   Fixed timer reset method, did not reset.
-   Added "ms" as milliseconds Time Unit.
-   Added duration transform.

**1.0.0** | 26-01-2017

-   Initial release of core.
