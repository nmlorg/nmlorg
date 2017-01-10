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
        var title = ` ${activity.activityPeriod} ${activity.activityTypeName}: ${activity.activityDef.activityName}`;
        if (activity.modifiers.length)
          title = `${title} (${activity.modifiers.map(mod => mod.displayName).sort().join(', ')})`;
        const longTitle = [activity.activityDef.activityName, '',
                           activity.activityDef.activityDescription];
        if (activity.modifiers.length)
          longTitle.push('', 'Modifiers:',
                         ...activity.modifiers.map(skull => `\u2022 ${skull.displayName}: ${skull.description}`));
        if (activity.challenges.length)
          longTitle.push('', 'Active challenges:',
                         ...activity.challenges.map(skull => `\u2022 ${skull.displayName}: ${skull.description}`));
        if (!activities[title])
          activities[title] = {
              characterSteps: {},
              longTitle: longTitle.join('\n'),
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

      for (let checklist of advisors.checklists) {
        for (let entry of checklist.entries) {
          if (entry.state)
            continue;
          const title = `Checklist: ${checklist.checklistName}: ${entry.name}`;
          const longTitle = [checklist.checklistName, entry.name];
          if (!activities[title])
            activities[title] = {
                characterSteps: {},
                link: 'http://www.ign.com/wikis/destiny/Calcified_Fragments#' + entry.name.split(':', 2)[0],
                longTitle: longTitle.join('\n'),
            };
          activities[title].characterSteps[character.characterId] = [{displayName: entry.name, isComplete: entry.state}];
        }
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
          {containers.map(({character}) => <td colSpan={colSpan}>
            <Placard background={character.backgroundPath}
                     icon={character.emblemPath}
                     neutral={true}
                     right={character.level}
                     text={`${character.race.raceName} ${character.gender.genderName}`}
                     title={character.characterClass.className}/>
          </td>)}
        </tr>
      </thead>
      {activityList.map(([title, {characterSteps, link, longTitle, placeTitle}]) =>
        <ActivityRow characterSteps={characterSteps} colSpan={colSpan} containers={containers}
                     link={link} longTitle={longTitle} placeTitle={placeTitle} title={title}/>
      )}
    </table>;
  }
}


class ActivityRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: false};
  }

  render() {
    const {characterSteps, colSpan, containers, link, longTitle, placeTitle, title} = this.props;
    return <tbody onClick={e => {this.setState(prev => ({open: !prev.open}))}}>
      <tr>
        <td title={longTitle}>
          {link ? <a href={link} target="_blank">{title}</a> : title.replace(/ [(].*,.*[)]/, ' (...)')}
          {placeTitle && <div style={{float: 'right'}}>&nbsp;{placeTitle}</div>}
        </td>
        {containers.map(({character}) => {
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
      </tr>
      {this.state.open && <tr>
        <td style={{backgroundColor: 'rgb(30, 36, 43)', whiteSpace: 'pre-wrap'}}>{longTitle}</td>
        <td style={{backgroundColor: 'rgb(30, 36, 43)'}} colSpan={containers.length * colSpan}>
          {Object.values(characterSteps)[0].map(step => <div>&bull; {step.displayName}</div>)}
        </td>
      </tr>}
    </tbody>;
  }
}
