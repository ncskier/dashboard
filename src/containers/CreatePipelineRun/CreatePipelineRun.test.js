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
import { render, fireEvent, wait } from 'react-testing-library';

import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import CreatePipelineRun from './CreatePipelineRun';
import * as API from '../../api';

const invalidK8sName = 'invalidName';
const invalidK8sNameRegExp = /must consist of only lower case alphanumeric characters, -, and . with at most 253 characters/i;
const invalidNoSpacesName = 'invalid name';
const invalidNoSpacesNameRegExp = /must contain no spaces/i;

const namespacesTestStore = {
  namespaces: {
    selected: 'default',
    byName: {
      default: ''
    },
    isFetching: false
  }
};
const pipelinesTestStore = {
  pipelines: {
    byNamespace: {
      default: {
        'pipeline-1': 'id-pipeline-1'
      }
    },
    byId: {
      'id-pipeline-1': {
        metadata: {
          name: 'pipeline-1',
          namespace: 'default',
          uid: 'id-pipeline-1'
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
const middleware = [thunk];
const mockStore = configureStore(middleware);
const testStore = mockStore({
  ...namespacesTestStore,
  ...pipelinesTestStore,
  ...serviceAccountsTestStore,
  pipelineRuns: {
    errorMessage: '',
    isFetching: false,
    byId: {},
    byNamespace: {}
  }
});

beforeEach(() => {
  jest.resetAllMocks();
  jest
    .spyOn(API, 'getServiceAccounts')
    .mockImplementation(() => serviceAccountsTestStore.serviceAccounts.byId);
  jest
    .spyOn(API, 'getPipelines')
    .mockImplementation(() => pipelinesTestStore.pipelines.byId);
  jest.spyOn(API, 'getPipelineRuns').mockImplementation(() => {});
});

const fillRequiredFields = getByText => {
  // Set Pipeline
  fireEvent.click(getByText(/select pipeline/i));
  fireEvent.click(getByText(/pipeline-1/i));
  // Set Service Account
  fireEvent.click(getByText(/select service account/i));
  fireEvent.click(getByText(/service-account-1/i));
};

const testValidateTextInputField = (
  placeholderTextRegExp,
  textValue,
  invalidTextRegExp
) => {
  const scrollIntoViewMock = jest.fn();
  const { getByText, getByPlaceholderText, queryByText } = render(
    <Provider store={testStore}>
      <CreatePipelineRun open />
    </Provider>
  );
  document.getElementById(
    'create-pipelinerun--header'
  ).scrollIntoView = scrollIntoViewMock;
  fillRequiredFields(getByText);
  // Set invalid text input
  fireEvent.change(getByPlaceholderText(placeholderTextRegExp), {
    target: { value: textValue }
  });
  expect(queryByText(invalidTextRegExp)).toBeTruthy();
  fireEvent.click(getByText(/submit/i));
  expect(queryByText(/unable to submit/i)).toBeTruthy();
  // Set back to valid
  fireEvent.change(getByPlaceholderText(placeholderTextRegExp), {
    target: { value: '' }
  });
  expect(queryByText(invalidTextRegExp)).toBeFalsy();
};

it('CreatePipelineRun renders', async () => {
  const { queryByText } = render(
    <Provider store={testStore}>
      <CreatePipelineRun open />
    </Provider>
  );
  expect(queryByText(/create pipelinerun/i)).toBeTruthy();
});

it('CreatePipelineRun renders controlled pipeline selection', async () => {
  const { queryByText } = render(
    <Provider store={testStore}>
      <CreatePipelineRun open pipelineName="pipeline-1" />
    </Provider>
  );
  expect(queryByText(/create pipelinerun/i)).toBeTruthy();
  expect(queryByText(/pipeline-1/i)).toBeTruthy();
});

it('CreatePipelineRun validates form pipeline', async () => {
  const scrollIntoViewMock = jest.fn();
  const { getByText, queryByText } = render(
    <Provider store={testStore}>
      <CreatePipelineRun open />
    </Provider>
  );
  document.getElementById(
    'create-pipelinerun--header'
  ).scrollIntoView = scrollIntoViewMock;
  fireEvent.click(getByText(/select service account/i));
  fireEvent.click(getByText(/service-account-1/i));
  expect(queryByText(/service-account-1/i)).toBeTruthy();
  fireEvent.click(getByText(/submit/i));
  expect(queryByText(/unable to submit/i)).toBeTruthy();
  expect(queryByText(/pipeline cannot be empty/i)).toBeTruthy();
});

it('CreatePipelineRun validates form service account', async () => {
  const scrollIntoViewMock = jest.fn();
  const { getByText, queryByText } = render(
    <Provider store={testStore}>
      <CreatePipelineRun open />
    </Provider>
  );
  document.getElementById(
    'create-pipelinerun--header'
  ).scrollIntoView = scrollIntoViewMock;
  fireEvent.click(getByText(/select pipeline/i));
  fireEvent.click(getByText(/pipeline-1/i));
  expect(queryByText(/pipeline-1/i)).toBeTruthy();
  fireEvent.click(getByText(/submit/i));
  expect(queryByText(/unable to submit/i)).toBeTruthy();
  expect(queryByText(/service account cannot be empty/i)).toBeTruthy();
});

it('CreatePipelineRun validates form git resource name', async () => {
  testValidateTextInputField(
    /git-source/i,
    invalidK8sName,
    invalidK8sNameRegExp
  );
});

it('CreatePipelineRun validates form git repo url', async () => {
  testValidateTextInputField(
    /https:\/\/github.com\/user\/project/i,
    'I am not a URL',
    /must be a valid url/i
  );
});

it('CreatePipelineRun validates form git revision', async () => {
  testValidateTextInputField(
    /master/i,
    invalidNoSpacesName,
    invalidNoSpacesNameRegExp
  );
});

it('CreatePipelineRun validates form image name', async () => {
  testValidateTextInputField(
    /docker-image/i,
    invalidK8sName,
    invalidK8sNameRegExp
  );
});

it('CreatePipelineRun validates form image registry', async () => {
  testValidateTextInputField(
    /dockerhubusername/i,
    invalidNoSpacesName,
    invalidNoSpacesNameRegExp
  );
});

it('CreatePipelineRun validates form image repo', async () => {
  testValidateTextInputField(
    /reponame/i,
    invalidNoSpacesName,
    invalidNoSpacesNameRegExp
  );
});

it('CreatePipelineRun validates form helm secret', async () => {
  testValidateTextInputField(
    /helm-secret/i,
    invalidK8sName,
    invalidK8sNameRegExp
  );
});

it('CreatePipelineRun submits form', async () => {
  const { getByText, getByTestId } = render(
    <Provider store={testStore}>
      <CreatePipelineRun open />
    </Provider>
  );
  fillRequiredFields(getByText);
  // Set Helm Pipeline
  fireEvent.click(getByTestId('helm-pipeline-toggle'));
  // Submit
  jest.spyOn(API, 'createPipelineRun').mockImplementation(() =>
    Promise.resolve({
      get: () => {
        return '/v1/namespaces/default/pipelineruns//tekton-pipeline-run';
      }
    })
  );
  fireEvent.click(getByText(/submit/i));
});

it('CreatePipelineRun handles error state', async () => {
  const testErrorStore = mockStore({
    ...namespacesTestStore,
    ...pipelinesTestStore,
    ...serviceAccountsTestStore,
    pipelineRuns: {
      errorMessage: 'test error message',
      isFetching: false
    }
  });
  const { getByText, queryByText } = render(
    <Provider store={testErrorStore}>
      <CreatePipelineRun open />
    </Provider>
  );
  expect(queryByText(/error creating pipelinerun/i)).toBeTruthy();
  expect(queryByText(/test error message/i)).toBeTruthy();

  document.getElementById(
    'create-pipelinerun--header'
  ).scrollIntoView = jest.fn();
  // Fill required fields
  fillRequiredFields(getByText);
  // Submit create request
  jest
    .spyOn(API, 'createPipelineRun')
    .mockImplementation(() => Promise.resolve());
  fireEvent.click(getByText(/submit/i));
});

it('CreatePipelineRun handles onSuccess event', async () => {
  const onSuccess = jest.fn();
  const { getByText } = render(
    <Provider store={testStore}>
      <CreatePipelineRun open onSuccess={onSuccess} />
    </Provider>
  );
  // Fill required fields
  fillRequiredFields(getByText);

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

it('CreatePipelineRun handles onClose event', async () => {
  const onClose = jest.fn();
  const { getByText } = render(
    <Provider store={testStore}>
      <CreatePipelineRun open onClose={onClose} />
    </Provider>
  );
  fireEvent.click(getByText(/cancel/i));
  expect(onClose).toHaveBeenCalledTimes(1);
});
