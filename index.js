var doc = require('global/document');
var react = require('react');
var dom = require('react-dom');
var unified = require('unified');
var english = require('retext-english');
var pos = require('retext-pos');
var has = require('has');
var map = require('./map');

var h = react.createElement;
var processor = unified().use(english).use(pos);
var color = colors(Object.keys(map).length);

dom.render(
  h(react.createClass({
    getInitialState: getInitialState,
    onChange: onChange,
    onScroll: onScroll,
    render: render
  })),
  doc.getElementById('root')
);

function getInitialState() {
  return {text: doc.getElementsByTagName('template')[0].innerHTML};
}

function onChange(ev) {
  this.setState({text: ev.target.value});
}

function onScroll(ev) {
  this.refs.draw.scrollTop = ev.target.scrollTop;
}

function render() {
  var text = this.state.text;
  var tree = processor.run(processor.parse(text));
  var available = keys();
  var key = 0;

  return h('div', {className: 'editor'}, [
    h('div', {key: 'draw', className: 'draw', ref: 'draw'}, pad(all(tree))),
    h('textarea', {key: 'area', value: text, onChange: this.onChange, onScroll: this.onScroll}),
    h('div', {key: 'credits', className: 'credits'}, available)
  ]);

  function all(node) {
    var children = node.children;
    var length = children.length;
    var index = -1;
    var results = [];

    while (++index < length) {
      results = results.concat(one(children[index]));
    }

    return results;
  }

  function one(node) {
    var result = 'value' in node ? node.value : all(node);
    var styles = style(node);

    if (styles) {
      key++;
      result = h('span', {key: 's-' + key, style: styles}, result);
    }

    return result;
  }

  /* Trailing white-space in a `textarea` is shown, but not in a `div`
   * with `white-space: pre-wrap`. Add a `br` to make the last newline
   * explicit. */
  function pad(nodes) {
    var tail = nodes[nodes.length - 1];

    if (typeof tail === 'string' && tail.charAt(tail.length - 1) === '\n') {
      nodes.push(h('br', {key: 'break'}));
    }

    return nodes;
  }

  function keys() {
    var nodes = [];

    Object.keys(map).forEach(function (key) {
      nodes.push(
        h('span', {key: 'c-' + key, style: {backgroundColor: color(key)}}, map[key])
      );

      nodes.push(' ');
    });

    nodes.pop();

    return nodes;
  }
}

function style(node) {
  var tag = node.data && node.data.partOfSpeech;

  if (tag && has(map, tag)) {
    return {backgroundColor: color(tag)};
  }
}

function colors(max) {
  var cached = {};
  var count = 0;
  var step = 360 / max;

  color.cached = cached;

  return color;

  function color(id) {
    var value;

    if (has(cached, id)) {
      return cached[id];
    }

    cached[id] = value = 'hsl(' + (count * step) + ', 96%, 90%)';
    count++;

    return value;
  }
}
