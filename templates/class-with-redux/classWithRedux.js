import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

class Foo extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <div>Foo</div>;
    }
}

Foo.propTypes = {};

const mapStateToProps = state => ({});

const FooContainer = connect(mapStateToProps)(Foo);

export default FooContainer;

