// Initialize Actions - Register all default actions on startup
// Phase 1.2 - Action Registry & Context Detection

import { actionRegistry } from './ActionRegistry';
import { getAllDefaultActions } from './defaultActions';

/**
 * Initialize the action registry with all default actions
 * This should be called once during app startup
 */
export function initializeActions(): void {
  const actions = getAllDefaultActions();

  console.log(`Registering ${actions.length} default actions...`);

  let registered = 0;
  let failed = 0;

  for (const action of actions) {
    try {
      actionRegistry.register(action);
      registered++;
    } catch (error) {
      console.error(`Failed to register action '${action.id}':`, error);
      failed++;
    }
  }

  console.log(`Action registry initialized: ${registered} registered, ${failed} failed`);

  if (failed > 0) {
    console.warn('Some actions failed to register. Check console for details.');
  }
}

/**
 * Re-initialize the action registry (useful for testing or hot-reload)
 */
export function reinitializeActions(): void {
  actionRegistry.clear();
  initializeActions();
}

/**
 * Get registration summary
 */
export function getRegistrationSummary() {
  return {
    total: actionRegistry.count,
    actions: actionRegistry.getAllActions().map((a) => ({
      id: a.id,
      label: a.label,
      category: a.category,
      priority: a.priority,
    })),
  };
}
