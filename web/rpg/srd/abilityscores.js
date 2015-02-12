/**
 * @fileoverview http://www.opengamingfoundation.org/srd/srdabilityscores.rtf
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

nmlorg.require('nmlorg.rpg.srd.basics');

/** @namespace */
nmlorg.rpg.srd.abilityscores = nmlorg.rpg.srd.abilityscores || {};


nmlorg.rpg.srd.abilityscores.ABILITIES = {
    'strength': 0, 'dexterity': 0, 'constitution': 0, 'intelligence': 0, 'wisdom': 0, 'charisma': 0};


nmlorg.rpg.srd.abilityscores.AbilityScores = function() {};


for (var k in nmlorg.rpg.srd.abilityscores.ABILITIES) (function() {
  var ability = k;

  nmlorg.rpg.srd.abilityscores.AbilityScores.prototype[ability] = 0;

  // Each ability will have a modifier. The modifier can be calculated using this formula:
  //   (ability/2) -5 [round result down]
  // The modifier is the number you add to or subtract from the die roll when your character tries
  // to do something related to that ability. A positive modifier is called a bonus, and a negative
  // modifier is called a penalty. 
  Object.defineProperty(nmlorg.rpg.srd.abilityscores.AbilityScores.prototype, ability + 'Modifier',
                        {'configurable': false, 'enumerable': true,
                         'get': function() { return Math.floor(this[ability] / 2) - 5; }});
})();


Object.defineProperty(nmlorg.rpg.srd.abilityscores.AbilityScores.prototype, 'attackModifier',
                      {'configurable': false, 'enumerable': true, 'get': function() {
  // A creature with no Strength score can't exert force, usually because it has no physical body or
  // because it doesn't move. The creature automatically fails Strength checks. If the creature can
  // attack, it applies its Dexterity modifier to its base attack instead of a Strength modifier.
  return this.strength > 0 ? this.strengthModifier : this.dexterityModifier;
}});


nmlorg.rpg.srd.abilityscores.AbilityScores.prototype.reroll = function(dice) {
  if (!dice)
    dice = new nmlorg.rpg.srd.basics.Dice();

  for (var ability in nmlorg.rpg.srd.abilityscores.ABILITIES)
    this[ability] = dice.roll('3d6');
};

})();
