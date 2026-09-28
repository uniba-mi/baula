import { PathModule } from '@interfaces/study-path';
import { mergeFlexNowModulesIntoMissingModules } from './flex-now-merge.helper';

function pathModule(overrides: Partial<PathModule>): PathModule {
  return {
    acronym: 'ACR1',
    name: 'Module 1',
    ects: 5,
    status: 'open',
    notes: '',
    mgId: undefined,
    flexNowImported: false,
    semester: '2024s',
    isUserGenerated: false,
    grade: 0,
    ...overrides,
  };
}

describe('mergeFlexNowModulesIntoMissingModules', () => {
  it('updates a planned module matched by id', () => {
    const missingModules = [pathModule({ _id: 'id1', acronym: 'ACR1', status: 'open', grade: 0 })];
    const flexNowModules = [
      pathModule({ _id: 'id1', acronym: 'ACR1', status: 'passed', grade: 2, ects: 5 }),
    ];

    const { merged, addedCount, updatedCount } = mergeFlexNowModulesIntoMissingModules(
      missingModules,
      flexNowModules,
      new Set(['ACR1']),
    );

    expect(addedCount).toBe(0);
    expect(updatedCount).toBe(1);
    expect(merged.length).toBe(1);
    expect(merged[0].status).toBe('passed');
    expect(merged[0].grade).toBe(2);
    expect(merged[0].flexNowImported).toBe(true);
  });

  it('updates a planned MHB module matched by acronym+semester when no id is present', () => {
    const missingModules = [
      pathModule({ acronym: 'ACR2', semester: '2024s', isUserGenerated: false }),
    ];
    const flexNowModules = [
      pathModule({ acronym: 'ACR2', semester: '2024s', status: 'passed', grade: 1 }),
    ];

    const { merged, updatedCount } = mergeFlexNowModulesIntoMissingModules(
      missingModules,
      flexNowModules,
      new Set(['ACR2']),
    );

    expect(updatedCount).toBe(1);
    expect(merged.length).toBe(1);
    expect(merged[0].status).toBe('passed');
  });

  it('does not match a manually maintained placeholder against a FlexNow module with the same acronym', () => {
    const missingModules = [
      pathModule({
        _id: 'placeholder1',
        acronym: 'SAME',
        semester: '2024s',
        isUserGenerated: true,
        flexNowImported: false,
        name: 'Manual placeholder',
      }),
    ];
    const flexNowModules = [
      pathModule({
        acronym: 'SAME',
        semester: '2024s',
        status: 'passed',
        grade: 1,
        flexNowImported: true,
      }),
    ];

    const { merged, addedCount, updatedCount } = mergeFlexNowModulesIntoMissingModules(
      missingModules,
      flexNowModules,
      new Set(),
    );

    expect(updatedCount).toBe(0);
    expect(addedCount).toBe(1);
    expect(merged.length).toBe(2);
    expect(merged.find((m) => m.isUserGenerated)?.name).toBe('Manual placeholder');
  });

  it('matches a manually maintained placeholder against a FlexNow module when the placeholder acronym is a recognized MHB acronym', () => {
    // regression test: a placeholder entered by hand using the module's real,
    // official acronym must be recognized as the same module instead of being
    // duplicated as a second, separately-added entry
    const missingModules = [
      pathModule({
        _id: 'placeholder1',
        acronym: 'REAL1',
        semester: '2024s',
        isUserGenerated: true,
        flexNowImported: false,
        status: 'passed',
        grade: 1,
        name: 'Manual placeholder using the real acronym',
      }),
    ];
    const flexNowModules = [
      pathModule({
        acronym: 'REAL1',
        semester: '2024s',
        status: 'passed',
        grade: 1,
        flexNowImported: true,
      }),
    ];

    const { merged, addedCount, updatedCount } = mergeFlexNowModulesIntoMissingModules(
      missingModules,
      flexNowModules,
      new Set(['REAL1']),
    );

    expect(updatedCount).toBe(1);
    expect(addedCount).toBe(0);
    expect(merged.length).toBe(1);
    expect(merged[0]._id).toBe('placeholder1');
    expect(merged[0].flexNowImported).toBe(true);
  });

  it('matches an existing FlexNow placeholder against a new FlexNow module by acronym+semester', () => {
    const missingModules = [
      pathModule({
        acronym: 'FN1',
        semester: '2024s',
        isUserGenerated: true,
        flexNowImported: true,
        status: 'open',
      }),
    ];
    // real FlexNow-sourced modules always come back with flexNowImported: true
    // (set by FlexnowService.mapFnModulesToPathModules)
    const flexNowModules = [
      pathModule({
        acronym: 'FN1',
        semester: '2024s',
        status: 'passed',
        grade: 1,
        flexNowImported: true,
      }),
    ];

    const { merged, updatedCount } = mergeFlexNowModulesIntoMissingModules(
      missingModules,
      flexNowModules,
      new Set(),
    );

    expect(updatedCount).toBe(1);
    expect(merged.length).toBe(1);
    expect(merged[0].status).toBe('passed');
  });

  it('adds an unplanned MHB module as a new non-user-generated row', () => {
    const flexNowModules = [pathModule({ acronym: 'NEW1', semester: '2024s' })];

    const { merged, addedCount } = mergeFlexNowModulesIntoMissingModules(
      [],
      flexNowModules,
      new Set(['NEW1']),
    );

    expect(addedCount).toBe(1);
    expect(merged[0].isUserGenerated).toBe(false);
    expect(merged[0].flexNowImported).toBe(true);
  });

  it('adds an unplanned module as non-user-generated even when mhbAcronyms is empty', () => {
    // regression test: mhbAcronyms can legitimately be empty (e.g. during the
    // initial FlexNow import at account creation, before any MHB can be loaded)
    // without meaning the module isn't a real one - isUserGenerated must not be
    // derived from mhbAcronyms here, or the same module re-synced later (once the
    // MHB is loaded and correctly recognized) would disagree with this earlier
    // isUserGenerated:true entry and duplicate instead of matching
    const flexNowModules = [pathModule({ acronym: 'NEW2', semester: '2024s' })];

    const { merged, addedCount } = mergeFlexNowModulesIntoMissingModules(
      [],
      flexNowModules,
      new Set(),
    );

    expect(addedCount).toBe(1);
    expect(merged[0].isUserGenerated).toBe(false);
    expect(merged[0].flexNowImported).toBe(true);
  });
});
