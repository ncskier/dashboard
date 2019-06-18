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
import { storiesOf } from '@storybook/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import SpecInput from './SpecInput';

const params = [
  {
    name: 'param-1',
    description: 'param-1 description',
    default: 'param-1 default value'
  }
];
const resources = [
  {
    name: 'resource-1',
    type: 'git'
  }
];

const pipelineResourcesByNamespace = {
  default: {
    default: 'id-default',
    'pipeline-resource-1': 'id-pipeline-resource-1',
    'pipeline-resource-2': 'id-pipeline-resource-2',
    'pipeline-resource-3': 'id-pipeline-resource-3'
  }
};

const pipelineResourcesById = {
  'id-default': {
    metadata: {
      name: 'default',
      namespace: 'default',
      uid: 'id-default'
    }
  },
  'id-pipeline-resource-1': {
    metadata: {
      name: 'pipeline-resource-1',
      namespace: 'default',
      uid: 'id-pipeline-resource-1'
    }
  },
  'id-pipeline-resource-2': {
    metadata: {
      name: 'pipeline-resource-2',
      namespace: 'default',
      uid: 'id-pipeline-resource-2'
    }
  },
  'id-pipeline-resource-3': {
    metadata: {
      name: 'pipeline-resource-3',
      namespace: 'default',
      uid: 'id-pipeline-resource-3'
    }
  }
};

const namespacesByName = {
  default: ''
};

const middleware = [thunk];
const mockStore = configureStore(middleware);

storiesOf('SpecInput', module).add('default', () => {
  const store = mockStore({
    pipelineResources: {
      byId: pipelineResourcesById,
      byNamespace: pipelineResourcesByNamespace,
      isFetching: false
    },
    namespaces: {
      byName: namespacesByName,
      selected: 'default'
    }
  });
  return (
    <Provider store={store}>
      <SpecInput params={params} resources={resources} />
    </Provider>
  );
});
