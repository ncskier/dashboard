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
  FormGroup,
  InlineNotification,
  Modal,
  TextInput
} from 'carbon-components-react';
import {
  NamespacesDropdown,
  PipelineResourcesDropdown,
  PipelinesDropdown
  //   ServiceAccountsDropdown
} from '..';
import { getPipeline } from '../../reducers';
// import { createPipelineRun } from '../../api';
import { getStore } from '../../store/index';

// import { ALL_NAMESPACES } from '../../constants';
import './CreatePipelineRun.scss';

const NAMESPACE = 'namespace';
const PIPELINE_REF = 'pipelineRef';
const RESOURCE_SPECS = 'resourceSpecs';
const PARAM_SPECS = 'paramSpecs';
const PIPELINE_ERROR = 'pipelineError';
const DISABLED = 'disabled';

const parsePipelineInfo = (state, pipelineRef, namespace) => {
  if (pipelineRef) {
    let resourceSpecs;
    let paramSpecs;
    const pipeline = getPipeline(state, { name: pipelineRef, namespace });
    if (pipeline) {
      ({ resources: resourceSpecs, params: paramSpecs } = pipeline.spec);
    }
    const pipelineError = !pipeline;
    return {
      [RESOURCE_SPECS]: resourceSpecs,
      [PARAM_SPECS]: paramSpecs,
      [PIPELINE_ERROR]: pipelineError
    };
  }
  return {};
};

const initialPipelineInfoState = () => {
  return {
    [NAMESPACE]: '',
    [PIPELINE_REF]: '',
    [RESOURCE_SPECS]: [],
    [PARAM_SPECS]: [],
    [PIPELINE_ERROR]: false
  };
};

const initialParamsState = paramSpecs => {
  if (!paramSpecs) {
    return {};
  }
  const paramsReducer = (acc, param) => ({
    ...acc,
    [param.name]: param.default || ''
  });
  return paramSpecs.reduce(paramsReducer, {});
};

const initialResourcesState = resourceSpecs => {
  if (!resourceSpecs) {
    return {};
  }
  const resourcesReducer = (acc, resource) => ({
    ...acc,
    [resource.name]: ''
  });
  return resourceSpecs.reduce(resourcesReducer, {});
};

// const formValidation = {
//   namespace: {
//     required: true
//   },
//   pipeline: {
//     required: true
//   },
//   serviceAccount: {
//     required: true
//   }
// };

// const initialResourcesState = resourcesSpec => {
//   if (!resourcesSpec) {
//     return {};
//   }
//   const resourcesReducer = (acc, resource) => ({
//     ...acc,
//     [resource.name]: ''
//   });
//   return resourcesSpec.reduce(resourcesReducer, {});
// };

// const initialParamsState = paramsSpec => {
//   if (!paramsSpec) {
//     return {};
//   }
//   const paramsReducer = (acc, param) => ({
//     ...acc,
//     [param.name]: param.default || ''
//   });
//   return paramsSpec.reduce(paramsReducer, {});
// };

class CreatePipelineRun extends React.Component {
  constructor(props) {
    super(props);

    // console.log('CONSTRUCTOR');

    // this.handleChange = this.handleChange.bind(this);
    // this.handlePipelineChange = this.handlePipelineChange.bind(this);
    // this.handleNamespaceChange = this.handleNamespaceChange.bind(this);
    // this.handleResourceChange = this.handleResourceChange.bind(this);
    // this.handleParamChange = this.handleParamChange.bind(this);
    // this.handleSubmit = this.handleSubmit.bind(this);
    // this.handleClose = this.handleClose.bind(this);
    // this.reset = this.reset.bind(this);
    // this.resetPipeline = this.resetPipeline.bind(this);
    // this.resetNamespace = this.resetNamespace.bind(this);
    // this.checkFormValidation = this.checkFormValidation.bind(this);
    // this.checkValidation = this.checkValidation.bind(this);
    // this.initialState = this.initialState.bind(this);

    this.checkFormValidation = this.checkFormValidation.bind(this);
    this.checkItemValidation = this.checkItemValidation.bind(this);
    this.getPipelineInfo = this.getPipelineInfo.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleNamespaceChange = this.handleNamespaceChange.bind(this);
    this.handleParamChange = this.handleParamChange.bind(this);
    this.handlePipelineChange = this.handlePipelineChange.bind(this);
    this.handleResourceChange = this.handleResourceChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.initialState = this.initialState.bind(this);
    this.resetForm = this.resetForm.bind(this);
    this.resetResourcesState = this.resetResourcesState.bind(this);
    this.resetParamsState = this.resetParamsState.bind(this);

    this.state = {};
    this.state = this.initialState({ props });
  }

