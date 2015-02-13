/**
 * @fileoverview http://www.opengamingfoundation.org/srd/srdbasics.rtf
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

nmlorg.require('nmlorg.rpg.srd.abilityscores');
nmlorg.require('nmlorg.rpg.srd.basics');

/** @namespace */
nmlorg.rpg.character = nmlorg.rpg.character || {};


nmlorg.rpg.character.Character = function(dice) {
  this.dice = dice || new nmlorg.rpg.srd.basics.Dice();
  this.stats = new nmlorg.rpg.srd.abilityscores.AbilityScores();
};


nmlorg.rpg.character.Character.prototype.reroll = function() {
  this.stats.reroll(this.dice);
};


nmlorg.rpg.character.Character.prototype.toDiv = function() {
  var div = document.createElement('div');

  div.className = 'character';
  div.appendChild(this.statsToDiv());
  return div;
};


nmlorg.rpg.character.Character.prototype.statsToDiv = function() {
  var div = document.createElement('div');

  div.className = 'stats';
  div.appendChild(this.statToDiv('strength'));
  div.appendChild(this.statToDiv('dexterity'));
  div.appendChild(this.statToDiv('constitution'));
  div.appendChild(this.statToDiv('intelligence'));
  div.appendChild(this.statToDiv('wisdom'));
  div.appendChild(this.statToDiv('charisma'));
  return div;
};


nmlorg.rpg.character.Character.prototype.statToDiv = function(name) {
  var div = document.createElement('div');
  var score = this.stats[name];
  var modifier = this.stats[name + 'Modifier'];

  div.className = 'stat';

  var span = document.createElement('span');
  span.className = 'stat-code';
  span.textContent = name.substr(0, 3).toUpperCase();
  div.appendChild(span);

  var span = document.createElement('span');
  span.className = 'stat-name';
  span.textContent = name.toUpperCase();
  div.appendChild(span);

  var span = document.createElement('span');
  span.className = 'stat-modifier';
  span.textContent = (modifier < 0 ? '' : '+') + modifier;
  div.appendChild(span);

  var span = document.createElement('span');
  span.className = 'stat-score';
  span.textContent = score;
  div.appendChild(span);

  return div;
};

})();
