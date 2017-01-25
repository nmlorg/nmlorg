class EventsTable extends React.Component {
  render() {
    const base = this.props.base;
    const containers = Object.values(base.state.containers)
        .filter(({character, advisors}) => character && advisors);
    const events = {};

    for (let {advisors, character} of containers) {
      for (let event of advisors.events) {
        if (!events[event.friendlyIdentifier])
          events[event.friendlyIdentifier] = {
              charData: {},
              eventDef: event.eventDef,
              expirationDate: event.expirationDate,
              saleItemCategories: event.vendor.saleItemCategories,
          };
        events[event.friendlyIdentifier].charData[character.characterId] = {
            currencies: Object.entries(event.vendor.currencies).map(([currencyHash, count]) => ({
                count,
                currencyDef: bungie.DEFS.items[currencyHash],
            })),
        };
      }
    }

    const eventList = Object.entries(events).sort().map(([title, data]) => data);

    function findItem(itemHash) {
      const ret = [];
      for (let {items} of Object.values(base.state.containers))
        for (let item of items)
          if (item.itemHash == itemHash)
            ret.push(item);
      return ret;
    }

    return <table>
      <thead>
        <tr>
          <td/>
          {containers.map(({character}) => <td><CharacterPlacard character={character}/></td>)}
        </tr>
      </thead>
      {eventList.map(({charData, eventDef, expirationDate, saleItemCategories}) =>
        <tbody>
          <tr>
            <td rowSpan="2"
                style={{backgroundImage: `url("https://www.bungie.net${eventDef.backgroundImageMobile}")`,
                        backgroundSize: 'cover'}}>
              <h2>{eventDef.title}</h2>
              <h3>{eventDef.subtitle}</h3>
              Until {expirationDate.toLocaleString()}
            </td>
            {containers.map(({character}) => <td>
              Currencies:
              <ul>
                {charData[character.characterId].currencies.map(({count, currencyDef}) => <li>
                  {currencyDef.itemName}: {count}
                </li>)}
              </ul>
            </td>)}
          </tr>
          <tr>
            <td colSpan="3">
              {saleItemCategories.map(category => (category.categoryTitle != 'Available Bounties') && [
                category.categoryTitle, ':',
                <ul>
                  {category.saleItems.map(item => <li>
                    {item.item.itemDef.itemName}
                    {item.item.stackSize > 1 && ` x ${item.item.stackSize}`}:&nbsp;
                    {item.costs.map(cost => `${cost.value} ${cost.itemDef.itemName}`).join(' + ')}&nbsp;
                    [{findItem(item.item.itemHash).map(item => item.stackSize).reduce((a, b) => a + b, 0)} owned]
                  </li>)}
                </ul>,
              ])}
            </td>
          </tr>
        </tbody>
      )}
    </table>;
  }
}