  componentDidUpdate(prevProps) {
    // Catch instances when the Pipeline is loaded after the constructor is called
    if (this.props[RESOURCE_SPECS] !== prevProps[RESOURCE_SPECS]) {
      this.resetResourcesState();
    }
    if (this.props[PARAM_SPECS] !== prevProps[PARAM_SPECS]) {
      this.resetParamsState();
    }
  }

  getPipelineInfo(key, { state = this.state, props = this.props } = {}) {
    if (key === DISABLED) {
      // Disable pipeline info selection when pipelineRef is supplied
      return !!props[PIPELINE_REF];
    }
    // Use props when pipelineRef is supplied
    return props[PIPELINE_REF] ? props[key] : state[key];
  }

  checkFormValidation() {
    // Namespace and PipelineRef must have values
    const validNamespace = this.checkItemValidation(
      NAMESPACE,
      this.getPipelineInfo(NAMESPACE)
    );
    const validPipelineRef = this.checkItemValidation(
      PIPELINE_REF,
      this.getPipelineInfo(PIPELINE_REF)
    );
    return validNamespace && validPipelineRef;
  }

  checkItemValidation(key, value) {
    const invalid = !value || value === '';
    this.setState(state => ({
      invalid: {
        ...state.invalid,
        [key]: invalid
      }
    }));
    return !invalid;
  }

  handleClose() {
    this.resetForm();
    this.props.onClose();
  }

  handleNamespaceChange({ selectedItem: { text } }) {
    // Reset pipeline when namespace changes
    this.setState({
      ...initialPipelineInfoState(),
      [NAMESPACE]: text
    });
    this.checkItemValidation(NAMESPACE, text);
  }

  handleParamChange(key, value) {
    this.setState(state => ({
      params: {
        ...state.params,
        [key]: value
      }
    }));
  }

  handlePipelineChange({ selectedItem: { text } }) {
    this.setState((state, props) => {
      const pipelineInfo = parsePipelineInfo(
        getStore().getState(),
        text,
        this.getPipelineInfo(NAMESPACE, { state, props })
      );
      return {
        [PIPELINE_REF]: text,
        ...pipelineInfo,
        resources: initialResourcesState(pipelineInfo[RESOURCE_SPECS]),
        params: initialParamsState(pipelineInfo[PARAM_SPECS])
      };
    });
    this.checkItemValidation(PIPELINE_REF, text);
  }

  handleResourceChange(key, value) {
    this.setState(state => ({
      resources: {
        ...state.resources,
        [key]: value
      }
    }));
  }

