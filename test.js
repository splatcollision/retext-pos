'use strict';

var test = require('tape');
var retext = require('retext');
var visit = require('unist-util-visit');
var pos = require('./');

var sentence = 'Elle semble se nourrir généralement de plancton, et de hotdog du vendeur du coin.';
var tags = [
  'PRP',
  'VB',
  'PRP',
  'VB',
  'UNK',
  'UNK',
  'NN',
  'UNK',
  'NN',
  'UNK',
  'VB',
  'NN',
  'JJ',
  'NN'
];

test('pos()', function (t) {
  var proc = retext().use(pos);
  var tree = proc.run(proc.parse(sentence));
  var index = -1;
  tree.then(function (tr) {
    visit(tr, 'WordNode', function (node) {
      t.equal(node.data.partOfSpeech, tags[++index]);
    });
    t.end();
  });
});
