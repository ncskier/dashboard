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
import { Dropdown, DropdownSkeleton } from 'carbon-components-react';

import { getServiceAccounts, isFetchingServiceAccounts } from '../../reducers';
import { fetchServiceAccounts } from '../../actions/serviceAccounts';

export class ServiceAccountsDropdown extends React.Component {
  componentDidMount() {
    this.props.fetchServiceAccounts();
  }

  render() {
    const { loading, ...dropdownProps } = this.props;
    if (loading) {
      return <DropdownSkeleton {...dropdownProps} />;
    }
    return <Dropdown {...dropdownProps} />;
  }
}

ServiceAccountsDropdown.defaultProps = {
  items: [],
  loading: true
};

function mapStateToProps(state) {
  return {
    items: getServiceAccounts(state),
    loading: isFetchingServiceAccounts(state)
  };
}

const mapDispatchToProps = {
  fetchServiceAccounts
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ServiceAccountsDropdown);
