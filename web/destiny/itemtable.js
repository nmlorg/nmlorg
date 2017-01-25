function filterItems(items, category, bucket) {
  return items.filter(item => (item.bucketCategory == category) && (item.bucketName == bucket));
}


class ItemTable extends React.Component {
  static buckets = [
      ['Equippable', 'Subclass'],
      ['Equippable', 'Primary Weapons'],
      ['Equippable', 'Special Weapons'],
      ['Equippable', 'Heavy Weapons'],
      ['Equippable', 'Ghost'],
      ['Equippable', 'Helmet'],
      ['Equippable', 'Gauntlets'],
      ['Equippable', 'Chest Armor'],
      ['Equippable', 'Leg Armor'],
      ['Equippable', 'Class Armor'],
      ['Equippable', 'Artifacts'],
      ['Equippable', 'Emblems'],
      ['Equippable', 'Emotes'],
      ['Equippable', 'Shaders'],
      ['Equippable', 'Ships'],
      ['Equippable', 'Sparrow Horn'],
      ['Equippable', 'Vehicle'],
      ['Item', 'Ornaments'],
      ['Item', 'Consumables'],
      ['Item', 'Materials'],
      ['Item', 'Mission'],
      ['Unknown', 'Unknown'],
  ];

  render() {
    const base = this.props.base;
    const containers = base.state.containers;
    return <table>
      <thead>
        <tr>
          <td/>
          {Object.values(containers).map(({character}) => <td>
            <CharacterPlacard character={character}/>
          </td>)}
        </tr>
      </thead>
      <tbody>
        {ItemTable.buckets.map(([category, bucket]) => <tr>
          <th>{bucket}</th>
          {Object.values(containers).map(({character, items}) =>
            <ItemListTD acc={base} character={character}
                        items={filterItems(items, category, bucket)}/>)}
        </tr>)}
      </tbody>
    </table>;
  }
}


class ItemListTD extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        expanded: false,
    };
  }

  static cmpItem(a, b) {
    const aValue = a.primaryStat ? a.primaryStat.value : 0;
    const bValue = b.primaryStat ? b.primaryStat.value : 0;
    if (aValue != bValue)
      return bValue - aValue;
    if (a.itemDef.itemName < b.itemDef.itemName)
      return -1;
    else if (a.itemDef.itemName > b.itemDef.itemName)
      return 1;
    if (a.stackSize > b.stackSize)
      return -1;
    else if (a.stackSize < b.stackSize)
      return 1;
    return 0;
  }

  render() {
    if (!this.props.items.length)
      return <td/>;

    const sortedItems = Array.from(this.props.items).sort(ItemListTD.cmpItem);
    var items = sortedItems;
    if (!this.state.expanded && (items.length > 4))
      items = items.slice(0, 3);
    items = items.map(item => <Item acc={this.props.acc} item={item}/>);
    if (sortedItems.length > 4) {
      if (!this.state.expanded) {
        const item = sortedItems[3];
        items.push(<div onClick={e => this.setState({expanded: true})}
                        style={{opacity: .3}}>
          <Item acc={this.props.acc} item={item}/>
        </div>);
      } else {
        items.push(<button onClick={e => {
          e.preventDefault();
          this.setState({expanded: false});
        }}>Collapse</button>);
      }
    }
    return <td>{items}</td>;
  }
}


