'use strict';

var visit = require('unist-util-visit');
var toString = require('nlcst-to-string');
var NlpjsTFr = require('nlp-js-tools-french');

var tagDict = {
  ADJ: 'JJ',
  ADV: 'RB',
  ART: 'ART',
  INT: 'UH',
  KON: 'CC',
  NAM: 'NNP',
  NOM: 'NN',
  NUM: 'CD',
  PRO: 'PRP',
  'PRO:dem': 'WDT',
  'PRO:ind': 'PRP',
  'PRO:per': 'PRP',
  'PRO:pos': 'PP$',
  'PRO:int': 'WP$',
  'PRO:rel': 'WP$',
  PRP: 'IN',
  'PRP:det': 'IN',
  SYM: 'SYM',
  VER: 'VB'
};

module.exports = pos;

function pos() {
  return transformer;
}

function transformer(tree) {
  var queue = [];

  visit(tree, 'WordNode', visitor);
  /* Gather a parent if not already gathered. */
  function visitor(node, index, parent) {
    if (parent && queue.indexOf(parent) === -1) {
      queue.push(parent);
      one(parent);
    }
  }

  /* Patch all words in `parent`. */
  function one(node) {
    var children = node.children;
    var length = children.length;
    var index = -1;
    var values = [];
    var words = [];
    var child;
    var tagger;
    var tags;

    while (++index < length) {
      child = children[index];

      if (child.type === 'WordNode') {
        values.push(toString(child));
        words.push(child);
      }
    }

    tagger = new NlpjsTFr(values.join(' '));
    tags = tagger.posTagger();
    index = -1;
    length = tags.length;

    while (++index < length) {
      var enTag = tagDict[tags[index].pos[0]];
      enTag = enTag || 'UNK';
      patch(words[index], enTag);
    }
  }

  /* Patch a `partOfSpeech` property on `node`s. */
  function patch(node, tag) {
    var data = node.data || (node.data = {});
    data.partOfSpeech = tag;
  }
}
