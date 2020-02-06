import React from 'react';
import PropTypes from 'prop-types';

class Foo extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <div>Foo</div>;
    }
}

Foo.propTypes = {};

export default Foo;
