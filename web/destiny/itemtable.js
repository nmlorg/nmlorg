class ItemTable extends React.Component {
  render() {
    const base = this.props.base;
    return <div>
      <table>
        <thead>
          <tr>
            <th>
              <div>
                {base.props.account.bungieNetUser.displayName}
                {base.props.account.bungieNetUser.displayName != base.account.userInfo.displayName ? ` (${base.account.userInfo.displayName})` : ''}
              </div>
              <button onClick={() => base.refresh()}>Refresh</button>
            </th>
            {Object.values(base.state.containers).map(({character, itemTree}) => <td>
              {character
                ? <Placard background={character.backgroundPath}
                           icon={character.emblemPath}
                           neutral={true}
                           right={character.level}
                           text={`${character.race.raceName} ${character.gender.genderName}`}
                           title={character.characterClass.className}/>
                : <Placard neutral={true} title="Vault"/>}
            </td>)}
          </tr>
        </thead>
        <tbody>
          {base.state.buckets.map(([category, bucket]) => <tr>
            <th>{bucket}</th>
            {Object.values(base.state.containers).map(({character, itemTree}) => <ItemListTD acc={base} character={character} items={itemTree[category][bucket] || []}/>)}
          </tr>)}
        </tbody>
      </table>
    </div>;
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
    const aTitle = a.questlineItemDef ? `${a.questlineItemDef.itemName}: ${a.itemDef.itemName}` : a.itemDef.itemName;
    const bTitle = b.questlineItemDef ? `${b.questlineItemDef.itemName}: ${b.itemDef.itemName}` : b.itemDef.itemName;
    if (aTitle < bTitle)
      return -1;
    else if (aTitle > bTitle)
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
    const itemDef = item.questlineItemDef || item.itemDef;
    var title = item.questlineItemDef ? `${item.questlineItemDef.itemName}: ${item.itemDef.itemName}` : item.itemDef.itemName;
    if (item.locationName != 'Inventory')
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
                    background={itemDef.secondaryIcon}
                    icon={itemDef.icon}
                    key={item.itemInstanceId}
                    right={item.primaryStat ? item.primaryStat.value : item.stackSize != 1 ? item.stackSize : '' }
                    text={text}
                    title={title}>
      {item.itemDef.itemDescription}
      {item.transferStatusName == 'CanTransfer' && <div>
        {Object.values(this.props.acc.state.containers).map(({character, itemTree}) => {
          const newCharacterId = character && character.characterId;
          if (newCharacterId != item.owner.characterId)
            return <button onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              const oldCharacterId = item.owner.characterId || '';
              item.transfer(newCharacterId, item.stackSize)
                  .then(() => this.props.acc.setState(prev => {
                    const bucket = prev.containers[oldCharacterId].itemTree[item.bucketCategory][item.bucketName];
                    bucket.splice(bucket.indexOf(item), 1);
                    const newCategory = prev.containers[newCharacterId || ''].itemTree[item.bucketCategory];
                    if (!newCategory[item.bucketName])
                      newCategory[item.bucketName] = [];
                    newCategory[item.bucketName].push(item);
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
