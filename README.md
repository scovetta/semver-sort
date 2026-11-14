# Semver Sort

This is a simple web form, available at [https://scovetta.github.io/semver-sort/](https://scovetta.github.io/semver-sort/) for sorting semver strings.

All content is processed client-side using the [semver](https://npmjs.com/package/semver) npm package. Enable **Force/Coerce?** to sort incomplete or otherwise coercible versions, such as `0.2`, while keeping their original text in the output. Versions that cannot be parsed remain at the end and are reported as errors.