  handleSubmit(event) {
    event.preventDefault();

    // Check form validation
    const valid = this.checkFormValidation();
    this.setState({
      validationError: !valid
    });
    if (!valid) {
      return;
    }

    // Send API request to create PipelineRun
    const pipelineRef = this.getPipelineInfo(PIPELINE_REF);
    const payload = {
      metadata: {
        name: `${pipelineRef}-run-${Date.now()}`
      },
      spec: {
        pipelineRef: {
          name: pipelineRef
        },
        resources: Object.keys(this.state.resources).map(name => ({
          name,
          resourceRef: { name: this.state.resources[name] }
        })),
        params: Object.keys(this.state.params).map(name => ({
          name,
          value: this.state.params[name]
        })),
        serviceAccount: this.state.serviceAccount
      }
    };
    // TODO: waiting for backend API endpoint to create arbitrary PipelineRun
    // const promise = applyPipelineRunFromExistingSpec(
    //   payload,
    //   this.state.namespace.value
    // );
    // const promise = createPipelineRun(payload, pipelineRef);
    // promise
    //   .then(headers => {
    //     const url = headers.get('Content-Location');
    //     const pipelineRunName = url.substring(url.lastIndexOf('/') + 1);
    //     const finalURL = `/namespaces/${this.state.pipeline.value}/pipelines/${
    //       this.state.pipeline.value
    //     }/runs/${pipelineRunName}`;
    //     this.reset();
    //     this.props.onSuccess({ name: pipelineRunName, url: finalURL });
    //   })
    //   .catch(error => {
    //     error.response.text().then(text => {
    //       let errorMessage = text;
    //       if (text === '') {
    //         const statusCode = error.response.status;
    //         switch (statusCode) {
    //           case 400:
    //             errorMessage = 'bad request';
    //             break;
    //           case 412:
    //             errorMessage = 'pipeline not found';
    //             break;
    //           default:
    //             errorMessage = `error code ${statusCode}`;
    //         }
    //       }
    //       this.setState({ errorMessage });
    //     });
    //   });

    console.log('submit');
    console.log(payload);
  }

  initialState({ props = this.props } = {}) {
    return {
      ...initialPipelineInfoState(),
      params: initialParamsState(this.getPipelineInfo(PARAM_SPECS, { props })),
      resources: initialResourcesState(
        this.getPipelineInfo(RESOURCE_SPECS, { props })
      ),
      invalid: {
        [NAMESPACE]: false,
        [PIPELINE_REF]: false
      },
      validationError: false
    };
  }

  resetForm() {
    this.setState((state, props) => this.initialState({ props }));
  }

  resetParamsState() {
    this.setState((state, props) => ({
      params: initialParamsState(
        this.getPipelineInfo(PARAM_SPECS, { state, props })
      )
    }));
  }

  resetResourcesState() {
    this.setState((state, props) => ({
      resources: initialResourcesState(this.getPipelineInfo(RESOURCE_SPECS), {
        state,
        props
      })
    }));
  }

  // initializeDynamicState() {
  //   console.log(this.state);
  // }

  // getNamespace() {
  //   // Use props when pipelineRef is supplied
  //   return this.props.pipelineRef ? this.props.namespace : this.state.namespace;
  // }

  // getPipelineRef() {
  //   // Use props when pipelineRef is supplied
  //   return this.props.pipelineRef || this.state.pipelineRef;
  // }

  // getParamSpecs() {
  //   // Use props when pipelineRef is supplied
  //   return this.props.pipelineRef
  //     ? this.props.paramSpecs
  //     : this.state.paramSpecs;
  // }

  // getResourceSpecs() {
  //   // Use props when pipelineRef is supplied
  //   return this.props.pipelineRef
  //     ? this.props.resourceSpecs
  //     : this.state.resourceSpecs;
  // }

  // getPipelineError() {
  //   // Use props when pipelineRef is supplied
  //   return this.props.pipelineRef
  //     ? this.props.pipelineError
  //     : this.state.pipelineError;
  // }

  // componentDidUpdate(prevProps) {
  //   if (this.props.pipelineRef !== prevProps.pipelineRef) {
  //     this.resetPipeline();
  //   }

  //   if (this.props.namespace !== prevProps.namespace) {
  //     this.resetNamespace();
  //   }
  // }

