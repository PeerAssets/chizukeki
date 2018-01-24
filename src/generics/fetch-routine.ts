import { SagaIterator, delay } from 'redux-saga'
import { take, cancel, fork, takeLatest, put, call, cancelled } from 'redux-saga/effects'
import * as FSA from 'typescript-fsa'
import expandedRoutine, { Routine, bindAsyncAction, Meta } from './routine'

type Action<payload> = { type: string, payload }

type Params<Start, Success, Error> = {
  type: string,
  fetchJSON: (payload: Start) => Promise<Success>,
  commonMeta?: Meta
}

function fetchJSONRoutine<Start, Success, Error>({
  fetchJSON, type, commonMeta
}: Params<Start, Success, Error>) {

  let routine = expandedRoutine<Start, Success, Error>(type, commonMeta)

  const fetchSaga = bindAsyncAction(routine)(fetchJSON)

  function* trigger() {
    yield takeLatest([ routine.trigger, routine.started ], (action: Action<Start>) => fetchSaga(action.payload))
  }

  return { trigger, fetchSaga, routine }
}

type LoopPayload<Start, Success, Error> =
  | FSA.Success<Start, Success>
  | FSA.Failure<Start, Error>

namespace pollSaga {
  export type Params<Start, Success, Error> = {
    routine: Routine<Start, Success, Error>,
    interval: number,
  }
}

function pollSaga<Start, Success, Error>({ interval, routine }: pollSaga.Params<Start, Success, Error>){
  let stop = FSA.actionCreatorFactory()(routine.trigger.type + '_STOPPED')
  type LoopAction = Action<LoopPayload<Start, Success, Error>>
  function* restart(action: LoopAction){
    yield call(delay, interval)
    put(routine.started(action.payload.params))
    console.log('put!')
  }
  function* pollSaga() {
    try {
      while (true) {
        yield takeLatest([routine.done.type, routine.failed.type], restart)
      }
    } finally { /*if (yield cancelled()){ }*/ }
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
  export function withPolling<Start, Success, Error>(
    { pollingInterval: interval, ...params }: { pollingInterval: number } & Params<Start, Success, Error>
  ){
    let { routine, ...rest } = fetchJSONRoutine(params)
    let { stop, poll } = pollSaga({ interval, routine })
    routine.allTypes.push(stop.type)
    let stoppableRoutine: typeof routine & { stop: typeof stop } = Object.assign(routine, { stop })
    return {
      routine: stoppableRoutine,
      poll,
      ...rest,
    }
  }
}

export default fetchJSONRoutine