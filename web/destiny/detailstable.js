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

    function transfer(item, characterId) {
      const oldCharacterId = item.owner.characterId || '';
      item.transfer(characterId, item.stackSize)
          .then(() => base.setState(prev => {
            const items = prev.containers[oldCharacterId].items;
            items.splice(items.indexOf(item), 1);
            prev.containers[characterId || ''].items.push(item);
            if (!oldCharacterId && (item.cannotEquipReason & 16)) {
              item.cannotEquipReason &= ~16;
              if (!item.cannotEquipReason)
                item.canEquip = true;
            }
            if (!characterId) {
              item.cannotEquipReason |= 16;
              item.canEquip = false;
            }
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
  render() {
    const {category, bucket, containerList, equip, transfer} = this.props;
    const itemGrid = containerList.map(({items}) => filterItems(items, category, bucket).sort(cmp));
    const longestList = itemGrid.reduce((a, b) => a.length > b.length ? a : b);
    return <tbody>
      <tr>
        <td colSpan={ITEM_COLS * itemGrid.length}
            style={{backgroundColor: 'white', color: 'black'}}>{category}: {bucket}</td>
      </tr>
      {longestList.map((_, i) => <tr>
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
              <img src={`https://www.bungie.net${item.itemDef.icon}`} style={{height: '1em'}}/>
              &nbsp;{item.itemDef.itemName}
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
                  return <img src={`https://www.bungie.net${icon}`}
                              style={{cursor: 'pointer', height: '1em'}}
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