  // static getDerivedStateFromProps(props, state) {
  //   // console.log('GET DERIVED STATE FROM PROPS');
  //   let updateState = {};
  //   if (props.resourcesSpec && props.resourcesSpec !== state.resourcesSpec) {
  //     updateState = {
  //       ...updateState,
  //       resourcesSpec: props.resourcesSpec,
  //       resources: initialResourcesState(props.resourcesSpec)
  //     };
  //   }
  //   if (props.paramsSpec && props.paramsSpec !== state.paramsSpec) {
  //     updateState = {
  //       ...updateState,
  //       paramsSpec: props.paramsSpec,
  //       params: initialParamsState(props.paramsSpec)
  //     };
  //   }
  //   if (props.errorGettingPipeline !== state.errorGettingPipeline) {
  //     updateState = {
  //       ...updateState,
  //       errorGettingPipeline: props.errorGettingPipeline
  //     };
  //   }
  //   if (Object.keys(updateState).length !== 0) {
  //     return updateState;
  //   }
  //   return null;
  // }

  // handleChange({ name, value }) {
  //   this.checkValidation(name, value);
  //   this.setState(state => {
  //     return {
  //       [name]: {
  //         ...state[name],
  //         value
  //       }
  //     };
  //   });
  // }

  // handlePipelineChange(value) {
  //   this.handleChange({ name: 'pipeline', value });
  //   this.setState(state => {
  //     const pipeline = getPipeline(getStore().getState(), {
  //       name: value,
  //       namespace: state.namespace.value
  //     });
  //     if (pipeline) {
  //       return {
  //         resourcesSpec: pipeline.spec.resources,
  //         resources: initialResourcesState(pipeline.spec.resources),
  //         paramsSpec: pipeline.spec.params,
  //         params: initialParamsState(pipeline.spec.params),
  //         errorGettingPipeline: false
  //       };
  //     }
  //     return {
  //       errorGettingPipeline: true
  //     };
  //   });
  // }

  // handleNamespaceChange(value) {
  //   if (this.state.namespace.value !== value) {
  //     this.setState(state => {
  //       return {
  //         pipeline: {
  //           ...state.pipeline,
  //           value: ''
  //         },
  //         serviceAccount: {
  //           ...state.serviceAccount,
  //           value: ''
  //         }
  //       };
  //     });
  //   }
  //   this.handleChange({ name: 'namespace', value });
  // }

  // handleResourceChange(key, value) {
  //   this.setState(state => ({
  //     resources: {
  //       ...state.resources,
  //       [key]: value
  //     }
  //   }));
  // }

  // handleParamChange(key, value) {
  //   this.setState(state => ({
  //     params: {
  //       ...state.params,
  //       [key]: value
  //     }
  //   }));
  // }

  // handleSubmit(event) {
  //   event.preventDefault();
  //   // console.log('submit state:');
  //   // console.log(this.state);

  //   if (!this.checkFormValidation()) {
  //     this.setState({
  //       submitValidationError: true
  //     });
  //     return;
  //   }
  //   this.setState({
  //     errorMessage: '',
  //     submitValidationError: false
  //   });

  //   // TODO payload
  //   // const payload = {
  //   //   pipelinename: this.state.pipeline.value,
  //   //   serviceaccount: this.state.serviceAccount.value
  //   // };
  //   const payload = {};
  //   const promise = createPipelineRun(payload, this.state.pipeline.value);
  //   promise
  //     .then(headers => {
  //       const url = headers.get('Content-Location');
  //       const pipelineRunName = url.substring(url.lastIndexOf('/') + 1);
  //       const finalURL = `/namespaces/${this.state.pipeline.value}/pipelines/${
  //         this.state.pipeline.value
  //       }/runs/${pipelineRunName}`;
  //       this.reset();
  //       this.props.onSuccess({ name: pipelineRunName, url: finalURL });
  //     })
  //     .catch(error => {
  //       error.response.text().then(text => {
  //         let errorMessage = text;
  //         if (text === '') {
  //           const statusCode = error.response.status;
  //           switch (statusCode) {
  //             case 400:
  //               errorMessage = 'bad request';
  //               break;
  //             case 412:
  //               errorMessage = 'pipeline not found';
  //               break;
  //             default:
  //               errorMessage = `error code ${statusCode}`;
  //           }
  //         }
  //         this.setState({ errorMessage });
  //       });
  //     });
  // }

