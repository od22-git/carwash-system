import { groupChanges } from './group-changes';

describe('groupChanges', () => {
  const changes = [
    { seq: 1, tableName: 'tickets', rowId: 't1' },
    { seq: 2, tableName: 'wages', rowId: 'w1' },
    { seq: 3, tableName: 'tickets', rowId: 't1' },
    { seq: 4, tableName: 'tickets', rowId: 't2' },
  ];

  it('returns unique ids per table', () => {
    const result = groupChanges(changes, () => true);
    expect(result.get('tickets')).toEqual(['t1', 't2']);
    expect(result.get('wages')).toEqual(['w1']);
  });

  it('leaves out tables the user may not read', () => {
    const result = groupChanges(changes, (t) => t !== 'wages');
    expect([...result.keys()]).toEqual(['tickets']);
  });
});
