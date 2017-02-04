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
        const groupTitle = ` ${activity.activityPeriod} ${activity.activityTypeName}`;
        var title = activity.activityDef.activityName;
        if (activity.activityTypeName == 'Arena')
          title = `${activity.activityDef.activityLevel}: ${title}`;
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
        if (!activities[groupTitle])
          activities[groupTitle] = {};
        if (!activities[groupTitle][title])
          activities[groupTitle][title] = {
              activityPerAccount: activity.activityPerAccount,
              charData: {},
              longTitle: longTitle.join('\n'),
              placeTitle: activity.placeDef.placeName,
          };
        activities[groupTitle][title].charData[character.characterId] = {
            rewards: activity.rewards,
            steps: activity.steps,
        };
      }

      for (let bounty of advisors.bounties) {
        const groupTitle = `Bounty (${bounty.activityTypeName.replace(/ Bounty$/, '')})`;
        var title = bounty.questDef.itemName;
        const longTitle = [bounty.questDef.itemName];
        if (bounty.questDef.itemName != bounty.stepDef.itemName) {
          title = `${title}: ${bounty.stepDef.itemName}`;
          longTitle.push(bounty.stepDef.itemName);
        }
        longTitle.push('');
        longTitle.push(bounty.stepDef.itemDescription);
        const placeNames = bounty.stepObjectives.map(step => guessPlaceName(step.objectiveDef.displayDescription));
        placeNames.push(guessPlaceName(bounty.stepDef.itemDescription));
        if (!activities[groupTitle])
          activities[groupTitle] = {};
        if (!activities[groupTitle][title])
          activities[groupTitle][title] = {
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
        activities[groupTitle][title].charData[character.characterId] = {
            rewards: bounty.rewards,
            sourceDef: bounty.sourceDef,
            steps,
        };
      }

      for (let checklist of advisors.checklists) {
        for (let entry of checklist.entries) {
          if (entry.state)
            continue;
          const groupTitle = `Checklist: ${checklist.checklistName}`;
          const title = entry.name;
          const longTitle = [checklist.checklistName, entry.name];
          if (!activities[groupTitle])
            activities[groupTitle] = {};
          if (!activities[groupTitle][title])
            activities[groupTitle][title] = {
                charData: {},
                link: 'http://www.ign.com/wikis/destiny/Calcified_Fragments#' + entry.name.split(':', 2)[0],
                longTitle: longTitle.join('\n'),
            };
          activities[groupTitle][title].charData[character.characterId] = {
              steps: [{displayName: entry.name, isComplete: entry.state}],
          };
        }
      }

      for (let quest of advisors.quests) {
        const groupTitle = quest.activityTypeName;
        const title = `${quest.questDef.itemName}: ${quest.stepDef.itemName}`;
        const longTitle = [quest.questDef.itemName, quest.stepDef.itemName, '', quest.stepDef.itemDescription]
            .join('\n');
        const destinations = quest.stepObjectives.map(step => step.destinationDef).filter(dest => dest);
        const places = destinations.map(dest => bungie.DEFS.places[dest.placeHash]).filter(place => place);
        const placeNames = places.map(place => place.placeName);
        if (!activities[groupTitle])
          activities[groupTitle] = {};
        if (!activities[groupTitle][title])
          activities[groupTitle][title] = {
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
        activities[groupTitle][title].charData[character.characterId] = {
            rewards: quest.rewards,
            steps,
        };
      }

      for (let book of advisors.recordBooks) {
        for (let record of Object.values(book.records)) {
          if (record.statusName == 'Redeemed')
            continue;
          const groupTitle = `${book.activityTypeName}: ${book.bookDef.displayName}`;
          var title = record.recordDef.displayName;
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
          if (!activities[groupTitle])
            activities[groupTitle] = {};
          if (!activities[groupTitle][title])
            activities[groupTitle][title] = {
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
          activities[groupTitle][title].charData[character.characterId] = {steps};
        }
      }
    }

    const activityGroups = Object.entries(activities).sort().map(([k, v]) => ([k, Object.entries(v).sort()]));
    const stepLengths = new Set();
    for (let [groupTitle, activityList] of activityGroups)
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
      {activityGroups.map(([groupTitle, activityList]) =>
        <ActivityGroup activityList={activityList}
                       colSpan={colSpan}
                       containers={containers}
                       groupTitle={groupTitle}/>
      )}
    </table>;
  }
}


class ActivityGroup extends React.Component {
  render() {
    const {activityList, colSpan, containers, groupTitle} = this.props;
    return <CollapsedTBody colSpan={colSpan * containers.length + 1}
                           persistKey={`activitytable.${groupTitle}`}
                           title={groupTitle}>
      {activityList.map(([title, {activityPerAccount, charData, link, longTitle, placeTitle}]) =>
        activityPerAccount
          ? <ActivityRow charData={charData} colSpan={colSpan * containers.length}
                         containers={containers.slice(0, 1)} link={link} longTitle={longTitle}
                         placeTitle={placeTitle} title={title}/>
          : <ActivityRow charData={charData} colSpan={colSpan} containers={containers}
                         link={link} longTitle={longTitle} placeTitle={placeTitle} title={title}/>
      )}
    </CollapsedTBody>;
  }
}


class ActivityRow extends React.Component {
  render() {
    const {charData, colSpan, containers, link, longTitle, placeTitle, title} = this.props;
    return <tr>
      <td style={{backgroundColor: 'rgb(30, 36, 43)'}}
          title={longTitle}>
        <Cabinet>
          {link ? <a href={link} target="_blank">{title}</a> : title.replace(/ [(].*,.*[)]/, ' (...)')}
          {placeTitle && <div style={{float: 'right'}}>&nbsp;{placeTitle}</div>}
          <CabinetDrawer>
            <div style={{whiteSpace: 'pre'}}>
              {longTitle}
              <p>
                Steps:
                {Object.values(charData)[0].steps.map(step => <div>&bull; {step.displayName}</div>)}
              </p>
            </div>
          </CabinetDrawer>
        </Cabinet>
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
                     title={step.displayName}>
            <Cabinet>
              {check}
              {data.rewards && !!data.rewards.length && <CabinetDrawer>
                <div style={{whiteSpace: 'nowrap'}}>
                  <div>Rewards:</div>
                  {data.rewards.map(reward => <div>&bull; {reward.value || null} {reward.itemDef.itemName}</div>)}
                </div>
              </CabinetDrawer>}
            </Cabinet>
          </th>;
        });
      })}
    </tr>;
  }
}
