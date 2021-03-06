/*
Copyright 2020-2021 The Tekton Authors
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
import { connect } from 'react-redux';
import keyBy from 'lodash.keyby';
import {
  Button,
  Dropdown,
  Form,
  FormGroup,
  InlineNotification,
  TextInput
} from 'carbon-components-react';
import {
  ALL_NAMESPACES,
  generateId,
  getTitle,
  getTranslateWithId,
  urls
} from '@tektoncd/dashboard-utils';
import { KeyValueList } from '@tektoncd/dashboard-components';
import { injectIntl } from 'react-intl';
import {
  ClusterTasksDropdown,
  NamespacesDropdown,
  PipelineResourcesDropdown,
  ServiceAccountsDropdown,
  TasksDropdown
} from '..';
import { getClusterTask, getSelectedNamespace, getTask } from '../../reducers';
import { createTaskRun } from '../../api';
import { getStore } from '../../store/index';
import { isValidLabel } from '../../utils';

const clusterTaskItem = { id: 'clustertask', text: 'ClusterTask' };
const taskItem = { id: 'task', text: 'Task' };
const parseTaskInfo = (taskRef, kind, namespace) => {
  const state = getStore().getState();
  if (taskRef) {
    const task =
      kind === 'ClusterTask'
        ? getClusterTask(state, taskRef)
        : getTask(state, { name: taskRef, namespace });
    const paramSpecs = task?.spec?.params;
    const resourceSpecs = task?.spec?.resources;
    const taskError = !task;
    return { paramSpecs, resourceSpecs, taskError };
  }
  return {};
};

const initialState = {
  creating: false,
  invalidLabels: {},
  invalidNodeSelector: {},
  kind: 'Task',
  labels: [],
  namespace: '',
  nodeSelector: [],
  params: [],
  paramSpecs: [],
  resources: [],
  resourceSpecs: [],
  serviceAccount: '',
  submitError: '',
  taskError: false,
  taskRef: '',
  timeout: '60',
  validationError: false,
  validTimeout: true
};

const initialParamsState = paramSpecs => {
  if (!paramSpecs) {
    return {};
  }
  return paramSpecs.reduce(
    (acc, param) => ({ ...acc, [param.name]: param.default || '' }),
    {}
  );
};

const initialResourcesState = resourceSpecs => {
  if (!resourceSpecs) {
    return {};
  }
  const resources = {
    inputs: {},
    outputs: {}
  };
  if (resourceSpecs.inputs) {
    resources.inputs = resourceSpecs.inputs.reduce(
      (acc, res) => ({ ...acc, [res.name]: '' }),
      {}
    );
  }
  if (resourceSpecs.outputs) {
    resources.outputs = resourceSpecs.outputs.reduce(
      (acc, res) => ({ ...acc, [res.name]: '' }),
      {}
    );
  }
  return resources;
};

const itemToString = item => (item ? item.text : '');

class CreateTaskRun extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.initialState();
  }

  componentDidMount() {
    const { intl } = this.props;
    document.title = getTitle({
      page: intl.formatMessage({
        id: 'dashboard.createTaskRun.title',
        defaultMessage: 'Create TaskRun'
      })
    });
  }

  getTaskDetails() {
    const { location } = this.props;
    const urlSearchParams = new URLSearchParams(location.search);
    const kind = urlSearchParams.get('kind') || 'Task';
    const taskName = urlSearchParams.get('taskName') || '';
    return { kind, taskName };
  }

  checkFormValidation = () => {
    const {
      labels,
      namespace,
      nodeSelector,
      params,
      paramSpecs,
      resources,
      taskRef,
      timeout
    } = this.state;
    // Namespace, PipelineRef, Resources, and Params must all have values
    const validNamespace = !!namespace;
    const validTaskRef = !!taskRef;
    const validInputResources =
      !resources ||
      !resources.inputs ||
      Object.keys(resources.inputs).reduce(
        (acc, name) => acc && !!resources.inputs[name],
        true
      );
    const validOutputResources =
      !resources ||
      !resources.outputs ||
      Object.keys(resources.outputs).reduce(
        (acc, name) => acc && !!resources.outputs[name],
        true
      );

    const paramSpecMap = keyBy(paramSpecs, 'name');
    const validParams =
      !params ||
      Object.keys(params).reduce(
        (acc, name) =>
          acc &&
          (!!params[name] ||
            typeof paramSpecMap[name]?.default !== 'undefined'),
        true
      );

    // Timeout is a number and less than 1 year in minutes
    const validTimeout =
      !Number.isNaN(timeout) && timeout < 525600 && timeout.trim() !== '';
    this.setState(() => ({ validTimeout }));

    // Labels
    let validLabels = true;
    labels.forEach(label => {
      ['key', 'value'].forEach(type => {
        if (!isValidLabel(type, label[type])) {
          validLabels = false;
          this.setState(prevState => ({
            invalidLabels: {
              ...prevState.invalidLabels,
              [`${label.id}-${type}`]: true
            }
          }));
        }
      });
    });

    // Node selector
    let validNodeSelector = true;
    nodeSelector.forEach(label => {
      ['key', 'value'].forEach(type => {
        if (!isValidLabel(type, label[type])) {
          validNodeSelector = false;
          this.setState(prevState => ({
            invalidNodeSelector: {
              ...prevState.invalidNodeSelector,
              [`${label.id}-${type}`]: true
            }
          }));
        }
      });
    });

    return (
      validNamespace &&
      validTaskRef &&
      validInputResources &&
      validOutputResources &&
      validParams &&
      validTimeout &&
      validLabels &&
      validNodeSelector
    );
  };

  handleClose = () => {
    const { defaultNamespace: namespace, history } = this.props;
    const { kind, taskName } = this.getTaskDetails();
    let url = urls.taskRuns.all();
    if (taskName && namespace !== ALL_NAMESPACES) {
      url = urls.taskRuns[kind === 'ClusterTask' ? 'byClusterTask' : 'byTask']({
        namespace,
        taskName
      });
    } else if (namespace !== ALL_NAMESPACES) {
      url = urls.taskRuns.byNamespace({ namespace });
    }
    history.push(url);
  };

  handleAddLabel = prop => {
    this.setState(prevState => ({
      [prop]: [
        ...prevState[prop],
        {
          id: generateId(`label${prevState[prop].length}-`),
          key: '',
          keyPlaceholder: 'key',
          value: '',
          valuePlaceholder: 'value'
        }
      ]
    }));
  };

  handleRemoveLabel = (prop, invalidProp, index) => {
    this.setState(prevState => {
      const labels = [...prevState[prop]];
      const invalidLabels = { ...prevState[invalidProp] };
      const removedLabel = labels[index];
      labels.splice(index, 1);
      if (removedLabel.id in invalidLabels) {
        delete invalidLabels[`${removedLabel.id}-key`];
        delete invalidLabels[`${removedLabel.id}-value`];
      }
      return {
        [prop]: labels,
        [invalidProp]: invalidLabels
      };
    });
  };

  handleChangeLabel = (prop, invalidProp, { type, index, value }) => {
    this.setState(prevState => {
      const labels = [...prevState[prop]];
      labels[index][type] = value;
      const invalidLabels = { ...prevState[invalidProp] };
      if (!isValidLabel(type, value)) {
        invalidLabels[`${labels[index].id}-${type}`] = true;
      } else {
        delete invalidLabels[`${labels[index].id}-${type}`];
      }
      return {
        [prop]: labels,
        [invalidProp]: invalidLabels
      };
    });
  };

  handleNamespaceChange = ({ selectedItem }) => {
    const { text = '' } = selectedItem || {};
    if (text !== this.state.namespace) {
      this.setState(state => ({
        ...initialState,
        kind: state.kind,
        namespace: text
      }));
    }
  };

  handleKindChange = ({ selectedItem }) => {
    const { text = '' } = selectedItem || {};
    if (text !== this.state.kind) {
      this.setState({
        ...initialState,
        kind: text
      });
    }
  };

  handleParamChange = (key, value) => {
    this.setState(state => ({
      params: {
        ...state.params,
        [key]: value
      }
    }));
  };

  handleTaskChange = ({ selectedItem }) => {
    const { text } = selectedItem || {};
    if (text && text !== this.state.taskRef) {
      this.setState(state => {
        const taskInfo = parseTaskInfo(text, state.kind, state.namespace);
        return {
          ...taskInfo,
          taskRef: text,
          resources: initialResourcesState(taskInfo.resourceSpecs),
          params: initialParamsState(taskInfo.paramSpecs)
        };
      });
      return;
    }
    // Reset pipelineresources and params when no Task is selected
    this.setState(state => ({
      ...initialState,
      namespace: state.namespace
    }));
  };

  handleResourceChange = (kind, key, value) => {
    this.setState(state => {
      const next = { ...state };
      next.resources[kind][key] = value;
      return next;
    });
  };

  handleSubmit = event => {
    event.preventDefault();

    // Check form validation
    const valid = this.checkFormValidation();
    this.setState({ validationError: !valid });
    if (!valid) {
      return;
    }

    this.setState({ creating: true });

    const {
      namespace,
      nodeSelector,
      params,
      resources,
      serviceAccount,
      taskRef,
      timeout,
      labels,
      kind
    } = this.state;
    const timeoutInMins = `${timeout}m`;
    createTaskRun({
      namespace,
      kind,
      taskName: taskRef,
      resources,
      params,
      serviceAccount,
      timeout: timeoutInMins,
      labels: labels.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {}),
      nodeSelector: nodeSelector.length
        ? nodeSelector.reduce((acc, { key, value }) => {
            acc[key] = value;
            return acc;
          }, {})
        : null
    })
      .then(() => {
        const { history } = this.props;
        history.push(urls.taskRuns.byNamespace({ namespace }));
      })
      .catch(error => {
        error.response.text().then(text => {
          const statusCode = error.response.status;
          let errorMessage = `error code ${statusCode}`;
          if (text) {
            errorMessage = `${text} (error code ${statusCode})`;
          }
          this.setState({ creating: false, submitError: errorMessage });
        });
      });
  };

  initialState = () => {
    const { defaultNamespace } = this.props;
    const { kind, taskName: taskRef } = this.getTaskDetails();
    let taskName = taskRef;
    const taskInfo = parseTaskInfo(taskName, kind, defaultNamespace);
    if (taskInfo.taskError) {
      taskName = '';
    }
    return {
      ...initialState,
      ...taskInfo,
      kind,
      namespace: defaultNamespace !== ALL_NAMESPACES ? defaultNamespace : '',
      taskRef: taskName || '',
      params: initialParamsState(taskInfo.paramSpecs),
      resources: initialResourcesState(taskInfo.resourceSpecs),
      taskError: ''
    };
  };

  render() {
    const { intl } = this.props;
    const {
      creating,
      invalidLabels,
      invalidNodeSelector,
      kind,
      labels,
      namespace,
      nodeSelector,
      params,
      paramSpecs,
      resources,
      resourceSpecs,
      serviceAccount,
      submitError,
      taskError,
      taskRef,
      timeout,
      validationError,
      validTimeout
    } = this.state;

    return (
      <div className="tkn--create">
        <div className="tkn--create--heading">
          <h1>
            {intl.formatMessage({
              id: 'dashboard.createTaskRun.title',
              defaultMessage: 'Create TaskRun'
            })}
          </h1>
          <Button
            iconDescription={intl.formatMessage({
              id: 'dashboard.modal.cancelButton',
              defaultMessage: 'Cancel'
            })}
            kind="secondary"
            onClick={this.handleClose}
            disabled={creating}
          >
            {intl.formatMessage({
              id: 'dashboard.modal.cancelButton',
              defaultMessage: 'Cancel'
            })}
          </Button>
          <Button
            iconDescription={intl.formatMessage({
              id: 'dashboard.actions.createButton',
              defaultMessage: 'Create'
            })}
            onClick={this.handleSubmit}
            disabled={creating}
          >
            {intl.formatMessage({
              id: 'dashboard.actions.createButton',
              defaultMessage: 'Create'
            })}
          </Button>
        </div>
        <Form>
          {taskError && (
            <InlineNotification
              kind="error"
              title={intl.formatMessage({
                id: 'dashboard.createTaskRun.errorLoading',
                defaultMessage: 'Error retrieving Task information'
              })}
              lowContrast
            />
          )}
          {validationError && (
            <InlineNotification
              kind="error"
              title={intl.formatMessage({
                id: 'dashboard.createRun.validationError',
                defaultMessage:
                  'Please fix the fields with errors, then resubmit'
              })}
              lowContrast
            />
          )}
          {submitError !== '' && (
            <InlineNotification
              kind="error"
              title={intl.formatMessage({
                id: 'dashboard.createTaskRun.createError',
                defaultMessage: 'Error creating TaskRun'
              })}
              subtitle={submitError}
              onCloseButtonClick={() => this.setState({ submitError: '' })}
              lowContrast
            />
          )}
          <FormGroup legendText="">
            <Dropdown
              id="create-taskrun--kind-dropdown"
              titleText="Kind"
              label=""
              initialSelectedItem={
                kind === 'ClusterTask' ? clusterTaskItem : taskItem
              }
              items={[taskItem, clusterTaskItem]}
              itemToString={itemToString}
              onChange={this.handleKindChange}
              translateWithId={getTranslateWithId(intl)}
            />
            <NamespacesDropdown
              id="create-taskrun--namespaces-dropdown"
              invalid={validationError && !namespace}
              invalidText={intl.formatMessage({
                id: 'dashboard.createRun.invalidNamespace',
                defaultMessage: 'Namespace cannot be empty'
              })}
              selectedItem={namespace ? { id: namespace, text: namespace } : ''}
              onChange={this.handleNamespaceChange}
            />
            {kind === 'Task' && (
              <TasksDropdown
                id="create-taskrun--tasks-dropdown"
                namespace={namespace}
                invalid={validationError && !taskRef}
                invalidText={intl.formatMessage({
                  id: 'dashboard.createTaskRun.invalidTask',
                  defaultMessage: 'Task cannot be empty'
                })}
                selectedItem={taskRef ? { id: taskRef, text: taskRef } : ''}
                disabled={namespace === ''}
                onChange={this.handleTaskChange}
              />
            )}
            {kind === 'ClusterTask' && (
              <ClusterTasksDropdown
                id="create-taskrun--clustertasks-dropdown"
                namespace={namespace}
                invalid={validationError && !taskRef}
                invalidText={intl.formatMessage({
                  id: 'dashboard.createTaskRun.invalidTask',
                  defaultMessage: 'Task cannot be empty'
                })}
                selectedItem={taskRef ? { id: taskRef, text: taskRef } : ''}
                onChange={this.handleTaskChange}
              />
            )}
          </FormGroup>
          <FormGroup legendText="">
            <KeyValueList
              legendText={intl.formatMessage({
                id: 'dashboard.createRun.labels.legendText',
                defaultMessage: 'Labels'
              })}
              invalidText={
                <span
                  dangerouslySetInnerHTML /* eslint-disable-line react/no-danger */={{
                    __html: intl.formatMessage(
                      {
                        id: 'dashboard.createRun.label.invalidText',
                        defaultMessage:
                          'Labels must follow the {0}kubernetes labels syntax{1}.'
                      },
                      [
                        `<a
                            href="https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set"
                            target="_blank"
                            rel="noopener noreferrer"
                          >`,
                        '</a>'
                      ]
                    )
                  }}
                />
              }
              keyValues={labels}
              minKeyValues={0}
              invalidFields={invalidLabels}
              onChange={label =>
                this.handleChangeLabel('labels', 'invalidLabels', label)
              }
              onRemove={index =>
                this.handleRemoveLabel('labels', 'invalidLabels', index)
              }
              onAdd={() => this.handleAddLabel('labels')}
            />
          </FormGroup>
          <FormGroup legendText="">
            <KeyValueList
              legendText={intl.formatMessage({
                id: 'dashboard.createRun.nodeSelector.legendText',
                defaultMessage: 'Node Selector'
              })}
              invalidText={
                <span
                  dangerouslySetInnerHTML /* eslint-disable-line react/no-danger */={{
                    __html: intl.formatMessage(
                      {
                        id: 'dashboard.createRun.label.invalidText',
                        defaultMessage:
                          'Labels must follow the {0}kubernetes labels syntax{1}.'
                      },
                      [
                        `<a
                            href="https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set"
                            target="_blank"
                            rel="noopener noreferrer"
                          >`,
                        '</a>'
                      ]
                    )
                  }}
                />
              }
              keyValues={nodeSelector}
              minKeyValues={0}
              invalidFields={invalidNodeSelector}
              onChange={label =>
                this.handleChangeLabel(
                  'nodeSelector',
                  'invalidNodeSelector',
                  label
                )
              }
              onRemove={index =>
                this.handleRemoveLabel(
                  'nodeSelector',
                  'invalidNodeSelector',
                  index
                )
              }
              onAdd={() => this.handleAddLabel('nodeSelector')}
            />
          </FormGroup>
          {resourceSpecs?.inputs?.length > 0 && (
            <FormGroup legendText="Input PipelineResources">
              {resourceSpecs.inputs.map(spec => (
                <PipelineResourcesDropdown
                  id={`create-taskrun--pr-dropdown-${spec.name}`}
                  key={`create-taskrun--pr-dropdown-${spec.name}`}
                  titleText={spec.name}
                  helperText={spec.type}
                  type={spec.type}
                  namespace={namespace}
                  invalid={validationError && !resources.inputs[spec.name]}
                  invalidText={intl.formatMessage({
                    id: 'dashboard.createRun.invalidPipelineResources',
                    defaultMessage: 'PipelineResources cannot be empty'
                  })}
                  selectedItem={(() => {
                    let value = '';
                    if (resources.inputs !== undefined) {
                      value = resources.inputs[spec.name];
                    }
                    return value ? { id: value, text: value } : '';
                  })()}
                  onChange={({ selectedItem }) => {
                    const { text } = selectedItem || {};
                    this.handleResourceChange('inputs', spec.name, text);
                  }}
                />
              ))}
            </FormGroup>
          )}
          {resourceSpecs?.outputs?.length > 0 && (
            <FormGroup legendText="Output PipelineResources">
              {resourceSpecs.outputs.map(spec => (
                <PipelineResourcesDropdown
                  id={`create-taskrun--pr-dropdown-${spec.name}`}
                  key={`create-taskrun--pr-dropdown-${spec.name}`}
                  titleText={spec.name}
                  helperText={spec.type}
                  type={spec.type}
                  namespace={namespace}
                  invalid={validationError && !resources.outputs[spec.name]}
                  invalidText={intl.formatMessage({
                    id: 'dashboard.createRun.invalidPipelineResources',
                    defaultMessage: 'PipelineResources cannot be empty'
                  })}
                  selectedItem={(() => {
                    let value = '';
                    if (resources.outputs !== undefined) {
                      value = resources.outputs[spec.name];
                    }
                    return value ? { id: value, text: value } : '';
                  })()}
                  onChange={({ selectedItem }) => {
                    const { text } = selectedItem || {};
                    this.handleResourceChange('outputs', spec.name, text);
                  }}
                />
              ))}
            </FormGroup>
          )}
          {paramSpecs && paramSpecs.length !== 0 && (
            <FormGroup legendText="Params">
              {paramSpecs.map(paramSpec => (
                <TextInput
                  id={`create-taskrun--param-${paramSpec.name}`}
                  key={`create-taskrun--param-${paramSpec.name}`}
                  labelText={paramSpec.name}
                  helperText={paramSpec.description}
                  placeholder={paramSpec.default || paramSpec.name}
                  invalid={
                    validationError &&
                    !params[paramSpec.name] &&
                    paramSpec.default !== ''
                  }
                  invalidText={intl.formatMessage({
                    id: 'dashboard.createRun.invalidParams',
                    defaultMessage: 'Params cannot be empty'
                  })}
                  value={params[paramSpec.name] || ''}
                  onChange={({ target: { value } }) =>
                    this.handleParamChange(paramSpec.name, value)
                  }
                />
              ))}
            </FormGroup>
          )}
          <FormGroup
            legendText={intl.formatMessage({
              id: 'dashboard.createRun.optional.legendText',
              defaultMessage: 'Optional values'
            })}
          >
            <ServiceAccountsDropdown
              id="create-taskrun--sa-dropdown"
              titleText={intl.formatMessage({
                id: 'dashboard.serviceAccountLabel.optional',
                defaultMessage: 'ServiceAccount (optional)'
              })}
              helperText={intl.formatMessage({
                id: 'dashboard.createTaskRun.serviceAccountHelperText',
                defaultMessage:
                  'Ensure the selected ServiceAccount (or the default if none selected) has permissions for creating TaskRuns and for anything else your TaskRun interacts with.'
              })}
              namespace={namespace}
              selectedItem={
                serviceAccount
                  ? { id: serviceAccount, text: serviceAccount }
                  : ''
              }
              disabled={namespace === ''}
              onChange={({ selectedItem }) => {
                const { text } = selectedItem || {};
                this.setState({ serviceAccount: text });
              }}
            />
            <TextInput
              id="create-taskrun--timeout"
              labelText={intl.formatMessage({
                id: 'dashboard.createRun.timeoutLabel',
                defaultMessage: 'Timeout'
              })}
              helperText={intl.formatMessage({
                id: 'dashboard.createTaskRun.timeoutHelperText',
                defaultMessage: 'TaskRun timeout in minutes'
              })}
              invalid={validationError && !validTimeout}
              invalidText={intl.formatMessage({
                id: 'dashboard.createRun.invalidTimeout',
                defaultMessage:
                  'Timeout must be a valid number less than 525600'
              })}
              placeholder="60"
              value={timeout}
              onChange={({ target: { value } }) =>
                this.setState({ timeout: value })
              }
            />
          </FormGroup>
        </Form>
      </div>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    defaultNamespace: getSelectedNamespace(state)
  };
}

export default connect(mapStateToProps)(injectIntl(CreateTaskRun));
