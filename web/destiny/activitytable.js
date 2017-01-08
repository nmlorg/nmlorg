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
        if (!activities[title])
          activities[title] = {
              activity,
              characters: {},
          };
        activities[title].characters[character.characterId] = activity;
      }
    }

    const activityList = Object.entries(activities).sort();

    return <table>
      <thead>
        <tr>
          <td colSpan="2"/>
          {Object.values(base.state.containers).map(({character}) => character && <td colSpan="2">
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
        {activityList.map(([title, {activity, characters}]) => [
          <tr>
            <td colSpan="5">{title}</td>
            <td colSpan="3">{activity.destinationDef.destinationName}</td>
          </tr>,
        ].concat(activity.steps.map((step, i) => <tr>
          <td colSpan="2">&bull; {step.displayName}</td>
          {containers.map(({character}) => {
            const activity = characters[character.characterId];
            if (!activity)
              return <td colSpan="2"/>;
            return <td colSpan="2" style={{backgroundColor: activity.steps[i].isComplete ? 'grey' : 'lightblue'}}/>;
          })}
        </tr>)))}
      </tbody>
    </table>;
  }
}
