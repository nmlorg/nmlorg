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
              characters: {},
              longTitle,
          };
        activities[title].characters[character.characterId] = activity;
      }
    }

    const activityList = Object.entries(activities).sort();
    const stepLengths = new Set();
    for (let [title, {activity}] of activityList)
      stepLengths.add(activity.steps.length);
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
        {activityList.map(([title, {activity, characters, longTitle}]) => <tr>
          <td title={longTitle}>
            {title.replace(/ [(].*,.*[)]/, ' (...)')}
            <div style={{float: 'right'}}>&nbsp;{activity.placeDef.placeName}</div>
          </td>
          {Object.values(base.state.containers).map(({character}) => {
            if (!character)
              return;
            const activity = characters[character.characterId];
            if (!activity)
              return <td colSpan={colspan}/>;
            const stepSpan = colSpan / activity.steps.length;
            return activity.steps.map(step => {
              const [color, check] = step.isComplete ? ['grey', '\u2611'] : ['lightblue', '\u2610'];
              return <th colSpan={stepSpan}
                         style={{backgroundColor: color}}
                         title={step.displayName}>{check}</th>;
            });
          })}
        </tr>)}
      </tbody>
    </table>;
  }
}
