import * as fromModuleOverview from './module-overview.actions';
import { Module } from '../../../../interfaces/module';

const mockModule = new Module(
  'mockId',
  1,
  'MOCK',
  'Mock Module',
  'Mock content',
  'Mock skills',
  'Mock additional info',
  'Mock prior knowledge',
  5,
  'Mock term',
  'Mock recTerm',
  'Mock duration',
  'Mock chair',
  null,
  [],
  {}
);

describe('ModuleInteractionActions', () => {
  it('should create Set selected Module action', () => {
    const module: Module = mockModule;
    const action = fromModuleOverview.ModuleInteractionActions.setSelectedModule({ module });
    expect(action.type).toBe('[Module Interaction] Set selected Module');
    expect(action.module).toEqual(module);
  });

  it('should create Unset selected Module action', () => {
    const action = fromModuleOverview.ModuleInteractionActions.unsetSelectedModule();
    expect(action.type).toBe('[Module Interaction] Unset selected Module');
  });

  it('should create Set hover Module action', () => {
    const module: Module = mockModule;
    const action = fromModuleOverview.ModuleInteractionActions.setHoverModule({ module });
    expect(action.type).toBe('[Module Interaction] Set hover Module');
    expect(action.module).toEqual(module);
  });

  it('should create Unset hover Module action', () => {
    const action = fromModuleOverview.ModuleInteractionActions.unsetHoverModule();
    expect(action.type).toBe('[Module Interaction] Unset hover Module');
  });
});
