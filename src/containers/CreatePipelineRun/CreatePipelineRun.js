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
import { connect } from 'react-redux';
import {
  Form,
  Button,
  FormGroup,
  TextInput,
  InlineNotification
} from 'carbon-components-react';
import { PipelinesDropdown, ServiceAccountsDropdown } from '..';
import {
  getPipelineRunsErrorMessage,
  isFetchingPipelineRuns,
  getPipelines,
} from '../../reducers';
import { createPipelineRunAction } from '../../actions/pipelineRuns';
import { fetchPipelines } from '../../actions/pipelines';

// const secrets = ['default', 'git-secret', 'docker-secret', 'helm-secret'];

class CreatePipelineRun extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pipeline: '',
      serviceAccount: '',
      gitName: '',
      gitRevision: '',
      gitRepoURL: '',
      imageName: '',
      imageRegistryName: '',
      imageRepoName: '',
      helmSecret: ''
    };

    this.onPipelineChange = this.onPipelineChange.bind(this);
    this.onServiceAccountChange = this.onServiceAccountChange.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    this.props.fetchPipelines();
  }

  onPipelineChange({ selectedItem }) {
    this.setState({
      pipeline: selectedItem
    });
  }

  onServiceAccountChange({ selectedItem }) {
    this.setState({
      serviceAccount: selectedItem
    });
  }

  onInputChange(event) {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  }

  onSubmit(event) {
    console.log(event);
    const {
      pipeline,
      serviceAccount,
      gitName,
      gitRepoURL,
      gitRevision,
      imageName,
      imageRegistryName,
      imageRepoName,
      helmSecret
    } = this.state;
    const payload = {
      pipelinename: pipeline,
      serviceaccount: serviceAccount,
      repourl: gitRepoURL,
      gitresourcename: gitName,
      gitcommit: gitRevision,
      registrylocation: imageRegistryName,
      reponame: imageRepoName,
      imageresourcename: imageName,
      helmsecret: helmSecret
    };
    console.log(payload);
    this.props.createPipelineRunAction({ payload });
  }

  render() {
    let errorNotification;
    const { errorMessage } = this.props;
    if (errorMessage) {
      errorNotification = (
        <InlineNotification
          kind="error"
          title="Error creating PipelineRun"
          subtitle={errorMessage}
        />
      );
    }

    return (
      <>
        {errorNotification}
        <Form>
          <PipelinesDropdown
            id="dropdown-pipeline"
            label="Pipeline"
            selectedItem={this.state.pipeline}
            onChange={this.onPipelineChange}
          />
          <ServiceAccountsDropdown
            id="dropdown-service-account"
            label="Service Account"
            selectedItem={this.state.serviceAccount}
            onChange={this.onServiceAccountChange}
          />

          <FormGroup legendText="Git Resource">
            <TextInput
              labelText="Name"
              placeholder="git-source"
              name="gitName"
              value={this.state.gitName}
              onChange={this.onInputChange}
            />
            <TextInput
              labelText="Repository URL"
              placeholder="https://github.com/user/project"
              name="gitRepoURL"
              value={this.state.gitRepoURL}
              onChange={this.onInputChange}
            />
            <TextInput
              labelText="Revision"
              helperText="Branch name or commit ID"
              placeholder="master"
              name="gitRevision"
              value={this.state.gitRevision}
              onChange={this.onInputChange}
            />
          </FormGroup>

          <FormGroup legendText="Image Resource">
            <TextInput
              labelText="Name"
              placeholder="docker-image"
              name="imageName"
              value={this.state.imageName}
              onChange={this.onInputChange}
            />
            <TextInput
              labelText="Image Registry"
              placeholder="registryname"
              name="imageRegistryName"
              value={this.state.imageRegistryName}
              onChange={this.onInputChange}
            />
            <TextInput
              labelText="Repository name"
              placeholder="reponame"
              name="imageRepoName"
              value={this.state.imageRepoName}
              onChange={this.onInputChange}
            />
          </FormGroup>

          <FormGroup legendText="Helm Options">
            <TextInput
              labelText="Helm Secret"
              helperText="This is only required for a Helm pipeline"
              placeholder="helm-secret"
              name="helmSecret"
              value={this.state.helmSecret}
              onChange={this.onInputChange}
            />
          </FormGroup>

          <Button onClick={this.onSubmit}>Create</Button>
        </Form>
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    errorMessage: getPipelineRunsErrorMessage(state),
    isFetching: isFetchingPipelineRuns(state),
    pipelines: getPipelines(state).map(pipeline => pipeline.metadata.name)
  };
};

const mapDispatchToProps = {
  createPipelineRunAction,
  fetchPipelines
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreatePipelineRun);
