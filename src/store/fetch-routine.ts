import { SagaIterator, delay } from 'redux-saga'
import { takeLatest, put, call } from 'redux-saga/effects'
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
    yield takeLatest(routine.trigger, (action: Action<Start>) => fetchSaga(action.payload))
  }

  return { trigger, fetchSaga, routine }
}

type LoopPayload<Start, Success, Error> =
  | FSA.Success<Start, Success>
  | FSA.Failure<Start, Error>

namespace poll {
  export type Params<Start, Success, Error> = {
    routine: Routine<Start, Success, Error>,
    interval: number,
  }
}

function poll<Start, Success, Error>({ interval, routine }: poll.Params<Start, Success, Error>){
  return function* pollRoutine() {
    type LoopAction = Action<LoopPayload<Start, Success, Error>>
    while (true) {
      yield call(delay, interval)
      yield takeLatest(
        [routine.done, routine.failed],
        (action: LoopAction) => routine.started(action.payload.params)
      )
    }
  }
}
namespace fetchJSONRoutine {
  export function withPolling<Start, Success, Error>(
    { pollingInterval: interval, ...params }: { pollingInterval: number } & Params<Start, Success, Error>
  ){
    let { routine, ...rest } = fetchJSONRoutine(params)
    return {
      routine,
      ...rest,
      poll: poll({ interval, routine })
    }
  }
}

export { poll }

export default fetchJSONRoutine