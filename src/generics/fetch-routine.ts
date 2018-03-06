import { SagaIterator, delay } from 'redux-saga'
import { take, cancel, fork, all, takeLatest, put, call, cancelled } from 'redux-saga/effects'
import * as FSA from 'typescript-fsa'
import expandedRoutine, { Switch, Routine, bindAsyncAction, Meta } from './routine'
import { Omit } from './utils'

type Action<payload> = { type: string, payload }

type Params<Start, Success, Failure> = {
  type: string,
  fetchJSON: (payload: Start) => Promise<Success>,
  commonMeta?: Meta
}

function fetchJSONRoutine<Start, Success, Failure>({
  fetchJSON, type, commonMeta
}: Params<Start, Success, Failure>) {

  let routine = expandedRoutine<Start, Success, Failure>(type, commonMeta)

  const fetchSaga = bindAsyncAction(routine)(fetchJSON)

  function* triggerSaga(){
    yield takeLatest(
      routine.trigger.type,
      (action: Action<Start>) => put(routine.started(action.payload))
    )
  }

  function* start(){
    yield takeLatest(
      routine.started.type,
      (action: Action<Start>) => fetchSaga(action.payload)
    )
  }

  function* trigger() {
    yield all([
      start(),
      triggerSaga()
    ])
  }

  return { trigger, fetchSaga, routine }
}

type LoopPayload<Start, Success, Failure> =
  | FSA.Success<Start, Success>
  | FSA.Failure<Start, Failure>

namespace pollSaga {
  export type Params<Start, Success, Failure> = {
    routine: Routine<Start, Success, Failure>,
    interval: number,
  }
}

function pollSaga<Start, Success, Failure>({ interval, routine }: pollSaga.Params<Start, Success, Failure>){
  let stop = FSA.actionCreatorFactory()(routine.trigger.type + '_STOPPED')
  type LoopAction = Action<LoopPayload<Start, Success, Failure>>
  function* restart(action: LoopAction){
    yield call(delay, interval)
    yield put(routine.started(action.payload.params))
  }
  function* pollSaga() {
    try {
      yield takeLatest([routine.done.type, routine.failed.type], restart)
    } finally {
      /*if (yield cancelled()){ }*/
    }
  }
  function* saga() {
    while (yield take(routine.trigger)) {
      // starts the task in the background
      const polling = yield fork(pollSaga)

      // wait for the user stop action
      yield take(stop)

      // user cancelled the sync
      yield cancel(polling)
    }
  }
  return {
    poll: saga,
    stop
  }
}
namespace fetchJSONRoutine {
  export function withPolling<Start, Success, Failure>(
    { pollingInterval: interval, ...params }: { pollingInterval: number } & Params<Start, Success, Failure>
  ){
    let { routine, ...rest } = fetchJSONRoutine(params)
    let { stop, poll } = pollSaga({ interval, routine })
    routine.allTypes.push(stop.type)
    let _switch = routine.switch
    function extendedSwitch<Return>(
      action: FSA.AnyAction,
      { stopped, ...cases }: Switch.Cases<Start, Success, Failure, Return> & {
        stopped: Return | Switch.IgnorePayload<Return>
      }
    ) : Return | void {
      return _switch(action, cases) || (
        (FSA.isType(action, stop)) ?
          (Switch.isUncallable<Return>(stopped) ?
            stopped :
            stopped()
          ) :
          undefined
      )
    }
    let stoppableRoutine = {
      ...routine,
      stop,
      switch: extendedSwitch,
      stage(action: FSA.AnyAction | string | undefined) {
        if (action === undefined) { return }
        action = typeof (action) === 'string' ? { type: action } : action
        return extendedSwitch<'STARTED' | 'DONE' | 'FAILED' | 'STOPPED' | void>(
          action,
          {
            started: 'STARTED',
            done: 'DONE',
            failed: 'FAILED',
            stopped: 'STOPPED'
          }
        )
      }
    }
    type StoppableRoutine = Omit<typeof stoppableRoutine, 'currentStage'>
      & { currentStage?: Routine.Stage | 'STOPPED' };

    return {
      routine: stoppableRoutine as StoppableRoutine,
      poll,
      ...rest,
    }
  }
}

export default fetchJSONRoutine
