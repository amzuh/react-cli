import React from 'react';
import PropTypes from 'prop-types';

const Foo = () => {
    useEffect(() => {
        return () => {
            null
        };
    }, []);

    return (<div>Foo</div>);
}

Foo.propTypes = {};

export default Foo;
