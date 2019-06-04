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
  InlineNotification,
  ComposedModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  TextInput,
  Toggle
} from 'carbon-components-react';
import { PipelinesDropdown, ServiceAccountsDropdown } from '..';
import {
  getPipelineRunsErrorMessage,
  isFetchingPipelineRuns
} from '../../reducers';
import { createPipelineRunAction } from '../../actions/pipelineRuns';

import './CreatePipelineRun.scss';

const resourceNameRegExp = /^[-.a-z1-9]{1,253}$/;
const resourceNameInvalidText =
  'Must consist of only lower case alphanumeric characters, -, and . with at most 253 characters';
const noSpacesRegExp = /^\S*$/;
const noSpacesInvalidText = 'Must contain no spaces';
const urlRegExp = /^(http)s?(:\/\/).*$/;
const urlInvalidText = 'Must be a valid URL';

const initialState = {
  pipeline: {
    value: '',
    invalid: false
  },
  serviceAccount: {
    value: '',
    invalid: false
  },
  gitName: {
    value: '',
    invalid: false
  },
  gitRevision: {
    value: '',
    invalid: false
  },
  gitRepoURL: {
    value: '',
    invalid: false
  },
  imageName: {
    value: '',
    invalid: false
  },
  imageRegistryName: {
    value: '',
    invalid: false
  },
  imageRepoName: {
    value: '',
    invalid: false
  },
  helmPipeline: {
    value: false,
    invalid: false
  },
  helmSecret: {
    value: '',
    invalid: false
  },
  submit: false,
  submitValidationError: false
};

const formValidation = {
  pipeline: {
    required: true
  },
  serviceAccount: {
    required: true
  },
  gitName: {
    required: false,
    regexp: resourceNameRegExp
  },
  gitRepoURL: {
    required: false,
    regexp: urlRegExp
  },
  gitRevision: {
    required: false,
    regexp: noSpacesRegExp
  },
  imageName: {
    required: false,
    regexp: resourceNameRegExp
  },
  imageRegistryName: {
    required: false,
    regexp: noSpacesRegExp
  },
  imageRepoName: {
    required: false,
    regexp: noSpacesRegExp
  },
  helmPipeline: {
    required: false
  },
  helmSecret: {
    required: false,
    regexp: resourceNameRegExp
  }
};

class CreatePipelineRun extends React.Component {
  constructor(props) {
    super(props);

    this.state = initialState;

    this.onPipelineChange = this.onPipelineChange.bind(this);
    this.onServiceAccountChange = this.onServiceAccountChange.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onHelmToggleChange = this.onHelmToggleChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onClose = this.onClose.bind(this);
    this.reset = this.reset.bind(this);
    this.getPipeline = this.getPipeline.bind(this);
    this.checkFormValidation = this.checkFormValidation.bind(this);
    this.checkValidation = this.checkValidation.bind(this);
  }

  onPipelineChange({ selectedItem }) {
    this.checkValidation('pipeline', selectedItem);
    this.setState(state => {
      return {
        pipeline: {
          ...state.pipeline,
          value: selectedItem.text
        }
      };
    });
  }

  onServiceAccountChange({ selectedItem }) {
    this.checkValidation('serviceAccount', selectedItem);
    this.setState(state => {
      return {
        serviceAccount: {
          ...state.serviceAccount,
          value: selectedItem.text
        }
      };
    });
  }

  onInputChange(event) {
    const { name, value } = event.target;
    this.checkValidation(name, value);
    this.setState(state => {
      return {
        [name]: {
          ...state[name],
          value
        }
      };
    });
  }

  onHelmToggleChange(value) {
    this.checkValidation('helmPipeline', value);
    this.setState(state => {
      return {
        helmPipeline: {
          ...state.helmPipeline,
          value
        }
      };
    });
  }