class Item extends React.Component {
  render() {
    const item = this.props.item;
    var title = item.itemDef.itemName;
    if ((item.locationName != 'Inventory') && (item.locationName != 'Vault'))
      title = `${title} (${item.locationName})`;
    var text = '';
    if (item.objectives.length)
      for (let objective of item.objectives)
        text += `${objective.isComplete ? '\u2611' : '\u2610'}\u00a0${objective.objectiveDef.displayDescription || item.itemDef.itemDescription} (${objective.progress}/${objective.objectiveDef.completionValue}) `;
    else if (item.perks.length)
      for (let perk of item.perks)
        text += `${perk.isActive ? '\u2611' : '\u2610'}\u00a0${perk.perkDef.displayName} `;
    else
      text = item.itemDef.itemDescription;
    return <Placard active={item.isEquipped || (item.stateName == 'Tracked')}
                    background={item.itemDef.secondaryIcon}
                    icon={item.itemDef.icon}
                    key={item.itemInstanceId}
                    right={item.primaryStat ? item.primaryStat.value : item.stackSize != 1 ? item.stackSize : '' }
                    text={text}
                    title={title}>
      {item.itemDef.itemDescription}
      {item.transferStatusName == 'CanTransfer' && <div>
        {Object.values(this.props.acc.state.containers).map(({character, items}) => {
          const newCharacterId = character && character.characterId;
          if (newCharacterId != item.owner.characterId)
            return <button onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              const oldCharacterId = item.owner.characterId || '';
              item.transfer(newCharacterId, item.stackSize)
                  .then(() => this.props.acc.setState(prev => {
                    const bucket = prev.containers[oldCharacterId].items;
                    bucket.splice(bucket.indexOf(item), 1);
                    prev.containers[newCharacterId || ''].items.push(item);
                    return prev;
                  }));
            }}>Transfer to {character ? `${character.race.raceName} ${character.gender.genderName} ${character.characterClass.className}` : 'Vault'}</button>;
        })}
      </div>}
      {(item.objectives.length > 0) && <p>
        Objectives:<br/>
        {item.objectives.map(objective => <div>{`${objective.isComplete ? '\u2611' : '\u2610'}\u00a0${objective.objectiveDef.displayDescription || item.itemDef.itemDescription} (${objective.progress}/${objective.objectiveDef.completionValue})`}</div>)}
      </p>}
      {(item.perks.length > 0) && <p>
        Perks:<br/>
        {item.perks.map(perk => <div>{`${perk.isActive ? '\u2611' : '\u2610'}\u00a0${perk.perkDef.displayName}: ${perk.perkDef.displayDescription}`}</div>)}
      </p>}
      {(item.sources.Activity.length > 0) && <p>
        Activity sources:<br/>
        {item.sources.Activity.map(source => source && <div>
          <img width="12" height="12" src={`https://www.bungie.net${source.icon}`}/>
          {source.description}
        </div>)}
      </p>}
      {(item.sources.Vendor.length > 0) && <p>
        Vendor sources:<br/>
        {item.sources.Vendor.map(source => source && <div>
          <img width="12" height="12" src={`https://www.bungie.net${source.icon}`}/>
          {source.description}
        </div>)}
      </p>}
      {(item.sources.Aggregate.length > 0) && <p>
        Requirements:<br/>
        {item.sources.Aggregate.map(source => source && <div>
          <img width="12" height="12" src={`https://www.bungie.net${source.icon}`}/>
          {source.description}
        </div>)}
      </p>}
      {item.nodeGrid && <NodeGrid grid={item.nodeGrid}/>}
      <div><button onClick={e => {e.preventDefault(); e.stopPropagation(); console.log(item)}}>Debug</button></div>
    </Placard>;
  }
}


class NodeGrid extends React.Component {
  render() {
    const grid = this.props.grid;
    const numRows = grid.map(column => column.length).reduce((a, b) => a > b ? a : b, 0);
    const rows = Array.from({length: numRows}, (_, i) => i);
    return <table>
      <tbody>
        {rows.map(rowNum => {
          const row = [];
          for (let colNum = 0; colNum < grid.length; colNum++)
            row.push(<td>{grid[colNum] && grid[colNum][rowNum] && <NodeGridNode node={grid[colNum][rowNum]}/>}</td>);
          return <tr>{row}</tr>;
        })}
      </tbody>
    </table>;
  }
}


class NodeGridNode extends React.Component {
  render() {
    const node = this.props.node;
    return <div className={`grid-node ${node.isActivated ? 'active' : node.hidden ? 'hidden' : node.stateName == 'MustSwap' ? 'unlocked' : ''}`}>
      <img src={`https://www.bungie.net${node.stepDef.icon}`}/>
      <b>{node.stepDef.nodeStepName || node.stepDef.interactionDescription}</b><br/>
      {node.stepDef.nodeStepDescription}
      {['Complete', 'Hidden', 'MustSwap', 'NoGridLevel'].indexOf(node.stateName) == -1 && ` (${node.stateName})`}
    </div>;
  }
}
