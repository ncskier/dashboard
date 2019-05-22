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
import { fireEvent, render } from 'react-testing-library';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import PipelinesDropdown from './PipelinesDropdown';
import * as API from '../../api';

const props = {
  id: 'pipelines-dropdown'
};

const pipelinesByNamespace = {
  default: {
    'pipeline-1': 'id-pipeline-1',
    'pipeline-2': 'id-pipeline-2'
  },
  green: {
    'pipeline-3': 'id-pipeline-3'
  }
};

const pipelinesById = {
  'id-pipeline-1': {
    metadata: {
      name: 'pipeline-1',
      namespace: 'default',
      uid: 'id-pipeline-1'
    }
  },
  'id-pipeline-2': {
    metadata: {
      name: 'pipeline-2',
      namespace: 'default',
      uid: 'id-pipeline-2'
    }
  },
  'id-pipeline-3': {
    metadata: {
      name: 'pipeline-3',
      namespace: 'green',
      uid: 'id-pipeline-3'
    }
  }
};

const namespacesByName = {
  default: '',
  green: '',
  blue: ''
};

const initialTextRegExp = new RegExp('select pipeline', 'i');

const middleware = [thunk];
const mockStore = configureStore(middleware);

jest.spyOn(API, 'getPipelines').mockImplementation(() => pipelinesById);

it('PipelinesDropdown renders items based on Redux state', () => {
  const store = mockStore({
    pipelines: {
      byId: pipelinesById,
      byNamespace: pipelinesByNamespace,
      isFetching: false
    },
    namespaces: {
      byName: namespacesByName,
      selected: 'default'
    }
  });
  const { getByText, queryByText } = render(
    <Provider store={store}>
      <PipelinesDropdown {...props} />
    </Provider>
  );
  fireEvent.click(getByText(initialTextRegExp));
  Object.keys(pipelinesByNamespace.default).forEach(item => {
    const re = new RegExp(item, 'i');
    expect(queryByText(re)).toBeTruthy();
  });
  fireEvent.click(getByText(/pipeline-1/i));
  Object.keys(pipelinesByNamespace.default).forEach(item => {
    if (item !== 'pipeline-1') {
      const re = new RegExp(item, 'i');
      expect(queryByText(re)).toBeFalsy();
    }
  });
  expect(queryByText(/pipeline-1/i)).toBeTruthy();
  expect(queryByText(initialTextRegExp)).toBeFalsy();
});

it('PipelinesDropdown renders selected item', () => {
  const store = mockStore({
    pipelines: {
      byId: pipelinesById,
      byNamespace: pipelinesByNamespace,
      isFetching: false
    },
    namespaces: {
      byName: namespacesByName,
      selected: 'default'
    }
  });
  const { queryByText } = render(
    <Provider store={store}>
      <PipelinesDropdown {...props} selectedItem={{ text: 'pipeline-1' }} />
    </Provider>
  );
  expect(queryByText(/pipeline-1/i)).toBeTruthy();
});

