import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const Foo = () => {
    return (<div>Foo</div>);
}

Foo.propTypes = {};

const mapStateToProps = state => ({});

const FooContainer = connect(mapStateToProps)(Foo);

export default FooContainer;

