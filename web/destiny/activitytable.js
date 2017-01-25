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
              activityPerAccount: activity.activityPerAccount,
              charData: {},
              longTitle: longTitle.join('\n'),
              placeTitle: activity.placeDef.placeName,
          };
        activities[title].charData[character.characterId] = {rewards: activity.rewards, steps: activity.steps};
      }

      for (let bounty of advisors.bounties) {
        var title = `Bounty (${bounty.activityTypeName.replace(/ Bounty$/, '')}): ${bounty.questDef.itemName}`;
        const longTitle = [bounty.questDef.itemName];
        if (bounty.questDef.itemName != bounty.stepDef.itemName) {
          title = `${title}: ${bounty.stepDef.itemName}`;
          longTitle.push(bounty.stepDef.itemName);
        }
        longTitle.push('');
        longTitle.push(bounty.stepDef.itemDescription);
        const placeNames = bounty.stepObjectives.map(step => guessPlaceName(step.objectiveDef.displayDescription));
        placeNames.push(guessPlaceName(bounty.stepDef.itemDescription));
        if (!activities[title])
          activities[title] = {
              charData: {},
              longTitle: longTitle.join('\n'),
              placeTitle: Array.from(new Set(placeNames.filter(placeName => placeName))).sort().join(', '),
          };
        const steps = bounty.stepObjectives.map(step => ({
            completionValue: step.objectiveDef.completionValue,
            displayName: step.objectiveDef.displayDescription,
            isComplete: step.isComplete,
            progress: step.progress,
        }));
        activities[title].charData[character.characterId] = {
            rewards: bounty.rewards,
            sourceDef: bounty.sourceDef,
            steps,
        };
      }

      for (let checklist of advisors.checklists) {
        for (let entry of checklist.entries) {
          if (entry.state)
            continue;
          const title = `Checklist: ${checklist.checklistName}: ${entry.name}`;
          const longTitle = [checklist.checklistName, entry.name];
          if (!activities[title])
            activities[title] = {
                charData: {},
                link: 'http://www.ign.com/wikis/destiny/Calcified_Fragments#' + entry.name.split(':', 2)[0],
                longTitle: longTitle.join('\n'),
            };
          activities[title].charData[character.characterId] = {
              steps: [{displayName: entry.name, isComplete: entry.state}],
          };
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
              charData: {},
              longTitle,
              placeTitle: Array.from(new Set(placeNames)).sort().join(', '),
          };
        const steps = quest.stepObjectives.map(step => ({
            completionValue: step.objectiveDef.completionValue,
            displayName: step.objectiveDef.displayDescription,
            isComplete: step.isComplete,
            progress: step.progress,
        }));
        activities[title].charData[character.characterId] = {rewards: quest.rewards, steps};
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
                activityPerAccount: book.activityPerAccount,
                charData: {},
                longTitle,
                placeTitle: Array.from(new Set(placeNames)).sort().join(', '),
            };
          const steps = record.objectives.map(step => ({
              completionValue: step.objectiveDef.completionValue,
              displayName: step.objectiveDef.displayDescription,
              isComplete: step.isComplete,
              progress: step.progress,
          }));
          activities[title].charData[character.characterId] = {steps};
        }
      }
    }

    const activityList = Object.entries(activities).sort();
    const stepLengths = new Set();
    for (let [title, {charData}] of activityList)
      stepLengths.add(Object.values(charData)[0].steps.length);
    var colSpan = 1;
    for (let stepLength of Array.from(stepLengths).sort().reverse())
      if (colSpan % stepLength)
        colSpan *= stepLength;

    return <table>
      <thead>
        <tr>
          <td/>
          {containers.map(({character}) => <td colSpan={colSpan}>
            <CharacterPlacard character={character}/>
          </td>)}
        </tr>
      </thead>
      {activityList.map(([title, {activityPerAccount, charData, link, longTitle, placeTitle}]) =>
        activityPerAccount
          ? <ActivityRow charData={charData} colSpan={colSpan * containers.length}
                         containers={containers.slice(0, 1)} link={link} longTitle={longTitle}
                         placeTitle={placeTitle} title={title}/>
          : <ActivityRow charData={charData} colSpan={colSpan} containers={containers}
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
    const {charData, colSpan, containers, link, longTitle, placeTitle, title} = this.props;
    return <tbody onClick={e => {this.setState(prev => ({open: !prev.open}))}}>
      <tr>
        <td title={longTitle}>
          {link ? <a href={link} target="_blank">{title}</a> : title.replace(/ [(].*,.*[)]/, ' (...)')}
          {placeTitle && <div style={{float: 'right'}}>&nbsp;{placeTitle}</div>}
        </td>
        {containers.map(({character}) => {
          const data = charData[character.characterId];
          if (!data)
            return <td colSpan={colSpan}/>;
          if (data.sourceDef)
            return <th colSpan={colSpan}
                       style={{backgroundColor: '#bdb76b'}}
                       title={data.sourceDef.summary.vendorDescription}>
              <i>({data.sourceDef.summary.vendorName})</i>
            </th>;
          const stepSpan = colSpan / data.steps.length;
          return data.steps.map(step => {
            const check = step.isComplete ? '\u2611' : step.completionValue > 1 ? `${step.progress} / ${step.completionValue}` : '\u2610';
            return <th colSpan={stepSpan}
                       style={{backgroundColor: step.isComplete ? '#696969' : '#1e90ff'}}
                       title={step.displayName}>{check}</th>;
          });
        })}
      </tr>
      {this.state.open && <tr>
        <td rowSpan="2" style={{backgroundColor: 'rgb(30, 36, 43)', whiteSpace: 'pre-wrap'}}>{longTitle}</td>
        <td style={{backgroundColor: 'rgb(30, 36, 43)'}} colSpan={containers.length * colSpan}>
          <div>Steps:</div>
          {Object.values(charData)[0].steps.map(step => <div>&bull; {step.displayName}</div>)}
        </td>
      </tr>}
      {this.state.open && <tr>
        {containers.map(({character}) => {
          const data = charData[character.characterId];
          if (!data)
            return <td colSpan={colSpan}/>;
          return <td style={{backgroundColor: 'rgb(30, 36, 43)'}} colSpan={colSpan}>
            <div>Rewards:</div>
            {data.rewards && data.rewards.map(reward => <div>&bull; {reward.value || null} {reward.itemDef.itemName}</div>)}
          </td>;
        })}
      </tr>}
    </tbody>;
  }
}