  // handleClose() {
  //   this.reset();
  //   this.props.onClose();
  // }

  // initialState() {
  //   const {
  //     pipelineRef,
  //     namespace,
  //     resourcesSpec,
  //     paramsSpec,
  //     errorGettingPipeline
  //   } = this.props;
  //   // console.log('INITIAL STATE props:');
  //   return {
  //     namespace: {
  //       value: namespace && namespace !== ALL_NAMESPACES ? namespace : '',
  //       invalid: false
  //     },
  //     pipeline: {
  //       value: pipelineRef || '',
  //       invalid: false
  //     },
  //     serviceAccount: {
  //       value: '',
  //       invalid: false
  //     },
  //     resourcesSpec,
  //     resources: initialResourcesState(resourcesSpec),
  //     paramsSpec,
  //     params: initialParamsState(paramsSpec),
  //     errorMessage: '',
  //     errorGettingPipeline,
  //     submitValidationError: false
  //   };
  // }

  // checkValidation(key, value) {
  //   const { required, regexp } = formValidation[key];
  //   const invalid =
  //     (required && value === '') ||
  //     (regexp && !regexp.test(value) && (required || value !== ''));
  //   this.setState(state => {
  //     return {
  //       [key]: {
  //         ...state[key],
  //         invalid
  //       }
  //     };
  //   });
  //   return !invalid;
  // }

  // checkFormValidation() {
  //   const reducer = (acc, key) => {
  //     return this.checkValidation(key, this.state[key].value) && acc;
  //   };
  //   return Object.keys(formValidation).reduce(reducer, true);
  // }

  // reset() {
  //   this.setState(this.initialState());
  // }

  // resetPipeline() {
  //   this.setState((state, props) => ({
  //     pipeline: {
  //       ...state.pipeline,
  //       value: props.pipelineRef || ''
  //     },
  //     resourcesSpec: props.resourcesSpec,
  //     resources: initialResourcesState(props.resourcesSpec),
  //     paramsSpec: props.paramsSpec,
  //     params: initialParamsState(props.paramsSpec),
  //     errorGettingPipeline: false
  //   }));
  // }

  // resetNamespace() {
  //   this.setState((state, props) => ({
  //     namespace: {
  //       ...state.namespace,
  //       value:
  //         props.namespace && props.namespace !== ALL_NAMESPACES
  //           ? props.namespace
  //           : ''
  //     }
  //   }));
  //   this.resetPipeline();
  // }

