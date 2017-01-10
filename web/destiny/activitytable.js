class ActivityTable extends React.Component {
  render() {
    const base = this.props.base;
    const containers = Object.values(base.state.containers).filter(({character, advisors}) => character && advisors);
    const activities = {};

    for (let {advisors, character} of containers) {
      for (let activity of advisors.activities) {
        var title = `${activity.activityTypeName}: ${activity.activityDef.activityName}`;
        if (activity.modifiers.length)
          title = `${title} (${activity.modifiers.map(mod => mod.displayName).sort().join(', ')})`;
        const longTitle = [activity.activityDef.activityName]
            .concat(activity.skulls.map(skull => `${skull.displayName}: ${skull.description}`))
            .join('\n');
        if (!activities[title])
          activities[title] = {
              activity,
              characterSteps: {},
              longTitle,
          };
        activities[title].characterSteps[character.characterId] = activity.steps;
      }

      for (let quest of advisors.quests) {
        var title = `${quest.activityTypeName}: ${quest.questDef.itemName}: ${quest.stepDef.itemName}`;
        const longTitle = [quest.questDef.itemName, quest.stepDef.itemName]
            .join('\n');
        if (!activities[title])
          activities[title] = {
              activity: quest,
              characterSteps: {},
              longTitle,
          };
        const steps = quest.stepObjectives.map(step => ({
            completionValue: step.objectiveDef.completionValue,
            displayName: step.objectiveDef.displayDescription,
            isComplete: step.isComplete,
            progress: step.progress,
        }));
        activities[title].characterSteps[character.characterId] = steps;
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
        {activityList.map(([title, {activity, characterSteps, longTitle}]) => <tr>
          <td title={longTitle}>
            {title.replace(/ [(].*,.*[)]/, ' (...)')}
            {activity.placeDef && <div style={{float: 'right'}}>&nbsp;{activity.placeDef.placeName}</div>}
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