it('PipelinesDropdown renders items based on Redux state when namespace changes', () => {
  const store = mockStore({
    pipelines: {
      byId: pipelinesById,
      byNamespace: pipelinesByNamespace,
      isFetching: false
    },
    namespaces: {
      byName: namespacesByName,
      selected: 'default'
    }
  });
  const { container, getByText, queryByText } = render(
    <Provider store={store}>
      <PipelinesDropdown {...props} />
    </Provider>
  );
  fireEvent.click(getByText(initialTextRegExp));
  Object.keys(pipelinesByNamespace.default).forEach(item => {
    const re = new RegExp(item, 'i');
    expect(queryByText(re)).toBeTruthy();
  });
  fireEvent.click(getByText('pipeline-1'));
  expect(queryByText(/pipeline-1/i)).toBeTruthy();
  expect(queryByText(initialTextRegExp)).toBeFalsy();

  // Change selected namespace to verify the Pipelines Dropdown updates items accordingly
  // selected item 'pipeline-1' should be reset to ''
  const newStore = mockStore({
    pipelines: {
      byId: pipelinesById,
      byNamespace: pipelinesByNamespace,
      isFetching: false
    },
    namespaces: {
      byName: namespacesByName,
      selected: 'green'
    }
  });
  render(
    <Provider store={newStore}>
      <PipelinesDropdown {...props} />
    </Provider>,
    { container }
  );
  fireEvent.click(getByText(initialTextRegExp));
  Object.keys(pipelinesByNamespace.green).forEach(item => {
    const re = new RegExp(item, 'i');
    expect(queryByText(re)).toBeTruthy();
  });
  Object.keys(pipelinesByNamespace.default).forEach(item => {
    const re = new RegExp(item, 'i');
    expect(queryByText(re)).toBeFalsy();
  });
  fireEvent.click(getByText('pipeline-3'));
  expect(queryByText(/pipeline-3/i)).toBeTruthy();
  expect(queryByText(initialTextRegExp)).toBeFalsy();
});

it('PipelinesDropdown renders loading skeleton based on Redux state', () => {
  const store = mockStore({
    pipelines: {
      byId: pipelinesById,
      byNamespace: pipelinesByNamespace,
      isFetching: true
    },
    namespaces: {
      byName: namespacesByName,
      selected: 'default'
    }
  });
  const { queryByText } = render(
    <Provider store={store}>
      <PipelinesDropdown {...props} fetchPipelines={() => {}} />
    </Provider>
  );
  expect(queryByText(initialTextRegExp)).toBeFalsy();
});

it('PipelinesDropdown handles onChange event', () => {
  const store = mockStore({
    pipelines: {
      byId: pipelinesById,
      byNamespace: pipelinesByNamespace,
      isFetching: false
    },
    namespaces: {
      byName: namespacesByName,
      selected: 'default'
    }
  });
  const onChange = jest.fn();
  const { getByText } = render(
    <Provider store={store}>
      <PipelinesDropdown {...props} onChange={onChange} />
    </Provider>
  );
  fireEvent.click(getByText(initialTextRegExp));
  fireEvent.click(getByText(/pipeline-1/i));
  expect(onChange).toHaveBeenCalledTimes(1);
});

it('PipelinesDropdown handles onChange event when namespace changes', () => {
  const storeDefaultNamespace = mockStore({
    pipelines: {
      byId: pipelinesById,
      byNamespace: pipelinesByNamespace,
      isFetching: false
    },
    namespaces: {
      byName: namespacesByName,
      selected: 'default'
    }
  });
  const onChange = jest.fn();
  const { container, getByText } = render(
    <Provider store={storeDefaultNamespace}>
      <PipelinesDropdown {...props} onChange={onChange} />
    </Provider>
  );
  fireEvent.click(getByText(initialTextRegExp));
  fireEvent.click(getByText(/pipeline-1/i));

  // Should call onChange because selected item was 'default' and now it will be reset to ''
  const storeGreenNamespace = mockStore({
    pipelines: {
      byId: pipelinesById,
      byNamespace: pipelinesByNamespace,
      isFetching: false
    },
    namespaces: {
      byName: namespacesByName,
      selected: 'green'
    }
  });
  render(
    <Provider store={storeGreenNamespace}>
      <PipelinesDropdown {...props} onChange={onChange} />
    </Provider>,
    { container }
  );

  // Should not call onChange because selected item was '' and now it will be reset to ''
  const storeBlueNamespace = mockStore({
    pipelines: {
      byId: pipelinesById,
      byNamespace: pipelinesByNamespace,
      isFetching: false
    },
    namespaces: {
      byName: namespacesByName,
      selected: 'blue'
    }
  });
  render(
    <Provider store={storeBlueNamespace}>
      <PipelinesDropdown {...props} onChange={onChange} />
    </Provider>,
    { container }
  );
  expect(onChange).toHaveBeenCalledTimes(2);
});