  render() {
    const { open } = this.props;
    const namespace = this.getPipelineInfo(NAMESPACE);
    const pipelineRef = this.getPipelineInfo(PIPELINE_REF);
    const pipelineInfoDisabled = this.getPipelineInfo(DISABLED);
    const resourceSpecs = this.getPipelineInfo(RESOURCE_SPECS);
    const paramSpecs = this.getPipelineInfo(PARAM_SPECS);
    return (
      <Form>
        <Modal
          className="create-pipelinerun"
          open={open}
          modalHeading="Create PipelineRun"
          modalLabel={this.getPipelineInfo(PIPELINE_REF)}
          primaryButtonText="Submit"
          secondaryButtonText="Cancel"
          onRequestSubmit={this.handleSubmit}
          onRequestClose={this.handleClose}
          onSecondarySubmit={this.handleClose}
        >
          {this.getPipelineInfo(PIPELINE_ERROR) && (
            <InlineNotification
              kind="error"
              title="Error retrieving Pipeline information"
              subtitle=""
            />
          )}
          {this.state.validationError && (
            <InlineNotification
              kind="error"
              title="Please fix the fields with errors, then resubmit"
              subtitle=""
            />
          )}
          <FormGroup legendText="">
            <NamespacesDropdown
              id="create-pipelinerun--namespaces-dropdown"
              disabled={pipelineInfoDisabled}
              invalid={this.state.invalid[NAMESPACE]}
              invalidText="Namespace cannot be empty"
              selectedItem={namespace ? { id: namespace, text: namespace } : ''}
              onChange={this.handleNamespaceChange}
            />
            <PipelinesDropdown
              id="create-pipelinerun--pipelines-dropdown"
              namespace={namespace}
              disabled={pipelineInfoDisabled}
              invalid={this.state.invalid[PIPELINE_REF]}
              invalidText="Pipeline cannot be empty"
              selectedItem={
                pipelineRef ? { id: pipelineRef, text: pipelineRef } : ''
              }
              onChange={this.handlePipelineChange}
            />
          </FormGroup>
          {resourceSpecs && resourceSpecs.length !== 0 && (
            <FormGroup legendText="Resources">
              {resourceSpecs.map(resourceSpec => (
                <PipelineResourcesDropdown
                  id={`create-pipelinerun--prs-dropdown-${resourceSpec.name}`}
                  titleText={resourceSpec.name}
                  helperText={resourceSpec.type}
                  type={resourceSpec.type}
                  namespace={namespace}
                  selectedItem={(() => {
                    const value = this.state.resources[resourceSpec.name];
                    return value ? { id: value, text: value } : '';
                  })()}
                  onChange={({ selectedItem: { text } }) =>
                    this.handleResourceChange(resourceSpec.name, text)
                  }
                />
              ))}
            </FormGroup>
          )}
          {paramSpecs && paramSpecs.length !== 0 && (
            <FormGroup legendText="Params">
              {paramSpecs.map(paramSpec => (
                <TextInput
                  id={`create-pipelinerun--prs-param-${paramSpec.name}`}
                  labelText={paramSpec.name}
                  helperText={paramSpec.description}
                  placeholder={paramSpec.default}
                  value={this.state.params[paramSpec.name] || ''}
                  onChange={({ target: { value } }) =>
                    this.handleParamChange(paramSpec.name, value)
                  }
                />
              ))}
            </FormGroup>
          )}
        </Modal>
      </Form>
    );
  }

  // render() {
  //   // console.log('RENDER state:');
  //   // console.log(this.state);
  //   // console.log(this.props);
  //   const { pipelineRef, open } = this.props;
  //   const {
  //     errorMessage,
  //     pipeline: { value: pipelineValue },
  //     namespace: { value: namespaceValue }
  //   } = this.state;

