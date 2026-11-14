const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const semver = require('semver');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const script = html.match(/<script type="text\/javascript">([\s\S]*?)<\/script>/)[1];

function sort(input, coerce, direction) {
    let versions = input;
    let errors = '';
    let handler;
    const button = { data: () => direction };
    const elements = {
        'button.sort_btn': { on: (_, fn) => { handler = fn; } },
        '#versionListTextarea': { val: function(value) {
            if (arguments.length) versions = value;
            return versions;
        } },
        '#errors': { val: function(value) {
            if (arguments.length) errors = value;
            return errors;
        } },
        '#coerce': { is: () => coerce }
    };
    vm.runInNewContext(script, {
        window: { semver },
        $: selector => selector === button ? button : elements[selector]
    });
    handler.call(button);
    return { versions, errors };
}

test('coercion sorts original values in both directions and keeps equal keys', () => {
    const input = '1.0, 0.2, 0.2.0, 0.1, 2';
    assert.equal(sort(input, true, 'asc').versions, '0.1\n0.2\n0.2.0\n1.0\n2');
    assert.equal(sort(input, true, 'desc').versions, '2\n1.0\n0.2\n0.2.0\n0.1');
});

test('coercion preserves valid prerelease ordering and uncoercible inputs', () => {
    const result = sort('1.0.0, 1.0.0-beta, unknown, 0.2', true, 'asc');
    assert.equal(result.versions, '0.2\n1.0.0-beta\n1.0.0\nunknown');
    assert.equal(result.errors, 'Invalid semver version: [unknown], will leave at the end.\n');
});

test('strict mode leaves invalid versions at the end and reports them', () => {
    const result = sort('1.0.0\n0.2\n0.1.0\nunknown', false, 'asc');
    assert.equal(result.versions, '0.1.0\n1.0.0\n0.2\nunknown');
    assert.equal(result.errors, 'Invalid semver version: [0.2], will leave at the end.\nInvalid semver version: [unknown], will leave at the end.\n');
});
