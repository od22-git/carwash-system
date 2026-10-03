import { useState } from 'react';
import { errorMessage } from './error-message';

interface ActionState {
  busy: boolean;
  error: string | null;
  done: boolean;
}

const IDLE: ActionState = { busy: false, error: null, done: false };

/** Runs a save/submit and tracks busy, error and success for the form. */
export function useAction() {
  const [state, setState] = useState<ActionState>(IDLE);

  async function run(action: () => Promise<unknown>): Promise<boolean> {
    setState({ busy: true, error: null, done: false });
    try {
      await action();
      setState({ busy: false, error: null, done: true });
      return true;
    } catch (error) {
      setState({ busy: false, error: errorMessage(error), done: false });
      return false;
    }
  }

  return { ...state, run, reset: () => setState(IDLE) };
}