  onSubmit(event) {
    event.preventDefault();

    if (!this.checkFormValidation()) {
      this.setState({
        submitValidationError: true
      });
      document
        .getElementById('create-pipelinerun--header')
        .scrollIntoView({ behavior: 'smooth' });
      return;
    }
    this.setState({
      submitValidationError: false
    });

    const payload = {
      pipelinename: this.getPipeline(),
      serviceaccount: this.state.serviceAccount.value,
      repourl: this.state.gitRepoURL.value,
      gitresourcename: this.state.gitName.value,
      gitcommit: this.state.gitRevision.value,
      registrylocation: this.state.imageRegistryName.value,
      reponame: this.state.imageRepoName.value,
      imageresourcename: this.state.imageName.value,
      pipelineruntype: this.state.helmPipeline.value ? 'helm' : '',
      helmsecret: this.state.helmSecret.value
    };
    const promise = this.props.createPipelineRunAction({ payload });
    promise.then(headers => {
      if (headers) {
        const url = headers.get('Content-Location');
        const pipelineRunName = url.substring(url.lastIndexOf('/') + 1);
        const finalURL = `/pipelines/${
          this.state.pipeline.value
        }/runs/${pipelineRunName}`;
        this.reset();
        this.props.onSuccess({ name: pipelineRunName, url: finalURL });
      } else {
        document
          .getElementById('create-pipelinerun--header')
          .scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  onClose() {
    this.reset();
    this.props.onClose();
  }

  getPipeline() {
    return this.props.pipelineName || this.state.pipeline.value;
  }

  checkValidation(key, value) {
    const { required, regexp } = formValidation[key];
    const invalid =
      (required && value === '') ||
      (!!regexp && !regexp.test(value) && !(!required && value === ''));
    this.setState(state => {
      return {
        [key]: {
          ...state[key],
          invalid
        }
      };
    });
    return !invalid;
  }

  checkFormValidation() {
    const reducer = (acc, key) => {
      if (key === 'pipeline') {
        return this.checkValidation(key, this.getPipeline()) && acc;
      }
      return this.checkValidation(key, this.state[key].value) && acc;
    };
    return Object.keys(formValidation).reduce(reducer, true);
  }

  reset() {
    this.setState(() => {
      return initialState;
    });
  }

  render() {
    const { pipelineName, errorMessage, open } = this.props;

    return (
      <>
        <Form onSubmit={this.onSubmit}>
          <ComposedModal
            className="create-pipelinerun"
            onClose={this.onClose}
            open={open}
          >
            <ModalHeader
              id="create-pipelinerun--header"
              title="Create PipelineRun"
              label={pipelineName}
              closeModal={this.onClose}
            />
            <ModalBody>
              {(() => {
                if (errorMessage) {
                  return (
                    <InlineNotification
                      kind="error"
                      title="Error creating PipelineRun"
                      subtitle={errorMessage}
                    />
                  );
                }
                return null;
              })()}
              {(() => {
                if (this.state.submitValidationError) {
                  return (
                    <InlineNotification
                      kind="error"
                      title="Unable to submit"
                      subtitle="Please fix the fields with errors"
                    />
                  );
                }
                return null;
              })()}
              {(() => {
                const disabled = !!pipelineName;
                return (
                  <PipelinesDropdown
                    id="dropdown-pipeline"
                    selectedItem={
                      this.getPipeline() !== ''
                        ? { text: this.getPipeline() }
                        : ''
                    }
                    onChange={this.onPipelineChange}
                    disabled={disabled}
                    invalid={this.state.pipeline.invalid}
                    invalidText="Pipeline cannot be empty"
                  />
                );
              })()}
              <ServiceAccountsDropdown
                id="dropdown-service-account"
                selectedItem={
                  this.state.serviceAccount.value !== ''
                    ? { text: this.state.serviceAccount.value }
                    : ''
                }
                onChange={this.onServiceAccountChange}
                invalid={this.state.serviceAccount.invalid}
                invalidText="Service Account cannot be empty"
              />

              <FormGroup legendText="Git Resource (optional)">
                <TextInput
                  id="git-resource-name-text-input"
                  labelText="Name"
                  placeholder="git-source"
                  name="gitName"
                  invalidText={resourceNameInvalidText}
                  invalid={this.state.gitName.invalid}
                  value={this.state.gitName.value}
                  onChange={this.onInputChange}
                />
                <TextInput
                  id="git-repo-url-text-input"
                  labelText="Repository URL"
                  placeholder="https://github.com/user/project"
                  name="gitRepoURL"
                  invalidText={urlInvalidText}
                  invalid={this.state.gitRepoURL.invalid}
                  value={this.state.gitRepoURL.value}
                  onChange={this.onInputChange}
                />
                <TextInput
                  id="git-revision-text-input"
                  labelText="Revision"
                  helperText="Branch name or commit ID"
                  placeholder="master"
                  name="gitRevision"
                  invalidText={noSpacesInvalidText}
                  invalid={this.state.gitRevision.invalid}
                  value={this.state.gitRevision.value}
                  onChange={this.onInputChange}
                />
              </FormGroup>

              <FormGroup legendText="Image Resource (optional)">
                <TextInput
                  id="image-name-text-input"
                  labelText="Name"
                  placeholder="docker-image"
                  name="imageName"
                  invalidText={resourceNameInvalidText}
                  invalid={this.state.imageName.invalid}
                  value={this.state.imageName.value}
                  onChange={this.onInputChange}
                />
                <TextInput
                  id="image-registry-text-input"
                  labelText="Registry"
                  placeholder="dockerhubusername"
                  name="imageRegistryName"
                  invalidText={noSpacesInvalidText}
                  invalid={this.state.imageRegistryName.invalid}
                  value={this.state.imageRegistryName.value}
                  onChange={this.onInputChange}
                />
                <TextInput
                  id="image-repo-text-input"
                  labelText="Repository"
                  placeholder="reponame"
                  name="imageRepoName"
                  invalidText={noSpacesInvalidText}
                  invalid={this.state.imageRepoName.invalid}
                  value={this.state.imageRepoName.value}
                  onChange={this.onInputChange}
                />
              </FormGroup>

              <FormGroup legendText="Helm (optional)">
                <Toggle
                  id="helm-pipeline-toggle"
                  data-testid="helm-pipeline-toggle"
                  labelText="Toggle On when using a Helm pipeline"
                  name="helmPipeline"
                  toggled={this.state.helmPipeline.value}
                  onToggle={this.onHelmToggleChange}
                />
                <TextInput
                  id="helm-secret-text-input"
                  labelText="Secret"
                  placeholder="helm-secret"
                  name="helmSecret"
                  invalidText={resourceNameInvalidText}
                  invalid={this.state.helmSecret.invalid}
                  value={this.state.helmSecret.value}
                  onChange={this.onInputChange}
                />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button kind="secondary" onClick={this.onClose}>
                Cancel
              </Button>
              <Button kind="primary" type="submit">
                Submit
              </Button>
            </ModalFooter>
          </ComposedModal>
        </Form>
      </>
    );
  }
}

CreatePipelineRun.defaultProps = {
  open: false,
  onClose: () => {},
  onSuccess: () => {}
};

const mapStateToProps = state => {
  return {
    errorMessage: getPipelineRunsErrorMessage(state),
    isFetching: isFetchingPipelineRuns(state)
  };
};

const mapDispatchToProps = {
  createPipelineRunAction
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreatePipelineRun);
