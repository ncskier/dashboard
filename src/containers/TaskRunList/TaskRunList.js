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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  InlineNotification,
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListSkeleton,
  StructuredListWrapper
} from 'carbon-components-react';

import { ALL_NAMESPACES } from '../../constants';
import { getStatus, getStatusIcon } from '../../utils';
import { fetchTaskRuns } from '../../actions/taskRuns';

import {
  getSelectedNamespace,
  getTaskRuns,
  getTaskRunsErrorMessage,
  isFetchingTaskRuns
} from '../../reducers';

export /* istanbul ignore next */ class TaskRunList extends Component {
  componentDidMount() {
    this.props.fetchTaskRuns();
  }

  componentDidUpdate(prevProps) {
    const { namespace } = this.props;
    const { namespace: prevNamespace } = prevProps;

    if (namespace !== prevNamespace) {
      this.props.fetchTaskRuns();
    }
  }

  render() {
    const {
      error,
      loading,
      namespace: selectedNamespace,
      taskRuns
    } = this.props;

    return (
      <>
        {(() => {
          if (loading) {
            return <StructuredListSkeleton border />;
          }

          if (error) {
            return (
              <InlineNotification
                kind="error"
                title="Error loading task runs"
                subtitle={JSON.stringify(error)}
              />
            );
          }

          return (
            <StructuredListWrapper border selection>
              <StructuredListHead>
                <StructuredListRow head>
                  <StructuredListCell head>Task Run</StructuredListCell>
                  <StructuredListCell head>Task</StructuredListCell>
                  {selectedNamespace === ALL_NAMESPACES && (
                    <StructuredListCell head>Namespace</StructuredListCell>
                  )}
                  <StructuredListCell head>Status</StructuredListCell>
                  <StructuredListCell head>
                    Last Transition Time
                  </StructuredListCell>
                </StructuredListRow>
              </StructuredListHead>
              <StructuredListBody>
                {!taskRuns.length && (
                  <StructuredListRow>
                    <StructuredListCell>
                      <span>No pipeline runs</span>
                    </StructuredListCell>
                  </StructuredListRow>
                )}
                {taskRuns.map(taskRun => {
                  const { name, namespace } = taskRun.metadata;
                  const taskRefName = taskRun.spec.taskRef
                    ? taskRun.spec.taskRef.name
                    : '';
                  const { lastTransitionTime, reason, status } = getStatus(
                    taskRun
                  );
                  let message;
                  if (!taskRun.status.conditions) {
                    message = '';
                  } else if (
                    !taskRun.status.conditions[0].message &&
                    taskRun.status.conditions[0].status
                  ) {
                    message = 'All Steps have completed executing';
                  } else {
                    message = taskRun.status.conditions[0].message; // eslint-disable-line
                  }

                  return (
                    <StructuredListRow
                      className="definition"
                      key={taskRun.metadata.uid}
                    >
                      <StructuredListCell>
                        <Link to={`/namespaces/${namespace}/taskruns/${name}`}>
                          {name}
                        </Link>
                      </StructuredListCell>
                      <StructuredListCell>
                        <Link
                          to={`/namespaces/${namespace}/tasks/${taskRefName}/runs`}
                        >
                          {taskRefName}
                        </Link>
                      </StructuredListCell>
                      {selectedNamespace === ALL_NAMESPACES && (
                        <StructuredListCell>{namespace}</StructuredListCell>
                      )}
                      <StructuredListCell
                        className="status"
                        data-reason={reason}
                        data-status={status}
                      >
                        {getStatusIcon({ reason, status })}
                        {message}
                      </StructuredListCell>
                      <StructuredListCell>
                        {lastTransitionTime}
                      </StructuredListCell>
                    </StructuredListRow>
                  );
                })}
              </StructuredListBody>
            </StructuredListWrapper>
          );
        })()}
      </>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state, props) {
  const { namespace: namespaceParam } = props.match.params;
  const namespace = namespaceParam || getSelectedNamespace(state);

  return {
    error: getTaskRunsErrorMessage(state),
    loading: isFetchingTaskRuns(state),
    namespace,
    taskRuns: getTaskRuns(state, { namespace })
  };
}

const mapDispatchToProps = {
  fetchTaskRuns
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TaskRunList);