  //   return (
  //     <Form onSubmit={this.handleSubmit}>
  //       <ComposedModal
  //         className="create-pipelinerun"
  //         onClose={this.handleClose}
  //         open={open}
  //       >
  //         <ModalHeader
  //           id="create-pipelinerun--header"
  //           title="Create PipelineRun"
  //           label={pipelineRef}
  //           closeModal={this.handleClose}
  //         />
  //         <ModalBody>
  //           {errorMessage !== '' && (
  //             <InlineNotification
  //               kind="error"
  //               title="Error creating PipelineRun"
  //               subtitle={errorMessage}
  //             />
  //           )}
  //           {this.state.submitValidationError && (
  //             <InlineNotification
  //               kind="error"
  //               title="Unable to submit"
  //               subtitle="Please fix the fields with errors"
  //             />
  //           )}
  //           {this.state.errorGettingPipeline && (
  //             <InlineNotification
  //               kind="error"
  //               title="Error retrieving Pipeline information"
  //               subtitle=""
  //             />
  //           )}
  //           <FormGroup legendText="">
  //             <NamespacesDropdown
  //               id="namespaces-dropdown"
  //               selectedItem={
  //                 namespaceValue !== ''
  //                   ? { id: namespaceValue, text: namespaceValue }
  //                   : ''
  //               }
  //               onChange={({ selectedItem }) =>
  //                 this.handleNamespaceChange(selectedItem.text)
  //               }
  //               disabled={!!pipelineRef}
  //               invalid={this.state.namespace.invalid}
  //               invalidText="Namespace cannot be empty"
  //             />
  //             <PipelinesDropdown
  //               id="dropdown-pipeline"
  //               namespace={namespaceValue}
  //               selectedItem={
  //                 pipelineValue !== ''
  //                   ? { id: pipelineValue, text: pipelineValue }
  //                   : ''
  //               }
  //               onChange={({ selectedItem }) =>
  //                 this.handlePipelineChange(selectedItem.text)
  //               }
  //               disabled={!!pipelineRef}
  //               invalid={this.state.pipeline.invalid}
  //               invalidText="Pipeline cannot be empty"
  //             />
  //             <ServiceAccountsDropdown
  //               id="dropdown-service-account"
  //               namespace={namespaceValue}
  //               selectedItem={
  //                 this.state.serviceAccount.value !== ''
  //                   ? {
  //                       id: this.state.serviceAccount.value,
  //                       text: this.state.serviceAccount.value
  //                     }
  //                   : ''
  //               }
  //               onChange={({ selectedItem }) =>
  //                 this.handleChange({
  //                   name: 'serviceAccount',
  //                   value: selectedItem.text
  //                 })
  //               }
  //               invalid={this.state.serviceAccount.invalid}
  //               invalidText="Service Account cannot be empty"
  //             />
  //           </FormGroup>
  //           {this.state.resourcesSpec && (
  //             <FormGroup legendText="Resources">
  //               {this.state.resourcesSpec.map(resource => (
  //                 <PipelineResourcesDropdown
  //                   id={`${resource.name}-resources-dropdown`}
  //                   titleText={resource.name}
  //                   helperText={resource.type}
  //                   namespace={namespaceValue}
  //                   type={resource.type}
  //                   onChange={({ selectedItem }) =>
  //                     this.handleResourceChange(
  //                       resource.name,
  //                       selectedItem.text
  //                     )
  //                   }
  //                   selectedItem={
  //                     this.state.resources[resource.name] !== ''
  //                       ? {
  //                           id: this.state.resources[resource.name],
  //                           text: this.state.resources[resource.name]
  //                         }
  //                       : ''
  //                   }
  //                 />
  //               ))}
  //             </FormGroup>
  //           )}
  //           {this.state.paramsSpec && (
  //             <FormGroup legendText="Params">
  //               {this.state.paramsSpec.map(param => (
  //                 <TextInput
  //                   id={`${param.name}-param-text-input`}
  //                   labelText={param.name}
  //                   helperText={param.description}
  //                   placeholder={param.default}
  //                   onChange={payload =>
  //                     this.handleParamChange(param.name, payload.target.value)
  //                   }
  //                   value={this.state.params[param.name]}
  //                 />
  //               ))}
  //             </FormGroup>
  //           )}
  //         </ModalBody>
  //         <ModalFooter>
  //           <Button kind="secondary" onClick={this.handleClose}>
  //             Cancel
  //           </Button>
  //           <Button kind="primary" type="submit">
  //             Submit
  //           </Button>
  //         </ModalFooter>
  //       </ComposedModal>
  //     </Form>
  //   );
  // }
}

CreatePipelineRun.defaultProps = {
  open: false,
  onClose: () => {},
  onSuccess: () => {}
};

const mapStateToProps = (state, ownProps) => {
  const { pipelineRef, namespace } = ownProps;
  return parsePipelineInfo(state, pipelineRef, namespace);
};

export default connect(mapStateToProps)(CreatePipelineRun);
