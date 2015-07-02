import promiseMiddleware from '../';
import { spy } from 'sinon';

function noop() {}

describe('promiseMiddleware', () => {
  let baseDispatch;
  let dispatch;
  let foobar;
  let err;

  beforeEach(() => {
    baseDispatch = spy();
    dispatch = promiseMiddleware(baseDispatch);
    foobar = { foo: 'bar' };
    err = new Error();
  });

  it('handles Flux standard actions', async () => {
    await dispatch({
      type: 'ACTION_TYPE',
      body: Promise.resolve(foobar)
    });

    expect(baseDispatch.calledOnce).to.be.true;
    expect(baseDispatch.firstCall.args[0]).to.deep.equal({
      type: 'ACTION_TYPE',
      body: foobar,
      status: 'success'
    });

    await dispatch({
      type: 'ACTION_TYPE',
      body: Promise.reject(err)
    }).catch(noop);

    expect(baseDispatch.calledTwice).to.be.true;
    expect(baseDispatch.secondCall.args[0]).to.deep.equal({
      type: 'ACTION_TYPE',
      body: err,
      status: 'error'
    });
  });

  it('handles promises', async () => {
    await dispatch(Promise.resolve(foobar));
    expect(baseDispatch.calledOnce).to.be.true;
    expect(baseDispatch.firstCall.args[0]).to.equal(foobar);

    await expect(dispatch(Promise.reject(err))).to.eventually.be.rejectedWith(err);
  });

  it('ignores non-promises', async () => {
    dispatch(foobar);
    expect(baseDispatch.calledOnce).to.be.true;
    expect(baseDispatch.firstCall.args[0]).to.equal(foobar);

    dispatch({ type: 'ACTION_TYPE', body: foobar });
    expect(baseDispatch.calledTwice).to.be.true;
    expect(baseDispatch.secondCall.args[0]).to.deep.equal({
      type: 'ACTION_TYPE',
      body: foobar
    });
  });
});
