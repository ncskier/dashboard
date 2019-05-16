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

// import Link from 'react-router-dom';
import {
  ToastNotification,
  TextInput,
  FormLabel,
  Button,
  Tooltip
} from 'carbon-components-react';
import { connect } from 'react-redux';

import '../../components/Definitions/Definitions.scss';
import './ImportResources.scss';

import { createPipelineRun } from '../../api';
import ServiceAccountsDropdown from '../ServiceAccountsDropdown';
import { getSelectedNamespace } from '../../reducers';

class ImportResources extends Component {
  constructor(props) {
    super(props);
    this.state = {
      repositoryURL: '',
      serviceAccount: '',
      submitSuccess: false,
      logsURL: ''
    };
  }

  handleServiceAccount(data) {
    this.setState({
      serviceAccount: data.selectedItem
    });
  }

  handleTextInput(event) {
    const identifier = event.target.name;
    const inputValue = event.target.value;
    this.setState({
      [identifier]: inputValue
    });
  }

  handleSubmit(event) {
    const { namespace } = this.props;
    const pipelinename = 'pipeline0';
    const gitresourcename = 'git-source';
    const gitcommit = 'master';
    const repourl = this.state.repositoryURL;
    const serviceaccount = this.state.serviceAccount;
    const payload = {
      pipelinename,
      serviceaccount,
      gitresourcename,
      gitcommit,
      repourl
    };

    createPipelineRun(payload, namespace).then(headers => {
      const logsURL = headers.get('Content-Location');
      const trimmedLogsURL = logsURL.substring(logsURL.lastIndexOf('/') + 1);
      const finalURL = '#/pipelines/pipeline0/runs/'.concat(trimmedLogsURL);
      this.setState({
        logsURL: finalURL
      });
      this.setState({
        submitSuccess: true
      });
    });
    event.preventDefault();
  }

  render() {
    this.handleServiceAccount = this.handleServiceAccount.bind(this);
    this.handleTextInput = this.handleTextInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    return (
      <div className="Outer">
        <div className="row">
          <h1 className="ImportHeader">
            Import Tekton resources from repository
          </h1>
        </div>
        <div className="row">
          <div className="firstColumn">
            <FormLabel>
              Repository URL
              <Tooltip triggerText="">
                Represents the location of the YAML definitions to be applied
              </Tooltip>
            </FormLabel>
          </div>
          <div className="column">
            <TextInput
              name="repositoryURL"
              value={this.state.repositoryURL}
              onChange={this.handleTextInput}
            />
          </div>
        </div>
        <div className="row">
          <div className="firstColumn">
            <FormLabel>
              Service Account
              <Tooltip triggerText="">
                Represents the SA that the PipelineRun applying resources will
                run under
              </Tooltip>
            </FormLabel>
          </div>
          <div className="column">
            <div className="dropdownHalf">
              <ServiceAccountsDropdown />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="firstColumn"> </div>
          <div className="column">
            <Button kind="primary" onClick={this.handleSubmit}>
              Import and Apply
            </Button>
          </div>
        </div>
        <div className="row">
          <div className="firstColumn"> </div>
          <div className="column">
            {this.state.submitSuccess && (
              <ToastNotification
                kind="success"
                title="Triggered PipelineRun to apply Tekton resources"
                subtitle=""
                caption={
                  <a href={this.state.logsURL}> View logs for this run </a>
                }
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    namespace: getSelectedNamespace(state)
  };
}

export default connect(mapStateToProps)(ImportResources);
