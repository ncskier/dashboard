/*
Copyright 2019-2021 The Tekton Authors
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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import isEqual from 'lodash.isequal';
import keyBy from 'lodash.keyby';
import {
  DeleteModal,
  StatusFilterDropdown,
  TaskRuns as TaskRunsList
} from '@tektoncd/dashboard-components';
import {
  ALL_NAMESPACES,
  generateId,
  getFilters,
  getStatus,
  getStatusFilter,
  getStatusFilterHandler,
  getTitle,
  isRunning,
  labels,
  runMatchesStatusFilter,
  urls
} from '@tektoncd/dashboard-utils';
import { Add16 as Add, TrashCan32 as Delete } from '@carbon/icons-react';

import { ListPageLayout } from '..';
import { sortRunsByStartTime } from '../../utils';
import { fetchTaskRuns } from '../../actions/taskRuns';

import {
  getSelectedNamespace,
  getTaskRuns,
  getTaskRunsErrorMessage,
  isFetchingTaskRuns,
  isReadOnly,
  isWebSocketConnected
} from '../../reducers';
import { cancelTaskRun, deleteTaskRun, rerunTaskRun } from '../../api';

const initialState = {
  deleteError: null,
  showDeleteModal: false,
  toBeDeleted: []
};

const { CLUSTER_TASK, TASK } = labels;

export /* istanbul ignore next */ class TaskRuns extends Component {
  state = initialState;

  componentDidMount() {
    document.title = getTitle({ page: 'TaskRuns' });
    this.fetchTaskRuns();
  }

  componentDidUpdate(prevProps) {
    const { filters, namespace, webSocketConnected } = this.props;
    const {
      filters: prevFilters,
      namespace: prevNamespace,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;

    if (namespace !== prevNamespace || !isEqual(filters, prevFilters)) {
      this.reset();
      this.fetchTaskRuns();
    } else if (webSocketConnected && prevWebSocketConnected === false) {
      this.fetchTaskRuns();
    }
  }

  getError() {
    const { error, intl } = this.props;
    if (error) {
      return {
        error,
        title: intl.formatMessage({
          id: 'dashboard.taskRuns.errorLoading',
          defaultMessage: 'Error loading TaskRuns'
        })
      };
    }

    const { deleteError } = this.state;
    if (deleteError) {
      return {
        clear: () => this.setState({ deleteError: null }),
        error: deleteError
      };
    }

    return null;
  }

  cancel = taskRun => {
    const { name, namespace } = taskRun.metadata;
    cancelTaskRun({ name, namespace });
  };

  closeDeleteModal = () => {
    this.setState({
      showDeleteModal: false,
      toBeDeleted: []
    });
  };

  deleteTask = taskRun => {
    const { name, namespace } = taskRun.metadata;
    deleteTaskRun({ name, namespace }).catch(error => {
      error.response.text().then(text => {
        const statusCode = error.response.status;
        let errorMessage = `error code ${statusCode}`;
        if (text) {
          errorMessage = `${text} (error code ${statusCode})`;
        }
        this.setState({ deleteError: errorMessage });
      });
    });
  };

  handleDelete = async () => {
    const { cancelSelection, toBeDeleted } = this.state;
    const deletions = toBeDeleted.map(resource => this.deleteTask(resource));
    this.closeDeleteModal();
    await Promise.all(deletions);
    cancelSelection();
  };

  openDeleteModal = (selectedRows, cancelSelection) => {
    const taskRunsById = keyBy(this.props.taskRuns, 'metadata.uid');
    const toBeDeleted = selectedRows.map(({ id }) => taskRunsById[id]);
    this.setState({ showDeleteModal: true, toBeDeleted, cancelSelection });
  };

  rerun = taskRun => {
    rerunTaskRun(taskRun);
  };

  taskRunActions = () => {
    const { intl } = this.props;

    if (this.props.isReadOnly) {
      return [];
    }
    return [
      {
        action: this.rerun,
        actionText: intl.formatMessage({
          id: 'dashboard.rerun.actionText',
          defaultMessage: 'Rerun'
        }),
        disable: resource => !!resource.metadata.labels?.['tekton.dev/pipeline']
      },
      {
        actionText: intl.formatMessage({
          id: 'dashboard.cancelTaskRun.actionText',
          defaultMessage: 'Stop'
        }),
        action: this.cancel,
        disable: resource => {
          const { reason, status } = getStatus(resource);
          return !isRunning(reason, status);
        },
        modalProperties: {
          heading: intl.formatMessage({
            id: 'dashboard.cancelTaskRun.heading',
            defaultMessage: 'Stop TaskRun'
          }),
          primaryButtonText: intl.formatMessage({
            id: 'dashboard.cancelTaskRun.primaryText',
            defaultMessage: 'Stop TaskRun'
          }),
          secondaryButtonText: intl.formatMessage({
            id: 'dashboard.modal.cancelButton',
            defaultMessage: 'Cancel'
          }),
          body: resource =>
            intl.formatMessage(
              {
                id: 'dashboard.cancelTaskRun.body',
                defaultMessage:
                  'Are you sure you would like to stop TaskRun {name}?'
              },
              { name: resource.metadata.name }
            )
        }
      },
      {
        actionText: intl.formatMessage({
          id: 'dashboard.actions.deleteButton',
          defaultMessage: 'Delete'
        }),
        action: this.deleteTask,
        danger: true,
        disable: resource => {
          const { reason, status } = getStatus(resource);
          return isRunning(reason, status);
        },
        hasDivider: true,
        modalProperties: {
          danger: true,
          heading: intl.formatMessage(
            {
              id: 'dashboard.deleteResources.heading',
              defaultMessage: 'Delete {kind}'
            },
            { kind: 'TaskRuns' }
          ),
          primaryButtonText: intl.formatMessage({
            id: 'dashboard.actions.deleteButton',
            defaultMessage: 'Delete'
          }),
          secondaryButtonText: intl.formatMessage({
            id: 'dashboard.modal.cancelButton',
            defaultMessage: 'Cancel'
          }),
          body: resource =>
            intl.formatMessage(
              {
                id: 'dashboard.deleteTaskRun.body',
                defaultMessage:
                  'Are you sure you would like to delete TaskRun {name}?'
              },
              { name: resource.metadata.name }
            )
        }
      }
    ];
  };

  reset() {
    this.setState(initialState);
  }

  fetchTaskRuns() {
    const { namespace, taskName, filters, kind } = this.props;

    if (kind === 'ClusterTask') {
      // TaskRuns from ClusterTask should have label 'tekton.dev/clusterTask=',
      // (and that is the filter on the page), but some taskruns might still
      // only have the old label 'tekton.dev/task='
      // So, for ClusterTasks, also fetch with the old filter:
      this.props.fetchTaskRuns({
        filters: [`${TASK}=${taskName}`]
      });
    }

    this.props.fetchTaskRuns({
      filters,
      namespace
    });
  }

  render() {
    const {
      kind,
      loading,
      namespace: selectedNamespace,
      statusFilter,
      taskName,
      taskRuns,
      intl
    } = this.props;
    const { showDeleteModal, toBeDeleted } = this.state;

    const taskRunActions = this.taskRunActions();
    sortRunsByStartTime(taskRuns);

    const toolbarButtons = this.props.isReadOnly
      ? []
      : [
          {
            onClick: () =>
              this.props.history.push(
                urls.taskRuns.create() +
                  (taskName ? `?taskName=${taskName}&kind=${kind}` : '')
              ),
            text: intl.formatMessage({
              id: 'dashboard.actions.createButton',
              defaultMessage: 'Create'
            }),
            icon: Add
          }
        ];

    const batchActionButtons = this.props.isReadOnly
      ? []
      : [
          {
            onClick: this.openDeleteModal,
            text: intl.formatMessage({
              id: 'dashboard.actions.deleteButton',
              defaultMessage: 'Delete'
            }),
            icon: Delete
          }
        ];

    const filters = (
      <StatusFilterDropdown
        id={generateId('status-filter-')}
        initialSelectedStatus={statusFilter}
        onChange={({ selectedItem }) => {
          this.props.setStatusFilter(selectedItem.id);
        }}
      />
    );

    return (
      <ListPageLayout {...this.props} error={this.getError()} title="TaskRuns">
        <TaskRunsList
          batchActionButtons={batchActionButtons}
          filters={filters}
          loading={loading && !taskRuns.length}
          selectedNamespace={selectedNamespace}
          taskRuns={taskRuns.filter(run => {
            return runMatchesStatusFilter({ run, statusFilter });
          })}
          taskRunActions={taskRunActions}
          toolbarButtons={toolbarButtons}
        />
        {showDeleteModal ? (
          <DeleteModal
            kind="TaskRuns"
            onClose={this.closeDeleteModal}
            onSubmit={this.handleDelete}
            resources={toBeDeleted}
            showNamespace={selectedNamespace === ALL_NAMESPACES}
          />
        ) : null}
      </ListPageLayout>
    );
  }
}

TaskRuns.defaultProps = {
  filters: []
};

/* istanbul ignore next */
function mapStateToProps(state, props) {
  const { namespace: namespaceParam } = props.match.params;
  const filters = getFilters(props.location);
  const statusFilter = getStatusFilter(props.location);
  const namespace = namespaceParam || getSelectedNamespace(state);

  const taskFilter = filters.find(f => f.indexOf(`${TASK}=`) !== -1) || '';
  const clusterTaskFilter =
    filters.find(f => f.indexOf(`${CLUSTER_TASK}=`) !== -1) || '';
  const kind = clusterTaskFilter ? 'ClusterTask' : 'Task';

  const taskName =
    kind === 'ClusterTask'
      ? clusterTaskFilter.replace(`${CLUSTER_TASK}=`, '')
      : taskFilter.replace(`${TASK}=`, '');

  let taskRuns = getTaskRuns(state, { filters, namespace });
  if (kind === 'ClusterTask') {
    // TaskRuns from ClusterTask should have label 'tekton.dev/clusterTask=',
    // (and that is the filter on the page), but some taskruns might still
    // only have the old label 'tekton.dev/task='
    // So, for ClusterTasks, also fetch with the old filter:
    const clusterTaskRuns = getTaskRuns(state, {
      filters: [`${TASK}=${taskName}`]
    });

    // Then merge the arrays, using a Set to prevent duplicates
    taskRuns = [...new Set([...taskRuns, ...clusterTaskRuns])];
  }

  return {
    isReadOnly: isReadOnly(state),
    error: getTaskRunsErrorMessage(state),
    loading: isFetchingTaskRuns(state),
    namespace,
    filters,
    taskName,
    kind,
    setStatusFilter: getStatusFilterHandler(props),
    statusFilter,
    taskRuns,
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchTaskRuns
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(TaskRuns));
