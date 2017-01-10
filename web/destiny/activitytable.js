const PLACE_NAMES = [
    [/Archon's Forge/, 'Earth'],
    [/Dreadnaught/, 'Saturn'],
    [/Plaguelands/, 'Earth'],
    [/Venus/, 'Venus'],
];


function guessPlaceName(s) {
  if (!s)
    return;
  for (let [regex, placeName] of PLACE_NAMES)
    if (s.match(regex))
      return placeName;
}


class ActivityTable extends React.Component {
  render() {
    const base = this.props.base;
    const containers = Object.values(base.state.containers).filter(({character, advisors}) => character && advisors);
    const activities = {};

    for (let {advisors, character} of containers) {
      for (let activity of advisors.activities) {
        var title = ` ${activity.activityTypeName}: ${activity.activityDef.activityName}`;
        if (activity.modifiers.length)
          title = `${title} (${activity.modifiers.map(mod => mod.displayName).sort().join(', ')})`;
        const longTitle = [activity.activityDef.activityName]
            .concat(activity.skulls.map(skull => `${skull.displayName}: ${skull.description}`))
            .join('\n');
        if (!activities[title])
          activities[title] = {
              characterSteps: {},
              longTitle,
              placeTitle: activity.placeDef.placeName,
          };
        activities[title].characterSteps[character.characterId] = activity.steps;
      }

      for (let bounty of advisors.bounties) {
        var title = `Bounty (${bounty.activityTypeName.replace(/ Bounty$/, '')}): ${bounty.questDef.itemName}`;
        const longTitle = [bounty.questDef.itemName];
        if (bounty.questHash != bounty.stepHash) {
          title = `${title}: ${bounty.stepDef.itemName}`;
          longTitle.push(bounty.stepDef.itemName);
        }
        longTitle.push('');
        longTitle.push(bounty.stepDef.itemDescription);
        const placeNames = bounty.stepObjectives.map(step => guessPlaceName(step.objectiveDef.displayDescription));
        placeNames.push(guessPlaceName(bounty.stepDef.itemDescription));
        if (!activities[title])
          activities[title] = {
              characterSteps: {},
              longTitle: longTitle.join('\n'),
              placeTitle: Array.from(new Set(placeNames.filter(placeName => placeName))).sort().join(', '),
          };
        activities[title].characterSteps[character.characterId] = bounty.stepObjectives.map(step => ({
            completionValue: step.objectiveDef.completionValue,
            displayName: step.objectiveDef.displayDescription,
            isComplete: step.isComplete,
            progress: step.progress,
        }));
      }

      for (let quest of advisors.quests) {
        const title = `${quest.activityTypeName}: ${quest.questDef.itemName}: ${quest.stepDef.itemName}`;
        const longTitle = [quest.questDef.itemName, quest.stepDef.itemName, '', quest.stepDef.itemDescription]
            .join('\n');
        const destinations = quest.stepObjectives.map(step => step.destinationDef).filter(dest => dest);
        const places = destinations.map(dest => bungie.DEFS.places[dest.placeHash]).filter(place => place);
        const placeNames = places.map(place => place.placeName);
        if (!activities[title])
          activities[title] = {
              characterSteps: {},
              longTitle,
              placeTitle: Array.from(new Set(placeNames)).sort().join(', '),
          };
        activities[title].characterSteps[character.characterId] = quest.stepObjectives.map(step => ({
            completionValue: step.objectiveDef.completionValue,
            displayName: step.objectiveDef.displayDescription,
            isComplete: step.isComplete,
            progress: step.progress,
        }));
      }

      for (let book of advisors.recordBooks) {
        for (let record of Object.values(book.records)) {
          if (record.statusName == 'Redeemed')
            continue;
          var title = `${book.activityTypeName}: ${book.bookDef.displayName}: ${record.recordDef.displayName}`;
          if (record.scramble)
            title = `${title} (Scrambled)`;
          if (record.statusName != 'Incomplete')
            title = `${title} (${record.statusName})`;
          const longTitle = [`${book.bookDef.displayName} (${book.bookDef.displayDescription})`,
                             record.recordDef.displayName, '', record.recordDef.description]
              .join('\n');
          const destinations = record.objectives.map(step => step.destinationDef).filter(dest => dest);
          const places = destinations.map(dest => bungie.DEFS.places[dest.placeHash]).filter(place => place);
          const placeNames = places.map(place => place.placeName);
          if (!activities[title])
            activities[title] = {
                characterSteps: {},
                longTitle,
                placeTitle: Array.from(new Set(placeNames)).sort().join(', '),
            };
          activities[title].characterSteps[character.characterId] = record.objectives.map(step => ({
              completionValue: step.objectiveDef.completionValue,
              displayName: step.objectiveDef.displayDescription,
              isComplete: step.isComplete,
              progress: step.progress,
          }));
        }
      }
    }

    const activityList = Object.entries(activities).sort();
    const stepLengths = new Set();
    for (let [title, {characterSteps}] of activityList)
      stepLengths.add(Object.values(characterSteps)[0].length);
    var colSpan = 1;
    for (let stepLength of Array.from(stepLengths).sort().reverse())
      if (colSpan % stepLength)
        colSpan *= stepLength;

    return <table>
      <thead>
        <tr>
          <td/>
          {Object.values(base.state.containers).map(({character}) => character && <td colSpan={colSpan}>
            <Placard background={character.backgroundPath}
                     icon={character.emblemPath}
                     neutral={true}
                     right={character.level}
                     text={`${character.race.raceName} ${character.gender.genderName}`}
                     title={character.characterClass.className}/>
          </td>)}
        </tr>
      </thead>
      <tbody>
        {activityList.map(([title, {characterSteps, longTitle, placeTitle}]) => <tr>
          <td title={longTitle}>
            {title.replace(/ [(].*,.*[)]/, ' (...)')}
            {placeTitle && <div style={{float: 'right'}}>&nbsp;{placeTitle}</div>}
          </td>
          {Object.values(base.state.containers).map(({character}) => {
            if (!character)
              return;
            const steps = characterSteps[character.characterId];
            if (!steps)
              return <td colSpan={colSpan}/>;
            const stepSpan = colSpan / steps.length;
            return steps.map(step => {
              const check = step.isComplete ? '\u2611' : step.completionValue > 1 ? `${step.progress} / ${step.completionValue}` : '\u2610';
              return <th colSpan={stepSpan}
                         style={{backgroundColor: step.isComplete ? 'grey' : 'lightblue'}}
                         title={step.displayName}>{check}</th>;
            });
          })}
        </tr>)}
      </tbody>
    </table>;
  }
}
