/*
Copyright 2019 The Tekton Authors
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react';
import { fireEvent, render, wait, waitForElement } from 'react-testing-library';

import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import CreatePipelineRun from './CreatePipelineRun';
import * as API from '../../api';
import * as store from '../../store/index';
import { ALL_NAMESPACES } from '../../constants';

const allNamespacesTestStore = {
  namespaces: {
    selected: ALL_NAMESPACES,
    byName: {
      default: '',
      'namespace-1': ''
    },
    isFetching: false
  }
};
const defaultNamespacesTestStore = {
  namespaces: {
    selected: 'default',
    byName: {
      default: '',
      'namespace-1': ''
    },
    isFetching: false
  }
};
const pipelinesTestStore = {
  pipelines: {
    byNamespace: {
      default: {
        'pipeline-1': 'id-pipeline-1',
        'pipeline-2': 'id-pipeline-2'
      }
    },
    byId: {
      'id-pipeline-1': {
        metadata: {
          name: 'pipeline-1',
          namespace: 'default',
          uid: 'id-pipeline-1'
        },
        spec: {
          resources: [
            { name: 'resource-1', type: 'type-1' },
            { name: 'resource-2', type: 'type-2' }
          ],
          params: [
            { name: 'param-1' },
            {
              name: 'param-2',
              description: 'description-1',
              default: 'default-2'
            }
          ]
        }
      },
      'id-pipeline-2': {
        metadata: {
          name: 'pipeline-2',
          namespace: 'default',
          uid: 'id-pipeline-2'
        },
        spec: {
          resources: [],
          params: []
        }
      }
    },
    isFetching: false
  }
};
const serviceAccountsTestStore = {
  serviceAccounts: {
    byNamespace: {
      default: {
        'service-account-1': 'id-service-account-1'
      }
    },
    byId: {
      'id-service-account-1': {
        metadata: {
          name: 'service-account-1',
          namespace: 'default',
          uid: 'id-service-account-1'
        }
      }
    },
    isFetching: false
  }
};
const pipelineResourcesTestStore = {
  pipelineResources: {
    errorMessage: '',
    isFetching: false,
    byId: {
      'id-pipeline-resource-1': {
        metadata: { name: 'pipeline-resource-1' },
        spec: { type: 'type-1' }
      },
      'id-pipeline-resource-2': {
        metadata: { name: 'pipeline-resource-2' },
        spec: { type: 'type-2' }
      }
    },
    byNamespace: {
      default: {
        'pipeline-resource-1': 'id-pipeline-resource-1',
        'pipeline-resource-2': 'id-pipeline-resource-2'
      }
    }
  }
};
const pipelineRunsTestStore = {
  pipelineRuns: {
    errorMessage: '',
    isFetching: false,
    byId: {},
    byNamespace: {}
  }
};
const middleware = [thunk];
const mockStore = configureStore(middleware);
const testStoreAllNamespaces = mockStore({
  ...allNamespacesTestStore,
  ...pipelinesTestStore,
  ...serviceAccountsTestStore,
  ...pipelineResourcesTestStore,
  ...pipelineRunsTestStore
});
const testStoreDefaultNamespace = mockStore({
  ...defaultNamespacesTestStore,
  ...pipelinesTestStore,
  ...serviceAccountsTestStore,
  ...pipelineResourcesTestStore,
  ...pipelineRunsTestStore
});

beforeEach(() => {
  jest.resetAllMocks();
  jest
    .spyOn(API, 'getServiceAccounts')
    .mockImplementation(() => serviceAccountsTestStore.serviceAccounts.byId);
  jest
    .spyOn(API, 'getPipelines')
    .mockImplementation(() => pipelinesTestStore.pipelines.byId);
  jest
    .spyOn(API, 'getPipelineResources')
    .mockImplementation(pipelineResourcesTestStore.pipelineResources.byId);
  jest
    .spyOn(API, 'getPipelineRuns')
    .mockImplementation(pipelineRunsTestStore.pipelineRuns.byId);
});

const fillNamespace = getByText => {
  fireEvent.click(getByText(/select namespace/i));
  fireEvent.click(getByText(/default/i));
};

const fillPipeline = getByText => {
  fireEvent.click(getByText(/select pipeline/i));
  fireEvent.click(getByText(/pipeline-1/i));
};

const fillServiceAccount = getByText => {
  fireEvent.click(getByText(/select service account/i));
  fireEvent.click(getByText(/service-account-1/i));
};

const fillRequiredFields = getByText => {
  fillNamespace(getByText);
  fillPipeline(getByText);
  fillServiceAccount(getByText);
};

const fillPipelineResources = getByText => {
  fireEvent.click(getByText(/select pipeline resource/i));
  fireEvent.click(getByText(/pipeline-resource-1/i));

  fireEvent.click(getByText(/select pipeline resource/i));
  fireEvent.click(getByText(/pipeline-resource-2/i));
};

const fillPipelineParams = getByDisplayValue => {
  fireEvent.change(getByDisplayValue(/default-2/i), {
    target: { value: 'param-value-2' }
  });
};

// const testValidateTextInputField = (
//   placeholderTextRegExp,
//   textValue,
//   invalidTextRegExp
// ) => {
//   const { getByText, getByPlaceholderText, queryByText } = render(
//     <Provider store={testStoreAllNamespaces}>
//       <CreatePipelineRun open />
//     </Provider>
//   );
//   fillRequiredFields(getByText);
//   // Set invalid text input
//   fireEvent.change(getByPlaceholderText(placeholderTextRegExp), {
//     target: { value: textValue }
//   });
//   expect(queryByText(invalidTextRegExp)).toBeTruthy();
//   fireEvent.click(getByText(/submit/i));
//   expect(queryByText(/unable to submit/i)).toBeTruthy();
//   // Set back to valid
//   fireEvent.change(getByPlaceholderText(placeholderTextRegExp), {
//     target: { value: '' }
//   });
//   expect(queryByText(invalidTextRegExp)).toBeFalsy();
// };

it('CreatePipelineRun renders', () => {
  const { queryByText } = render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open />
    </Provider>
  );
  expect(queryByText(/create pipelinerun/i)).toBeTruthy();
});

it('CreatePipelineRun renders controlled pipeline selection', () => {
  const { container, queryByText } = render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open pipelineRef="pipeline-1" namespace="default" />
    </Provider>
  );
  expect(queryByText(/pipeline-1/i)).toBeTruthy();
  expect(queryByText(/default/i)).toBeTruthy();
  render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open pipelineRef="pipeline-2" namespace="default" />
    </Provider>,
    { container }
  );
  expect(queryByText(/pipeline-2/i)).toBeTruthy();
  expect(queryByText(/default/i)).toBeTruthy();
});

it('CreatePipelineRun renders controlled namespace', () => {
  const { container, queryByText } = render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open namespace="default" />
    </Provider>
  );
  expect(queryByText(/default/i)).toBeTruthy();
  render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open namespace="namespace-1" />
    </Provider>,
    { container }
  );
  expect(queryByText(/namespace-1/i)).toBeTruthy();
  render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open />
    </Provider>,
    { container }
  );
  expect(queryByText(/select namespace/i)).toBeTruthy();
});

it('CreatePipelineRun resets pipeline and service account when namespace changes', () => {
  jest
    .spyOn(store, 'getStore')
    .mockImplementation(() => testStoreAllNamespaces);
  const { getByText, getAllByText } = render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open />
    </Provider>
  );
  fireEvent.click(getByText(/select namespace/i));
  fireEvent.click(getByText(/default/i));
  fillPipeline(getByText);
  fillServiceAccount(getByText);
  expect(getByText(/pipeline-1/i));
  expect(getByText(/service-account-1/i));
  // No change when the same namespace is selected
  fireEvent.click(getByText(/default/i));
  fireEvent.click(getAllByText(/default/i)[1]);
  expect(getByText(/pipeline-1/i));
  expect(getByText(/service-account-1/i));
  // Resets when a different namespace is selected
  fireEvent.click(getByText(/default/i));
  fireEvent.click(getByText(/namespace-1/i));
  expect(getByText(/no pipelines found in the 'namespace-1' namespace/i));
  expect(
    getByText(/no service accounts found in the 'namespace-1' namespace/i)
  );
});

// TODO: test resources & params fields
it('CreatePipelineRun renders pipeline resources and params', () => {
  jest
    .spyOn(store, 'getStore')
    .mockImplementation(() => testStoreDefaultNamespace);
  const { getByText, queryByText, queryByDisplayValue } = render(
    <Provider store={testStoreDefaultNamespace}>
      <CreatePipelineRun open />
    </Provider>
  );
  fillNamespace(getByText);
  fillPipeline(getByText);
  pipelinesTestStore.pipelines.byId['id-pipeline-1'].spec.resources.forEach(
    resource => {
      expect(queryByText(new RegExp(resource.name, 'i'))).toBeTruthy();
      expect(queryByText(new RegExp(resource.type, 'i'))).toBeTruthy();
    }
  );
  pipelinesTestStore.pipelines.byId['id-pipeline-1'].spec.params.forEach(
    param => {
      expect(queryByText(new RegExp(param.name, 'i'))).toBeTruthy();
      if (param.description) {
        expect(queryByText(new RegExp(param.description, 'i'))).toBeTruthy();
      }
      if (param.default) {
        expect(
          queryByDisplayValue(new RegExp(param.default, 'i'))
        ).toBeTruthy();
      }
    }
  );
});

it('CreatePipelineRun validates form namespace', () => {
  jest
    .spyOn(store, 'getStore')
    .mockImplementation(() => testStoreAllNamespaces);
  const { getByText, queryByText } = render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open />
    </Provider>
  );
  fillServiceAccount(getByText);
  fillPipeline(getByText);
  fireEvent.click(getByText(/submit/i));
  expect(queryByText(/unable to submit/i)).toBeTruthy();
  expect(queryByText(/namespace cannot be empty/i)).toBeTruthy();
});

it('CreatePipelineRun validates form pipeline', () => {
  jest
    .spyOn(store, 'getStore')
    .mockImplementation(() => testStoreAllNamespaces);
  const { getByText, queryByText } = render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open />
    </Provider>
  );
  fillNamespace(getByText);
  fillServiceAccount(getByText);
  fireEvent.click(getByText(/submit/i));
  expect(queryByText(/unable to submit/i)).toBeTruthy();
  expect(queryByText(/pipeline cannot be empty/i)).toBeTruthy();
});

it('CreatePipelineRun validates form service account', () => {
  jest
    .spyOn(store, 'getStore')
    .mockImplementation(() => testStoreAllNamespaces);
  const { getByText, queryByText } = render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open />
    </Provider>
  );
  fillNamespace(getByText);
  fillPipeline(getByText);
  fireEvent.click(getByText(/submit/i));
  expect(queryByText(/unable to submit/i)).toBeTruthy();
  expect(queryByText(/service account cannot be empty/i)).toBeTruthy();
});

it('CreatePipelineRun handles error getting pipeline', () => {
  jest.spyOn(API, 'getPipeline').mockImplementation(() => null);
  jest
    .spyOn(store, 'getStore')
    .mockImplementation(() => testStoreAllNamespaces);
  const { getByText } = render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open pipelineRef="pipeline-1" />
    </Provider>
  );
  expect(getByText(/error retrieving pipeline information/i)).toBeTruthy();
});

it('CreatePipelineRun submits form', async () => {
  jest
    .spyOn(store, 'getStore')
    .mockImplementation(() => testStoreAllNamespaces);
  // const formValues = {
  //   pipelinename: 'pipeline-1',
  //   serviceaccount: 'service-account-1'
  // };
  const { getByText } = render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open />
    </Provider>
  );
  fillRequiredFields(getByText);
  // Submit
  const createPipelineRun = jest
    .spyOn(API, 'createPipelineRun')
    .mockImplementation(() =>
      Promise.resolve({
        get: () => {
          return '/v1/namespaces/default/pipelineruns//tekton-pipeline-run';
        }
      })
    );
  fireEvent.click(getByText(/submit/i));
  await wait(() => expect(createPipelineRun).toHaveBeenCalledTimes(1));
  // TODO check form values
  // await wait(() =>
  //   expect(createPipelineRun).toHaveBeenCalledWith(formValues, 'default')
  // );
});

it('CreatePipelineRun handles error state', async () => {
  jest
    .spyOn(store, 'getStore')
    .mockImplementation(() => testStoreAllNamespaces);
  const { getByText } = render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open />
    </Provider>
  );
  // Fill required fields
  fillRequiredFields(getByText);
  // Submit create request
  const createPipelineRunResponseMock = {
    response: { status: 400, text: () => Promise.resolve('test error message') }
  };
  jest
    .spyOn(API, 'createPipelineRun')
    .mockImplementation(() => Promise.reject(createPipelineRunResponseMock));
  fireEvent.click(getByText(/submit/i));
  await waitForElement(() => getByText(/error creating pipelinerun/i));
  await waitForElement(() => getByText(/test error message/i));
});

it('CreatePipelineRun handles error state 400', async () => {
  jest
    .spyOn(store, 'getStore')
    .mockImplementation(() => testStoreAllNamespaces);
  const { getByText } = render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open />
    </Provider>
  );
  // Fill required fields
  fillRequiredFields(getByText);
  // Submit create request
  const createPipelineRunResponseMock = {
    response: { status: 400, text: () => Promise.resolve('') }
  };
  jest
    .spyOn(API, 'createPipelineRun')
    .mockImplementation(() => Promise.reject(createPipelineRunResponseMock));
  fireEvent.click(getByText(/submit/i));
  await waitForElement(() => getByText(/error creating pipelinerun/i));
  await waitForElement(() => getByText(/bad request/i));
});

it('CreatePipelineRun handles error state 412', async () => {
  jest
    .spyOn(store, 'getStore')
    .mockImplementation(() => testStoreAllNamespaces);
  const { getByText } = render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open />
    </Provider>
  );
  // Fill required fields
  fillRequiredFields(getByText);
  // Submit create request
  const createPipelineRunResponseMock = {
    response: { status: 412, text: () => Promise.resolve('') }
  };
  jest
    .spyOn(API, 'createPipelineRun')
    .mockImplementation(() => Promise.reject(createPipelineRunResponseMock));
  fireEvent.click(getByText(/submit/i));
  await waitForElement(() => getByText(/error creating pipelinerun/i));
  await waitForElement(() => getByText(/pipeline not found/i));
});

it('CreatePipelineRun handles error state abnormal code', async () => {
  jest
    .spyOn(store, 'getStore')
    .mockImplementation(() => testStoreAllNamespaces);
  const { getByText } = render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open />
    </Provider>
  );
  // Fill required fields
  fillRequiredFields(getByText);
  // Submit create request
  const createPipelineRunResponseMock = {
    response: { status: 0, text: () => Promise.resolve('') }
  };
  jest
    .spyOn(API, 'createPipelineRun')
    .mockImplementation(() => Promise.reject(createPipelineRunResponseMock));
  fireEvent.click(getByText(/submit/i));
  await waitForElement(() => getByText(/error creating pipelinerun/i));
  await waitForElement(() => getByText(/error code 0/i));
});

it('CreatePipelineRun handles onSuccess event', async () => {
  jest
    .spyOn(store, 'getStore')
    .mockImplementation(() => testStoreAllNamespaces);
  const onSuccess = jest.fn();
  const { getByText, getByDisplayValue } = render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open onSuccess={onSuccess} />
    </Provider>
  );
  // Fill required fields
  fillRequiredFields(getByText);
  // Fill pipeline spec
  fillPipelineResources(getByText);
  fillPipelineParams(getByDisplayValue);

  // Submit create request
  jest.spyOn(API, 'createPipelineRun').mockImplementation(() =>
    Promise.resolve({
      get: () => {
        return '/v1/namespaces/default/pipelineruns//tekton-pipeline-run';
      }
    })
  );
  fireEvent.click(getByText(/submit/i));
  await wait(() => expect(onSuccess).toHaveBeenCalledTimes(1));
});

it('CreatePipelineRun handles onClose event', () => {
  const onClose = jest.fn();
  const { getByText } = render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open onClose={onClose} />
    </Provider>
  );
  fireEvent.click(getByText(/cancel/i));
  expect(onClose).toHaveBeenCalledTimes(1);
});
