'use strict';

/*
 * Dependencies.
 */

var Retext = require('wooorm/retext@0.5.0');
var pos = require('wooorm/retext-pos@0.2.0');
var dom = require('wooorm/retext-dom@0.3.1');
var visit = require('wooorm/retext-visit@0.2.5');

var map = require('./map.json');

/*
 * Retext.
 */

var retext = new Retext()
    .use(visit)
    .use(dom)
    .use(pos);

/*
 * DOM elements.
 */

var $document = document.documentElement;
var $input = document.getElementsByTagName('textarea')[0];
var $output = document.getElementsByTagName('div')[0];
var $tag = document.getElementsByTagName('select')[0];

/*
 * Handlers
 */

var tree;

function oninputchange() {
    if (tree) {
        tree.toDOMNode().parentNode.removeChild(tree.toDOMNode());
    }

    retext.parse($input.value, function (err, root) {
        if (err) {
          throw err;
        }

        tree = root;

        tree.visit(function (node) {
            var tag;

            if (!node.DOMTagName || !node.data.partOfSpeech) {
                return;
            }

            tag = node.data.partOfSpeech;

            node.toDOMNode().setAttribute('title', map[tag] || tag);
            node.toDOMNode().setAttribute('data-tag', tag);
        });

        $output.appendChild(tree.toDOMNode());
    });
}

function onfocuschange() {
    $document.className = $tag.options[$tag.selectedIndex].value;
}


$input.addEventListener('input', oninputchange);
$tag.addEventListener('change', onfocuschange);

oninputchange();
onfocuschange();
