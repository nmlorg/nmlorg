const ITEM_COLS = 4;


class DetailsTable extends React.Component {
  render() {
    const base = this.props.base;
    const containerList = Object.values(base.state.containers);
    const buckets = new Set();
    for (let {items} of containerList)
      for (let item of items)
        buckets.add(`${item.bucketCategory}:${item.bucketName}`);
    const bucketList = Array.from(buckets, a => a.split(':', 2)).sort();

    function equip(item) {
      item.EquipItem()
          .then(() => base.setState(prev => {
            const items = prev.containers[item.owner.characterId || ''].items;
            for (let subItem of filterItems(items, item.bucketCategory, item.bucketName)) {
              if (subItem.isEquipped) {
                subItem.isEquipped = false;
                if (subItem.transferStatusName == 'ItemIsEquipped')
                  subItem.transferStatusName = 'CanTransfer';
              }
            }
            item.isEquipped = true;
            if (item.transferStatusName == 'CanTransfer')
              item.transferStatusName = 'ItemIsEquipped';
            return prev;
          }));
    }

    function transfer(item, newCharacterId) {
      const oldCharacterId = item.owner.characterId || '';
      item.transfer(newCharacterId, item.stackSize)
          .then(() => base.setState(prev => {
            const oldContainer = prev.containers[oldCharacterId];
            oldContainer.items.splice(oldContainer.items.indexOf(item), 1);

            const newContainer = prev.containers[newCharacterId || ''];
            newContainer.items.push(item);

            if (!newCharacterId) {
              item.cannotEquipReason |= 16;
              item.cannotEquipReason &= ~4;
            } else {
              item.cannotEquipReason &= ~16;

              if ((item.classTypeName != 'Unknown') &&
                  (item.classTypeName != newContainer.character.characterClass.className))
                item.cannotEquipReason |= 4;
              else
                item.cannotEquipReason &= ~4;
            }
            item.canEquip = !item.cannotEquipReason;

            return prev;
          }));
    }

    return <table style={{whiteSpace: 'nowrap'}}>
      <thead>
        <tr>
          {containerList.map(({character}) => <td colSpan={ITEM_COLS}>
            <CharacterPlacard character={character}/>
          </td>)}
        </tr>
      </thead>
      {bucketList.map(([category, bucket]) => <DetailsRow category={category} bucket={bucket}
                                                          containerList={containerList}
                                                          equip={equip} transfer={transfer}/>)}
    </table>;
  }
}


function filterItems(items, category, bucket) {
  return items.filter(item => (item.bucketCategory == category) && (item.bucketName == bucket));
}


function getValues(a) {
  return [
      a.primaryStat ? -a.primaryStat.value : 0,
      a.itemDef.itemName,
      -a.stackSize,
  ];
}


function cmp(a, b) {
  const aValues = getValues(a);
  const bValues = getValues(b);
  for (let i = 0; i < aValues.length; i++)
    if (aValues[i] < bValues[i])
      return -1;
    else if (aValues[i] > bValues[i])
      return 1;
  return 0;
}


class DetailsRow extends React.Component {
  constructor(props) {
    super(props);
    this.key = `detailstable.${props.category}.${props.bucket}`;
    this.state = bungie.load(this.key) || {
        open: false,
    };
  }

  render() {
    bungie.store(this.key, this.state);
    const {category, bucket, containerList, equip, transfer} = this.props;
    const itemGrid = containerList.map(({items}) => filterItems(items, category, bucket).sort(cmp));
    const longestList = itemGrid.reduce((a, b) => a.length > b.length ? a : b);
    return <tbody>
      <tr>
        <td colSpan={ITEM_COLS * itemGrid.length}
            onClick={e => this.setState(prev => ({open: !prev.open}))}
            style={{backgroundColor: 'white', color: 'black', cursor: 'pointer'}}>
          {category}: {bucket}
        </td>
      </tr>
      {longestList.map((_, i) => <tr style={{display: this.state.open ? '' : 'none'}}>
        {itemGrid.map(items => {
          const item = items[i];
          if (!item)
            return [<td/>, <td/>, <td/>, <td/>];
          const style = {
            backgroundColor: 'rgb(30, 36, 43)',
          };
          if (item.isEquipped || (item.stateName == 'Tracked'))
            style.backgroundColor = 'rgb(60, 72, 86)';
          const rightStyle = Object.assign({}, style, {textAlign: 'right'});
          return [
            <td style={rightStyle}>
              {item.primaryStat && item.primaryStat.value}
            </td>,
            <td style={style}>
              <Cabinet>
                <BungieImage src={item.itemDef.icon} style={{height: '1em'}}/>
                {item.perks && item.perks.map(perk => perk.isActive && <BungieImage src={perk.iconPath} style={{height: '1em'}} title={`${perk.perkDef.displayName}: ${perk.perkDef.displayDescription}`}/>)}
                &nbsp;{item.itemDef.itemName}
                {((item.cannotEquipReason & 4) || !item.owner.characterId) &&
                 (item.classTypeName != 'Unknown') && `\u00a0(${item.classTypeName})`}
                <CabinetDrawer>
                  <ItemDetails item={item}/>
                </CabinetDrawer>
              </Cabinet>
            </td>,
            <td style={rightStyle}>
              {item.value ? item.value : item.stackSize != 1 && item.stackSize}
            </td>,
            <td style={style}>
              {item.transferStatusName == 'CanTransfer' && containerList.map(({character}) => {
                const key = character ? character.characterId : null;
                const icon = character ? character.emblemPath :
                    '/img/theme/destiny/icons/icon_vault.png';
                if (key != item.owner.characterId)
                  return <BungieImage src={icon} style={{cursor: 'pointer', height: '1em'}}
                                      onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    transfer(item, key);
                  }}/>;
              })}
              {item.canEquip && !item.isEquipped && <span style={{cursor: 'pointer'}} onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                equip(item);
              }}>&nbsp;E</span>}
            </td>,
          ];
        })}
      </tr>)}
    </tbody>;
  }
}


class ItemDetails extends React.Component {
  render() {
    const {item} = this.props;
    return <div>
      <p style={{whiteSpace: 'normal'}}>{item.itemDef.itemDescription}</p>
      {item.objectives && !!item.objectives.length && <p>
        Objectives:
        {item.objectives.map(objective => <div>
          {`${objective.isComplete ? '\u2611' : '\u2610'}\u00a0${objective.objectiveDef.displayDescription || item.itemDef.itemDescription} (${objective.progress}/${objective.objectiveDef.completionValue})`}
        </div>)}
      </p>}
      {item.perks && !!item.perks.length && <p>
        Perks:<br/>
        {item.perks.map(perk => <div>
          {`${perk.isActive ? '\u2611' : '\u2610'}\u00a0${perk.perkDef.displayName}: ${perk.perkDef.displayDescription}`}
        </div>)}
      </p>}
    </div>;
  }
}
